import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Search legal documents using semantic similarity (feature disabled)
 */
export async function POST(request: NextRequest) {
  try {
    const { query, category, matchThreshold = 0.7, matchCount = 5 } = await request.json();

    if (!query) {
      return NextResponse.json(
        { error: 'Query is required' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Semantic search is not configured. This feature requires an AI service.' },
      { status: 501 }
    );
  } catch (error: any) {
    console.error('Error searching legal documents:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to search legal documents' },
      { status: 500 }
    );
  }
}
