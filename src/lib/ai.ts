import { Language, PetitionCategory } from '@/types';
import { getSupabaseAdmin } from '@/lib/supabase';

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = 'llama-3.3-70b-versatile';

interface LegalDocument {
  id: string;
  act_name: string;
  section_number: string | null;
  title: string;
  content: string;
  plain_language_summary: string | null;
  keywords: string[];
  categories: string[];
  jurisdiction: string;
  source_url: string | null;
  similarity?: number;
}

/**
 * Generate embedding for text (simplified version for server-side)
 */
async function generateEmbedding(text: string): Promise<number[]> {
  // Use HuggingFace API if key exists
  const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
  
  if (HF_API_KEY) {
    // Retry logic for model warm-up
    const maxRetries = 3;
    const retryDelay = [2000, 5000, 10000]; // 2s, 5s, 10s
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const response = await fetch(
          'https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2',
          {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${HF_API_KEY}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              inputs: text,
              options: { wait_for_model: true }
            }),
          }
        );

        if (response.status === 503 || response.status === 410) {
          // Model is loading, wait and retry
          if (attempt < maxRetries - 1) {
            console.log(`[Embedding] Model loading, waiting ${retryDelay[attempt]}ms before retry ${attempt + 1}...`);
            await new Promise(resolve => setTimeout(resolve, retryDelay[attempt]));
            continue;
          }
          throw new Error(`HuggingFace API error after ${maxRetries} attempts`);
        }

        if (response.ok) {
          const embedding = await response.json();
          console.log(`[Embedding] Query embedding generated successfully (attempt ${attempt + 1})`);
          return embedding;
        }
        
        throw new Error(`HuggingFace API error: ${response.statusText}`);
      } catch (error) {
        if (attempt === maxRetries - 1) {
          console.error('HuggingFace embedding error after all retries:', error);
          break; // Fall through to fallback
        }
        console.log(`[Embedding] Attempt ${attempt + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay[attempt]));
      }
    }
  }

  // Fallback: simple hash-based embedding
  console.log('[Embedding] Using fallback hash-based embedding');
  const embedding = new Array(384).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  
  words.forEach((word, idx) => {
    for (let i = 0; i < word.length; i++) {
      const charCode = word.charCodeAt(i);
      const position = (idx * 37 + i * 17 + charCode) % 384;
      embedding[position] += (charCode / 255) * 0.1;
    }
  });
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
}

// Helper function to call Groq API
async function callGroqAPI(prompt: string): Promise<string> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error(
      'Groq API key is missing. Please add GROQ_API_KEY to your .env.local file. ' +
      'Get your key from: https://console.groq.com/'
    );
  }

  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: GROQ_MODEL,
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2048,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(`Groq API error: ${response.statusText} - ${JSON.stringify(errorData)}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || '';
}

export interface GeneratePetitionRequest {
  category: PetitionCategory;
  problemDescription: string;
  personalImpact: string;
  desiredChange: string;
  location: string;
  language: Language;
}

export interface AIRightsRequest {
  query: string;
  language: Language;
  category?: PetitionCategory;
}

/**
 * Search for relevant legal documents using RAG system
 */
async function searchLegalDocuments(
  query: string,
  category?: PetitionCategory
): Promise<LegalDocument[]> {
  try {
    console.log('[RAG] Starting legal document search for query:', query.substring(0, 50));
    const supabaseAdmin = getSupabaseAdmin();
    
    // Generate embedding for the query
    console.log('[RAG] Generating query embedding...');
    const queryEmbedding = await generateEmbedding(query);
    console.log('[RAG] Embedding generated, length:', queryEmbedding.length);
    
    // Build the RPC call parameters
    const rpcParams: any = {
      query_embedding: queryEmbedding,
      match_threshold: 0.0, // Lowered for fallback embeddings
      match_count: 5,
    };

    // Add category filter if provided
    if (category) {
      rpcParams.filter_categories = [category];
    }

    // Call the search function
    console.log('[RAG] Calling search_legal_documents RPC...');
    const { data, error } = await supabaseAdmin.rpc(
      'search_legal_documents',
      rpcParams
    );

    if (error) {
      console.error('[RAG] Supabase search error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      // Check for common errors
      if (error.message?.includes('function') && error.message?.includes('does not exist')) {
        console.error('[RAG] ❌ ERROR: The search_legal_documents function does not exist in Supabase!');
        console.error('[RAG] → You need to apply database migrations:');
        console.error('[RAG] → 1. Install Supabase CLI: npm install -g supabase');
        console.error('[RAG] → 2. Start local Supabase: supabase start');
        console.error('[RAG] → 3. Apply migrations: supabase db reset');
        console.error('[RAG] → Or deploy to remote: supabase db push');
      }
      
      return [];
    }

    console.log('[RAG] Search successful, found', data?.length || 0, 'documents');
    return data || [];
  } catch (error) {
    console.error('[RAG] Error searching legal documents:', error);
    if (error instanceof Error) {
      console.error('[RAG] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n')[0]
      });
    }
    return [];
  }
}

