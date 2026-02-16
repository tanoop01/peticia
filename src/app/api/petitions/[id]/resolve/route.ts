import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { userId } = await request.json();
    const petitionId = params.id;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    // Use admin client to bypass RLS
    const supabaseAdmin = getSupabaseAdmin();

    // First, verify that the user is the creator of the petition
    const petitionResult: any = await supabaseAdmin
      .from('petitions')
      .select('creator_id, status')
      .eq('id', petitionId)
      .single();

    if (petitionResult.error || !petitionResult.data) {
      return NextResponse.json(
        { error: 'Petition not found' },
        { status: 404 }
      );
    }

    const { creator_id, status } = petitionResult.data;
    
    if (creator_id !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the petition creator can resolve this petition' },
        { status: 403 }
      );
    }

    // Check if already resolved
    if (status === 'resolved') {
      return NextResponse.json(
        { error: 'Petition is already resolved' },
        { status: 400 }
      );
    }

    // Mark petition as resolved
    // @ts-ignore - Supabase types don't recognize dynamic columns
    const updateResult = await supabaseAdmin
      .from('petitions')
      .update({ 
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', petitionId);

    if (updateResult.error) {
      console.error('Resolve error:', updateResult.error);
      throw updateResult.error;
    }

    return NextResponse.json({ 
      success: true,
      message: 'Petition marked as resolved successfully' 
    });
  } catch (error) {
    console.error('Error resolving petition:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to resolve petition' },
      { status: 500 }
    );
  }
}
