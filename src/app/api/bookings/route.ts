import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { MultiTenantHelper } from '@/lib/multiTenantSupabase';

export async function GET(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get business context from headers
    const businessId = request.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json({ error: 'Business context required' }, { status: 400 });
    }

    // Verify user has access to this business
    const { data: businessAccess, error: accessError } = await supabase
      .from('businesses')
      .select('id')
      .or(`owner_id.eq.${user.id},id.in.(SELECT business_id FROM tenant_users WHERE user_id = ${user.id} AND is_active = true)`)
      .eq('id', businessId)
      .single();

    if (accessError || !businessAccess) {
      return NextResponse.json({ error: 'Access denied to this business' }, { status: 403 });
    }

    // Set business context and fetch bookings
    MultiTenantHelper.setBusinessContext(businessId);
    
    const { data: bookings, error: bookingsError } = MultiTenantHelper.filterBookings(
      supabase.from('bookings').select('*')
    );

    if (bookingsError) {
      return NextResponse.json({ error: bookingsError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: bookings,
      business_id: businessId,
      user_id: user.id
    });

  } catch (error) {
    console.error('Bookings API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    // Get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get business context from headers
    const businessId = request.headers.get('x-business-id');
    if (!businessId) {
      return NextResponse.json({ error: 'Business context required' }, { status: 400 });
    }

    // Verify user has permission to create bookings
    const { data: businessAccess, error: accessError } = await supabase
      .from('businesses')
      .select('id, owner_id')
      .or(`owner_id.eq.${user.id},id.in.(SELECT business_id FROM tenant_users WHERE user_id = ${user.id} AND is_active = true AND role IN ('owner', 'admin'))`)
      .eq('id', businessId)
      .single();

    if (accessError || !businessAccess) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Parse request body
    const bookingData = await request.json();

    // Set business context and create booking
    MultiTenantHelper.setBusinessContext(businessId);
    
    const { data: booking, error: bookingError } = MultiTenantHelper.filterBookings(
      supabase.from('bookings').insert(
        MultiTenantHelper.addBusinessId(bookingData, businessId)
      )
      .select()
      .single()
    );

    if (bookingError) {
      return NextResponse.json({ error: bookingError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: booking,
      message: 'Booking created successfully'
    });

  } catch (error) {
    console.error('Create booking API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
