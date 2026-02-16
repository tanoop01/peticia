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
      user_id, 
      query, 
      language, 
      response 
    } = body;

    // Validate required fields
    if (!user_id || !query || !response) {
      return NextResponse.json(
        { error: 'Missing required fields: user_id, query, response' },
        { status: 400 }
      );
    }

    // Create AI query record using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('ai_queries')
      .insert({
        user_id,
        query,
        language: language || 'en',
        response,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating AI query record:', error);
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
