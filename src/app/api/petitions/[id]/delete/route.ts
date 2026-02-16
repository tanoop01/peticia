import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function DELETE(
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
      .select('creator_id')
      .eq('id', petitionId)
      .single();

    if (petitionResult.error || !petitionResult.data) {
      return NextResponse.json(
        { error: 'Petition not found' },
        { status: 404 }
      );
    }

    const creatorId = petitionResult.data.creator_id;
    
    if (creatorId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized: Only the petition creator can delete this petition' },
        { status: 403 }
      );
    }

    // Delete the petition (CASCADE will handle related records)
    const deleteResult = await supabaseAdmin
      .from('petitions')
      .delete()
      .eq('id', petitionId);

    if (deleteResult.error) {
      console.error('Delete error:', deleteResult.error);
      throw deleteResult.error;
    }

    return NextResponse.json({ 
      success: true,
      message: 'Petition deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting petition:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete petition' },
      { status: 500 }
    );
  }
}
