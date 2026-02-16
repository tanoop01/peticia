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
      type, 
      content, 
      created_by 
    } = body;

    // Validate required fields
    if (!petition_id || !content || !created_by) {
      return NextResponse.json(
        { error: 'Missing required fields: petition_id, content, created_by' },
        { status: 400 }
      );
    }

    // Verify that the user is the petition creator
    const { data: petition } = await supabaseAdmin
      .from('petitions')
      .select('creator_id')
      .eq('id', petition_id)
      .single();

    if (!petition || petition.creator_id !== created_by) {
      return NextResponse.json(
        { error: 'Only the petition creator can post updates' },
        { status: 403 }
      );
    }

    // Create petition update using service role (bypasses RLS)
    const { data, error } = await supabaseAdmin
      .from('petition_updates')
      .insert({
        petition_id,
        type: type || 'progress',
        content,
        created_by,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating petition update:', error);
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