/**
 * Format legal documents for AI prompt
 */
function formatLegalDocuments(documents: LegalDocument[]): string {
  if (documents.length === 0) {
    return 'NO RELEVANT DOCUMENTS FOUND IN DATABASE';
  }

  return documents
    .map((doc, index) => {
      const section = doc.section_number ? ` - Section ${doc.section_number}` : '';
      const summary = doc.plain_language_summary
        ? `\n  Plain Language: ${doc.plain_language_summary}`
        : '';
      const url = doc.source_url ? `\n  Source: ${doc.source_url}` : '';
      const keywords = doc.keywords?.length > 0 
        ? `\n  Keywords: ${doc.keywords.join(', ')}` 
        : '';
      
      return `
DOCUMENT ${index + 1}:
  Act: ${doc.act_name}${section}
  Title: ${doc.title}
  Jurisdiction: ${doc.jurisdiction}
  Categories: ${doc.categories?.join(', ') || 'None'}${keywords}
  
  Full Legal Text:
  ${doc.content}${summary}${url}
`;
    })
    .join('\n---\n');
}

/**
 * Generate a professionally formatted petition using AI
 */
export async function generatePetition(request: GeneratePetitionRequest): Promise<string> {
  const prompt = `You are a legal assistant helping Indian citizens create formal petitions to government authorities.

Generate a professional petition in ${getLanguageName(request.language)} language with the following details:

Category: ${request.category}
Problem: ${request.problemDescription}
Personal Impact: ${request.personalImpact}
Desired Resolution: ${request.desiredChange}
Location: ${request.location}

REQUIREMENTS:
1. Use formal, respectful tone appropriate for government communication
2. Include relevant Indian laws and constitutional rights if applicable
3. Structure: Opening address, problem statement, impact, legal basis, request for action, closing
4. Keep it concise (300-500 words)
5. Make it specific and actionable
6. Use ${getLanguageName(request.language)} language throughout
7. Include proper salutation and closing

Generate ONLY the petition text, no additional commentary.`;

  return await callGroqAPI(prompt);
}

/**
 * AI Rights Assistant - Provide legal guidance using RAG
 */
