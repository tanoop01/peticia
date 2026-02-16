import { NextRequest, NextResponse } from 'next/server';
import { generatePetition } from '@/lib/ai';
import type { GeneratePetitionRequest } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body: GeneratePetitionRequest = await request.json();

    // Validate required fields
    if (!body.category || !body.problemDescription || !body.desiredChange) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const petition = await generatePetition(body);

    return NextResponse.json({ petition });
  } catch (error) {
    console.error('Error generating petition:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate petition' },
      { status: 500 }
    );
  }
}
