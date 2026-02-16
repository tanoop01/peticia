import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Generate embedding for search query
 */
async function generateEmbedding(text: string): Promise<number[]> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/rag/embed`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error('Failed to generate embedding');
  }

  const { embedding } = await response.json();
  return embedding;
}

/**
 * POST /api/rag/search
 * Search legal documents using semantic similarity
 */
export async function POST(request: NextRequest) {
  try {
    const { 
      query, 
      categories,
      jurisdiction,
      limit = 5,
      threshold = 0.5
    } = await request.json();

    if (!query || typeof query !== 'string') {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();

    // Generate embedding for the query
    const queryEmbedding = await generateEmbedding(query);

    // Search using the PostgreSQL function
    const { data: results, error: searchError } = await supabaseAdmin
      .rpc('search_legal_documents', {
        query_embedding: queryEmbedding,
        match_threshold: threshold,
        match_count: limit,
        filter_categories: categories || null,
        filter_jurisdiction: jurisdiction || null,
      });

    if (searchError) {
      throw searchError;
    }

    return NextResponse.json({
      query,
      results: results || [],
      count: results?.length || 0
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search documents' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/rag/search?q=query&category=criminal
 * Search with query parameters
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get('q');
    const category = searchParams.get('category');
    const jurisdiction = searchParams.get('jurisdiction');
    const limit = parseInt(searchParams.get('limit') || '5');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter "q" is required' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const queryEmbedding = await generateEmbedding(query);

    const { data: results, error: searchError } = await supabaseAdmin
      .rpc('search_legal_documents', {
        query_embedding: queryEmbedding,
        match_threshold: 0.5,
        match_count: limit,
        filter_categories: category ? [category] : null,
        filter_jurisdiction: jurisdiction || null,
      });

    if (searchError) {
      throw searchError;
    }

    return NextResponse.json({
      query,
      results: results || [],
      count: results?.length || 0
    });
  } catch (error) {
    console.error('Error searching documents:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to search documents' },
      { status: 500 }
    );
  }
}
