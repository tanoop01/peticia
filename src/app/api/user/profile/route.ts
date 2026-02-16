import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, ...updateData } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('[Profile Update] User ID:', userId);
    console.log('[Profile Update] Update data:', updateData);

    // Use service role to bypass RLS
    const supabaseAdmin = getSupabaseAdmin();
    const { data, error } = await supabaseAdmin
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, phone_number, name, city, state, role, preferred_language, is_verified, trust_score, created_at, updated_at')
      .single();

    if (error) {
      console.error('[Profile Update] Error:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    console.log('[Profile Update] Success:', data);

    return NextResponse.json({ 
      success: true, 
      user: data 
    });
  } catch (error: any) {
    console.error('[Profile Update] Exception:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update profile' },
      { status: 500 }
    );
  }
}
