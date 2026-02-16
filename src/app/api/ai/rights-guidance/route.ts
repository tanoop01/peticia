import { NextRequest, NextResponse } from 'next/server';
import { getAIRightsGuidance } from '@/lib/ai';
import type { AIRightsRequest } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body: AIRightsRequest = await request.json();

    // Validate required fields
    if (!body.query || !body.language) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const guidance = await getAIRightsGuidance(body);

    return NextResponse.json({ guidance });
  } catch (error) {
    console.error('Error getting AI guidance:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get AI guidance' },
      { status: 500 }
    );
  }
}
