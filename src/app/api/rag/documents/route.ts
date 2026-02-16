import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/rag/documents
 * List all legal documents (paginated)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const status = searchParams.get('status') || 'active';
    
    const offset = (page - 1) * limit;
    const supabaseAdmin = getSupabaseAdmin();

    let query = supabaseAdmin
      .from('legal_documents')
      .select('*', { count: 'exact' })
      .eq('status', status)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (category) {
      query = query.contains('categories', [category]);
    }

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return NextResponse.json({
      documents: data || [],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit),
      }
    });
  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/rag/documents
 * Create a new legal document
 */
export async function POST(request: NextRequest) {
  try {
    const document = await request.json();

    // Validate required fields
    if (!document.act_name || !document.title || !document.content) {
      return NextResponse.json(
        { error: 'Missing required fields: act_name, title, content' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Insert document (without embedding initially)
    const { data, error } = await supabaseAdmin
      .from('legal_documents')
      .insert({
        act_name: document.act_name,
        section_number: document.section_number,
        chapter: document.chapter,
        title: document.title,
        content: document.content,
        plain_language_summary: document.plain_language_summary,
        keywords: document.keywords || [],
        categories: document.categories || [],
        jurisdiction: document.jurisdiction || 'Central',
        state: document.state,
        effective_from: document.effective_from,
        source_url: document.source_url,
        government_gazette_reference: document.government_gazette_reference,
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Generate embedding asynchronously (optional - can be done in batch later)
    if (process.env.HUGGINGFACE_API_KEY) {
      fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/rag/embed`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: `${document.title}\n\n${document.plain_language_summary || document.content}` 
        }),
      })
        .then(res => res.json())
        .then(({ embedding }) => {
          return supabaseAdmin
            .from('legal_documents')
            .update({ embedding })
            .eq('id', data.id);
        })
        .catch(err => console.error('Failed to generate embedding:', err));
    }

    return NextResponse.json({ 
      message: 'Legal document created successfully',
      document: data 
    });
  } catch (error) {
    console.error('Error creating document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create document' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/rag/documents?id=uuid
 * Delete a legal document
 */
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Document ID is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    const { error } = await supabaseAdmin
      .from('legal_documents')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ 
      message: 'Legal document deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting document:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete document' },
      { status: 500 }
    );
  }
}
