import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Generate embeddings using Groq's embedding model
 * Note: Groq doesn't have a dedicated embedding endpoint yet,
 * so we'll use a workaround with a small model to generate semantic vectors
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    throw new Error('GROQ_API_KEY is required');
  }

  // For now, we'll use a simple approach: convert text to a fixed-size vector
  // In production, you'd use a proper embedding model or sentence-transformers API
  // This is a placeholder that creates a consistent 384-dimensional vector
  
  // Option 1: Use Hugging Face Inference API (free tier available)
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
          throw new Error(`HuggingFace API error after ${maxRetries} attempts: Model unavailable`);
        }

        if (!response.ok) {
          throw new Error(`HuggingFace API error: ${response.statusText}`);
        }

        const embedding = await response.json();
        console.log(`[Embedding] Successfully generated embedding (attempt ${attempt + 1})`);
        return embedding;
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

  // Fallback: Simple hash-based embedding (for development only)
  // This creates consistent vectors but won't have semantic meaning
  return createSimpleEmbedding(text, 384);
}

/**
 * Simple deterministic embedding for development
 * NOT suitable for production - use real embeddings!
 */
function createSimpleEmbedding(text: string, dimensions: number): number[] {
  const embedding = new Array(dimensions).fill(0);
  const words = text.toLowerCase().split(/\s+/);
  
  words.forEach((word, idx) => {
    for (let i = 0; i < word.length; i++) {
      const charCode = word.charCodeAt(i);
      const position = (idx * 37 + i * 17 + charCode) % dimensions;
      embedding[position] += (charCode / 255) * 0.1;
    }
  });
  
  // Normalize
  const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
  return embedding.map(val => magnitude > 0 ? val / magnitude : 0);
}

/**
 * POST /api/rag/embed
 * Generate embedding for a text
 */
export async function POST(request: NextRequest) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    const embedding = await generateEmbedding(text);

    return NextResponse.json({ embedding });
  } catch (error) {
    console.error('Error generating embedding:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate embedding' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/rag/embed
 * Generate embeddings for all legal documents that don't have them
 */
export async function PUT(request: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    // Get documents without embeddings
    const { data: documents, error: fetchError } = await supabaseAdmin
      .from('legal_documents')
      .select('id, title, content, plain_language_summary')
      .is('embedding', null)
      .limit(100); // Process 100 at a time

    if (fetchError) {
      throw fetchError;
    }

    if (!documents || documents.length === 0) {
      return NextResponse.json({ 
        message: 'No documents to process',
        processed: 0 
      });
    }

    let processed = 0;
    const errors: any[] = [];

    for (const doc of documents) {
      try {
        // Combine title and content for embedding
        const textToEmbed = `${doc.title}\n\n${doc.plain_language_summary || doc.content}`;
        const embedding = await generateEmbedding(textToEmbed);

        // Update document with embedding
        const { error: updateError } = await supabaseAdmin
          .from('legal_documents')
          .update({ embedding })
          .eq('id', doc.id);

        if (updateError) {
          errors.push({ id: doc.id, error: updateError.message });
        } else {
          processed++;
        }

        // Add delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      } catch (error) {
        errors.push({ id: doc.id, error: error instanceof Error ? error.message : 'Unknown error' });
      }
    }

    return NextResponse.json({
      message: `Processed ${processed} documents`,
      processed,
      total: documents.length,
      errors: errors.length > 0 ? errors : undefined
    });
  } catch (error) {
    console.error('Error generating embeddings:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}
