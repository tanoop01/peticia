import { NextRequest, NextResponse } from 'next/server';

/**
 * Generate embeddings for text (feature disabled)
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'Embedding generation is not configured. This feature requires an AI service.' },
    { status: 501 }
  );
}
