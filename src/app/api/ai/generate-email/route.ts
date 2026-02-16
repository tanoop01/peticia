import { NextRequest, NextResponse } from 'next/server';
import { generateAuthorityEmail } from '@/lib/ai';

export async function POST(request: NextRequest) {
  try {
    const body: {
      petitionTitle: string;
      petitionContent: string;
      signatureCount: number;
      location: string;
    } = await request.json();

    // Validate required fields
    if (!body.petitionTitle || !body.petitionContent || !body.location) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const email = await generateAuthorityEmail(
      body.petitionTitle,
      body.petitionContent,
      body.signatureCount || 0,
      body.location
    );

    return NextResponse.json({ email });
  } catch (error) {
    console.error('Error generating email:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to generate email' },
      { status: 500 }
    );
  }
}
