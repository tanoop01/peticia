import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Create Supabase client with service role (bypasses RLS)
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
      title,
      description,
      category,
      location_lat,
      location_lng,
      city,
      state,
      address,
      pincode,
      creator_id,
      language
    } = body;

    // Validate required fields
    if (!title || !description || !category || !creator_id) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!location_lat || !location_lng) {
      return NextResponse.json(
        { error: 'Location is required' },
        { status: 400 }
      );
    }

    // Insert petition using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('petitions')
      .insert({
        title,
        description,
        category,
        location_lat,
        location_lng,
        city: city || 'Unknown',
        state: state || 'Unknown',
        address,
        pincode,
        creator_id,
        language: language || 'en',
        signature_count: 0,
        status: 'active',
        sent_to_authority: false,
        response_received: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating petition:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error: any) {
    console.error('Error in create petition API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
