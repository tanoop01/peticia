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

    // Prevent signing petitions that are already resolved/closed.
    const { data: petition, error: petitionError } = await supabaseAdmin
      .from('petitions')
      .select('id, status')
      .eq('id', petition_id)
      .maybeSingle();

    if (petitionError) {
      return NextResponse.json(
        { error: petitionError.message },
        { status: 500 }
      );
    }

    if (!petition) {
      return NextResponse.json(
        { error: 'Petition not found' },
        { status: 404 }
      );
    }

    if (petition.status === 'resolved' || petition.status === 'closed') {
      return NextResponse.json(
        { error: 'This petition is resolved and no longer accepts signatures' },
        { status: 400 }
      );
    }

    // Check if user already signed this petition
    const { data: existingSignature } = await supabaseAdmin
      .from('signatures')
      .select('id')
      .eq('petition_id', petition_id)
      .eq('user_id', user_id)
      .maybeSingle();

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