export async function getAIRightsGuidance(request: AIRightsRequest) {
  try {
    console.log('[RAG] getAIRightsGuidance called with query:', request.query.substring(0, 50));
    
    // Step 1: Search for relevant legal documents using RAG
    console.log('[RAG] Step 1: Searching legal documents...');
    const legalDocuments = await searchLegalDocuments(request.query, request.category);
    console.log('[RAG] Step 1 complete: Found', legalDocuments.length, 'documents');
    
    const documentsContext = formatLegalDocuments(legalDocuments);
    console.log('[RAG] Documents formatted, context length:', documentsContext.length, 'characters');

    // Step 2: Generate response using ONLY the retrieved documents
    console.log('[RAG] Step 2: Calling Groq AI...');
    const prompt = `You are PETICIA, a legal rights explanation assistant for India.

ROLE AND LIMITATIONS
- You are NOT a lawyer.
- You do NOT provide legal advice.
- You ONLY explain verified Indian laws from the provided legal documents.
- You must base answers EXCLUSIVELY on the LEGAL DOCUMENTS provided below.

CRITICAL SOURCE CONSTRAINT - READ CAREFULLY
- You MUST use ONLY the legal documents provided in the "RETRIEVED LEGAL DOCUMENTS" section below.
- You MUST cite the EXACT Act name and Section number from the provided documents.
- If the provided documents DO NOT contain information relevant to the user's query, you MUST respond:
  "I could not find relevant legal provisions in my verified database for this scenario. Please consult a qualified lawyer for specific guidance on this matter."
- DO NOT use any information from your training data.
- DO NOT invent, assume, or guess any law not explicitly provided below.

RETRIEVED LEGAL DOCUMENTS (YOUR ONLY SOURCE):
${documentsContext}

USER CONTEXT
- The user is an Indian citizen asking: ${request.query}
${request.category ? `- Category: ${request.category}` : ''}
- The user may not understand legal terminology.
- Convert legal language into clear, simple, and actionable steps.
- Response must be in ${getLanguageName(request.language)} language.

MANDATORY RESPONSE FORMAT
You MUST respond using this structure exactly:

1. YOUR LEGAL RIGHTS
   - Use ONLY the legal documents provided above
   - For each applicable law, state: "[Act Name] - Section [Number]"
   - Explain what the law says in simple language
   - Include the source URL if available
   - If no relevant document is provided, state: "No specific legal provision found in the database"

2. WHAT YOU SHOULD DO NOW
   - Base recommendations ONLY on the procedures mentioned in the provided documents
   - Provide clear, step-by-step lawful actions
   - Steps must be practical and realistic
   - Include documentation typically required
   - Do NOT suggest actions not supported by the provided documents

3. WHERE TO COMPLAIN OR REPORT
   - Use authority information from the provided documents if available
   - If not mentioned in documents, state: "Authority information not available in database"
   - Specify jurisdiction level (Municipal / District / State / Central / National)

4. IMPORTANT DISCLAIMERS
   - State: "This information is based on legal documents retrieved from our verified database"
   - State: "This is general legal information only, not legal advice"
   - State: "For your specific situation, consult a qualified lawyer"
   - Mention: "Laws may have been recently amended"

5. SOURCES
   - List all documents used with Act name, Section number, and source URL
   - Format: "• [Act Name] - Section [Number]: [Source URL]"

LANGUAGE RULE
- Use simple, clear ${getLanguageName(request.language)} language
- Avoid legal jargon unless unavoidable
- If technical terms are needed, explain them in parentheses

CRITICAL REMINDER
- If the retrieved documents are not relevant to the query, DO NOT make up information
- Only use facts explicitly stated in the documents above
- Admit when the database doesn't have relevant information

KEEP YOUR RESPONSE UNDER 600 WORDS.

You must follow all the above rules without exception.`;

    const response = await callGroqAPI(prompt);
    console.log('[RAG] Step 2 complete: Received response from Groq AI, length:', response.length, 'characters');
    return response;
  } catch (error) {
    console.error('[RAG] ERROR in getAIRightsGuidance:', error);
    if (error instanceof Error) {
      console.error('[RAG] Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack?.split('\n').slice(0, 3).join('\n')
      });
    }
    throw error;
  }
}

/**
 * Suggest authorities based on petition category and location
 */
export async function suggestAuthorities(
  category: PetitionCategory,
  state: string,
  city: string
): Promise<string> {
  const prompt = `Suggest the correct government authority for this complaint:

Category: ${category}
State: ${state}
City: ${city}

Provide:
1. Specific authority/officer designation (e.g., Municipal Commissioner, District Collector)
2. Department name
3. Typical way to find their contact (e.g., city municipal website)

Keep response brief and actionable.`;

  return await callGroqAPI(prompt);
}

/**
 * Generate email content for authority
 */
export async function generateAuthorityEmail(
  petitionTitle: string,
  petitionContent: string,
  signatureCount: number,
  location: string
): Promise<{ subject: string; body: string }> {
  const prompt = `Generate a formal email to send to a government authority.

Petition Title: ${petitionTitle}
Location: ${location}
Signatures: ${signatureCount} verified citizens

Base Content:
${petitionContent}

Create:
1. Professional email subject line
2. Email body that includes:
   - Brief introduction
   - The petition content
   - Emphasis on ${signatureCount} citizens supporting this
   - Polite request for action
   - Contact information placeholder

Format as JSON: {"subject": "...", "body": "..."}`;

  const text = await callGroqAPI(prompt);
  
  try {
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
  } catch (e) {
    console.error('Error parsing AI response:', e);
  }

  // Fallback
  return {
    subject: `Citizen Petition: ${petitionTitle}`,
    body: petitionContent
  };
}

function getLanguageName(code: Language): string {
  const names: Record<Language, string> = {
    en: 'English',
    hi: 'Hindi (हिंदी)',
    ta: 'Tamil (தமிழ்)',
    te: 'Telugu (తెలుగు)',
    bn: 'Bengali (বাংলা)',
    mr: 'Marathi (मराठी)',
    gu: 'Gujarati (ગુજરાતી)',
    kn: 'Kannada (ಕನ್ನಡ)',
    ml: 'Malayalam (മലയാളം)',
    pa: 'Punjabi (ਪੰਜਾਬੀ)',
    or: 'Odia (ଓଡ଼ିଆ)',
  };
  return names[code] || 'English';
}
