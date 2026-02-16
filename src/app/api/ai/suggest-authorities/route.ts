import { NextRequest, NextResponse } from 'next/server';
import { suggestAuthorities } from '@/lib/ai';
import type { PetitionCategory } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: {
      category: PetitionCategory;
      state: string;
      city: string;
    } = await request.json();

    // Validate required fields
    if (!body.category || !body.state || !body.city) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const suggestion = await suggestAuthorities(body.category, body.state, body.city);

    return NextResponse.json({ suggestion });
  } catch (error) {
    console.error('Error suggesting authorities:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to suggest authorities' },
      { status: 500 }
    );
  }
}
