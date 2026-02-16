import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Update user's location coordinates
 * POST /api/user/location
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId, latitude, longitude, country, state, district, address } = body;

    console.log('Location update request:', { userId, latitude, longitude, country, state, district });

    if (!userId || typeof latitude !== 'number' || typeof longitude !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: userId, latitude, longitude' },
        { status: 400 }
      );
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90) {
      return NextResponse.json(
        { error: 'Invalid latitude. Must be between -90 and 90' },
        { status: 400 }
      );
    }

    if (longitude < -180 || longitude > 180) {
      return NextResponse.json(
        { error: 'Invalid longitude. Must be between -180 and 180' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS
    const supabaseAdmin = getSupabaseAdmin();

    // Update user location in database
    const { data, error } = await supabaseAdmin
      .from('users')
      .update({
        location_lat: latitude,
        location_lng: longitude,
        location_country: country || null,
        location_state: state || null,
        location_district: district || null,
        location_address: address || null,
        location_updated_at: new Date().toISOString(),
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user location:', error);
      return NextResponse.json(
        { error: 'Failed to update location', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        latitude: data.location_lat,
        longitude: data.location_lng,
        country: data.location_country,
        state: data.location_state,
        district: data.location_district,
        address: data.location_address,
        updatedAt: data.location_updated_at,
      },
    });
  } catch (error) {
    console.error('Error in location update:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

/**
 * Get user's saved location
 * GET /api/user/location?userId=xxx
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Use admin client to bypass RLS
    const supabaseAdmin = getSupabaseAdmin();

    const { data, error } = await supabaseAdmin
      .from('users')
      .select('location_lat, location_lng, location_country, location_state, location_district, location_address, location_updated_at')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user location:', error);
      return NextResponse.json(
        { error: 'Failed to fetch location', details: error.message },
        { status: 500 }
      );
    }

    if (!data.location_lat || !data.location_lng) {
      return NextResponse.json({
        success: true,
        data: null,
        message: 'No location saved',
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        latitude: data.location_lat,
        longitude: data.location_lng,
        country: data.location_country,
        state: data.location_state,
        district: data.location_district,
        address: data.location_address,
        updatedAt: data.location_updated_at,
      },
    });
  } catch (error) {
    console.error('Error fetching location:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
