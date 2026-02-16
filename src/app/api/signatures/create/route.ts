import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role key to bypass RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { 
      petition_id, 
      user_id, 
      is_verified, 
      location_lat, 
      location_lng 
    } = body;

    // Validate required fields
    if (!petition_id || !user_id) {
      return NextResponse.json(
        { error: 'Missing required fields: petition_id, user_id' },
        { status: 400 }
      );
    }

    // Check if user already signed this petition
    const { data: existingSignature } = await supabaseAdmin
      .from('signatures')
      .select('id')
      .eq('petition_id', petition_id)
      .eq('user_id', user_id)
      .single();

    if (existingSignature) {
      return NextResponse.json(
        { error: 'You have already signed this petition' },
        { status: 400 }
      );
    }

    // Create signature using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('signatures')
      .insert({
        petition_id,
        user_id,
        is_verified: is_verified || false,
        location_lat: location_lat || null,
        location_lng: location_lng || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating signature:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
