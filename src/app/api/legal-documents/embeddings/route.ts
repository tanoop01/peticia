import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Generate and store embeddings for all legal documents (feature disabled)
 */
export async function POST(request: NextRequest) {
  try {
    return NextResponse.json(
      { error: 'Embedding generation is not configured. This feature requires an AI service.' },
      { status: 501 }
    );
  } catch (error: any) {
    console.error('Error generating embeddings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate embeddings' },
      { status: 500 }
    );
  }
}

/**
 * Get embedding generation status
 */
export async function GET() {
  try {
    const supabaseAdmin = getSupabaseAdmin();

    const { count: totalCount } = await supabaseAdmin
      .from('legal_documents')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: withEmbeddings } = await supabaseAdmin
      .from('legal_documents')
      .select('*', { count: 'exact', head: true })
      .not('embedding', 'is', null)
      .eq('status', 'active');

    const { count: withoutEmbeddings } = await supabaseAdmin
      .from('legal_documents')
      .select('*', { count: 'exact', head: true })
      .is('embedding', null)
      .eq('status', 'active');

    return NextResponse.json({
      total: totalCount || 0,
      withEmbeddings: withEmbeddings || 0,
      withoutEmbeddings: withoutEmbeddings || 0,
      progress: totalCount ? ((withEmbeddings || 0) / totalCount * 100).toFixed(1) : 0,
    });
  } catch (error: any) {
    console.error('Error getting embedding status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to get status' },
      { status: 500 }
    );
  }
}
