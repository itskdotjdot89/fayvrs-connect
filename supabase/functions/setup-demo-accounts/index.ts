import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Demo credentials
    const demoRequesterEmail = 'demo-requester@fayvrs.com';
    const demoProviderEmail = 'demo-provider@fayvrs.com';
    const demoPassword = 'DemoPass123!';

    console.log('Checking for existing demo users...');

    // Check if users already exist
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    let requesterId = existingUsers.users.find(u => u.email === demoRequesterEmail)?.id;
    let providerId = existingUsers.users.find(u => u.email === demoProviderEmail)?.id;

    // Create demo requester if doesn't exist
    if (!requesterId) {
      console.log('Creating demo requester...');
      const { data: requesterAuth, error: requesterAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: demoRequesterEmail,
        password: demoPassword,
        email_confirm: true
      });

      if (requesterAuthError) {
        console.error('Error creating requester:', requesterAuthError);
        throw requesterAuthError;
      }
      requesterId = requesterAuth.user.id;
    } else {
      console.log('Demo requester already exists, reusing...');
    }

    // Create demo provider if doesn't exist
    if (!providerId) {
      console.log('Creating demo provider...');
      const { data: providerAuth, error: providerAuthError } = await supabaseAdmin.auth.admin.createUser({
        email: demoProviderEmail,
        password: demoPassword,
        email_confirm: true
      });

      if (providerAuthError) {
        console.error('Error creating provider:', providerAuthError);
        throw providerAuthError;
      }
      providerId = providerAuth.user.id;
    } else {
      console.log('Demo provider already exists, reusing...');
    }

    if (!requesterId || !providerId) {
      throw new Error('Failed to get user IDs');
    }

    console.log('Auth users created. Setting up profiles and data...');

    // Insert/Update Profiles
    await supabaseAdmin.from('profiles').upsert({
      id: requesterId,
      email: demoRequesterEmail,
      full_name: 'Demo Requester',
      username: 'demo_requester',
      bio: 'This is a demo account for app store review. I\'m looking for various services to test the platform.',
      phone: '+1-555-0100',
      location: 'San Francisco, CA',
      latitude: 37.7749,
      longitude: -122.4194,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoRequester',
      is_verified: true
    });

    await supabaseAdmin.from('profiles').upsert({
      id: providerId,
      email: demoProviderEmail,
      full_name: 'Demo Provider',
      username: 'demo_provider',
      bio: 'Professional service provider with 10+ years of experience. This is a demo account showcasing the platform\'s provider features.',
      phone: '+1-555-0200',
      location: 'San Francisco, CA',
      latitude: 37.7849,
      longitude: -122.4094,
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DemoProvider',
      is_verified: true,
      service_radius: 25
    });

    // Assign Roles - Both accounts get both roles for role switching feature
    await supabaseAdmin.from('user_roles').upsert([
      { user_id: requesterId, role: 'requester' },
      { user_id: requesterId, role: 'provider' },
      { user_id: providerId, role: 'provider' },
      { user_id: providerId, role: 'requester' }
    ]);

    // Add Provider Specialties
    await supabaseAdmin.from('provider_specialties').delete().eq('provider_id', providerId);
    await supabaseAdmin.from('provider_specialties').insert([
      { provider_id: providerId, category: 'Plumbing Services' },
      { provider_id: providerId, category: 'Electrical Services' },
      { provider_id: providerId, category: 'Handyman Services' }
    ]);

    // Add Provider Subscription - Set far future expiration (2030) to never expire during review
    await supabaseAdmin.from('provider_subscriptions').delete().eq('provider_id', providerId);
    await supabaseAdmin.from('provider_subscriptions').insert({
      provider_id: providerId,
      plan: 'monthly',
      status: 'active',
      started_at: new Date().toISOString(),
      expires_at: '2030-12-31T23:59:59.000Z'
    });

    // Add Portfolio Items
    await supabaseAdmin.from('portfolio_items').delete().eq('provider_id', providerId);
    await supabaseAdmin.from('portfolio_items').insert([
      {
        provider_id: providerId,
        title: 'Kitchen Renovation',
        description: 'Complete kitchen remodel including plumbing and electrical work',
        image_url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
        media_type: 'image',
        is_featured: true
      },
      {
        provider_id: providerId,
        title: 'Bathroom Upgrade',
        description: 'Modern bathroom installation with new fixtures',
        image_url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800',
        media_type: 'image',
        is_featured: true
      },
      {
        provider_id: providerId,
        title: 'Electrical Panel Upgrade',
        description: 'Upgraded 200 amp electrical panel with modern circuit breakers',
        image_url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800',
        media_type: 'image',
        is_featured: false
      },
      {
        provider_id: providerId,
        title: 'Deck Construction',
        description: 'Built custom cedar deck with integrated lighting and railing',
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        media_type: 'image',
        is_featured: true
      },
      {
        provider_id: providerId,
        title: 'HVAC Installation',
        description: 'New energy-efficient HVAC system installation in 2500 sq ft home',
        image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
        media_type: 'image',
        is_featured: false
      },
      {
        provider_id: providerId,
        title: 'Living Room Paint Job',
        description: 'Professional interior painting with custom color matching',
        image_url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800',
        media_type: 'image',
        is_featured: false
      }
    ]);

    // Clean up existing demo data before re-creating
    console.log('Cleaning up existing demo data...');
    
    // Delete existing proposals for demo requests
    const { data: existingRequests } = await supabaseAdmin
      .from('requests')
      .select('id')
      .eq('user_id', requesterId);
    
    if (existingRequests && existingRequests.length > 0) {
      const existingRequestIds = existingRequests.map(r => r.id);
      await supabaseAdmin.from('proposals').delete().in('request_id', existingRequestIds);
      await supabaseAdmin.from('requests').delete().eq('user_id', requesterId);
    }
    
    // Delete existing messages between demo accounts
    await supabaseAdmin.from('messages')
      .delete()
      .or(`sender_id.eq.${requesterId},sender_id.eq.${providerId}`)
      .or(`recipient_id.eq.${requesterId},recipient_id.eq.${providerId}`);
    
    // Delete existing notifications for demo accounts
    await supabaseAdmin.from('notifications').delete().eq('user_id', requesterId);
    await supabaseAdmin.from('notifications').delete().eq('user_id', providerId);

    console.log('Creating sample requests...');
    
    // Create Sample Requests
    const requestIds = {
      plumbing: crypto.randomUUID(),
      electrical: crypto.randomUUID(),
      fence: crypto.randomUUID(),
      hvac: crypto.randomUUID(),
      painting: crypto.randomUUID(),
      moving: crypto.randomUUID(),
      cleaning: crypto.randomUUID(),
      landscaping: crypto.randomUUID()
    };

    await supabaseAdmin.from('requests').upsert([
      {
        id: requestIds.plumbing,
        user_id: requesterId,
        title: 'Need Emergency Plumbing Repair',
        description: 'Kitchen sink is leaking badly. Need immediate help to fix the issue before it causes water damage.',
        request_type: 'service',
        category: 'Plumbing Services',
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        budget_min: 150,
        budget_max: 300,
        status: 'open',
        moderation_status: 'approved',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: requestIds.electrical,
        user_id: requesterId,
        title: 'Electrical Outlet Installation',
        description: 'Need to install 3 new outlets in my home office. Looking for licensed electrician.',
        request_type: 'service',
        category: 'Electrical Services',
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        budget_min: 200,
        budget_max: 400,
        status: 'in_progress',
        moderation_status: 'approved',
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: requestIds.fence,
        user_id: requesterId,
        title: 'Fence Repair',
        description: 'Wooden fence damaged in recent storm. Need repair or replacement of 3 sections.',
        request_type: 'service',
        category: 'Handyman Services',
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        budget_min: 500,
        budget_max: 1000,
        status: 'completed',
        moderation_status: 'approved',
        created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: requestIds.hvac,
        user_id: requesterId,
        title: 'AC Unit Not Cooling Properly',
        description: 'Air conditioning system running but not cooling the house. Need HVAC technician to diagnose and repair.',
        request_type: 'service',
        category: 'HVAC Services',
        location: 'San Francisco, CA',
        latitude: 37.7799,
        longitude: -122.4144,
        budget_min: 100,
        budget_max: 500,
        status: 'open',
        moderation_status: 'approved',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: requestIds.painting,
        user_id: requesterId,
        title: 'Interior House Painting',
        description: 'Looking for professional painter to paint 3 bedrooms and hallway. Need quality work with clean edges.',
        request_type: 'service',
        category: 'Painting Services',
        location: 'San Francisco, CA',
        latitude: 37.7699,
        longitude: -122.4244,
        budget_min: 800,
        budget_max: 1500,
        status: 'open',
        moderation_status: 'approved',
        created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: requestIds.moving,
        user_id: requesterId,
        title: 'Moving Help Needed',
        description: 'Need 2-3 people to help move furniture from 2-bedroom apartment. Heavy lifting required, about 3 hours of work.',
        request_type: 'service',
        category: 'Moving Services',
        location: 'San Francisco, CA',
        latitude: 37.7819,
        longitude: -122.4094,
        budget_min: 200,
        budget_max: 400,
        status: 'open',
        moderation_status: 'approved',
        created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
      },
      {
        id: requestIds.cleaning,
        user_id: requesterId,
        title: 'Deep House Cleaning',
        description: 'Need thorough cleaning of entire house including bathrooms, kitchen, and all rooms. Prefer eco-friendly products.',
        request_type: 'service',
        category: 'Cleaning Services',
        location: 'San Francisco, CA',
        latitude: 37.7649,
        longitude: -122.4294,
        budget_min: 150,
        budget_max: 300,
        status: 'cancelled',
        moderation_status: 'approved',
        created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: requestIds.landscaping,
        user_id: requesterId,
        title: 'Lawn Care and Garden Maintenance',
        description: 'Weekly lawn mowing, hedge trimming, and general yard maintenance. Looking for ongoing service.',
        request_type: 'service',
        category: 'Landscaping Services',
        location: 'San Francisco, CA',
        latitude: 37.7769,
        longitude: -122.4174,
        budget_min: 80,
        budget_max: 150,
        status: 'open',
        moderation_status: 'approved',
        created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
      }
    ]);

    // Create Sample Proposals
    const proposalIds = {
      plumbing: crypto.randomUUID(),
      electrical: crypto.randomUUID(),
      fence: crypto.randomUUID(),
      hvac: crypto.randomUUID(),
      painting: crypto.randomUUID(),
      moving: crypto.randomUUID(),
      landscaping: crypto.randomUUID()
    };

    await supabaseAdmin.from('proposals').upsert([
      {
        id: proposalIds.plumbing,
        request_id: requestIds.plumbing,
        provider_id: providerId,
        message: 'I can help with your plumbing emergency. I have 10+ years of experience and can arrive within 2 hours. The price includes parts and labor.',
        price: 250,
        status: 'pending',
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: proposalIds.electrical,
        request_id: requestIds.electrical,
        provider_id: providerId,
        message: 'Licensed electrician here. I can install those outlets for you. Price includes materials and labor. Available this week.',
        price: 300,
        status: 'accepted',
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: proposalIds.fence,
        request_id: requestIds.fence,
        provider_id: providerId,
        message: 'I specialize in fence repairs. Can repair the damaged sections with matching materials. Job will take 1 day.',
        price: 750,
        status: 'accepted',
        created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: proposalIds.hvac,
        request_id: requestIds.hvac,
        provider_id: providerId,
        message: 'HVAC certified technician. Can come diagnose your AC issue today. If it\'s a simple fix, it will be on the lower end of your budget.',
        price: 200,
        status: 'pending',
        created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
      },
      {
        id: proposalIds.painting,
        request_id: requestIds.painting,
        provider_id: providerId,
        message: 'Professional painter with 8 years experience. I use premium paint and guarantee clean lines. Can start next week.',
        price: 1200,
        status: 'pending',
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: proposalIds.moving,
        request_id: requestIds.moving,
        provider_id: providerId,
        message: 'I have a crew of 3 experienced movers. We bring our own equipment and work efficiently. Can do the job this weekend.',
        price: 350,
        status: 'rejected',
        created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
      },
      {
        id: proposalIds.landscaping,
        request_id: requestIds.landscaping,
        provider_id: providerId,
        message: 'I offer weekly lawn care service. Price is per visit. I bring my own equipment and handle cleanup.',
        price: 100,
        status: 'pending',
        created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
      }
    ]);

    // Update request with selected proposal
    await supabaseAdmin.from('requests').update({
      selected_proposal_id: proposalIds.electrical
    }).eq('id', requestIds.electrical);

    console.log('Creating sample messages...');
    // Create Sample Messages
    const { error: messagesError } = await supabaseAdmin.from('messages').insert([
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.plumbing,
        content: 'Hi! Thanks for the quick response. Can you come today?',
        is_read: true,
        created_at: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString()
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.plumbing,
        content: 'Yes, I can be there in about 2 hours. I\'ll bring all necessary tools and materials.',
        is_read: true,
        created_at: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString()
      },
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.plumbing,
        content: 'Perfect! What\'s your address?',
        is_read: true,
        created_at: new Date(Date.now() - 19 * 60 * 60 * 1000).toISOString()
      },
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.fence,
        content: 'Great work on the fence repair! Everything looks perfect.',
        is_read: true,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.fence,
        content: 'Thank you! Please leave a review if you\'re satisfied with the work.',
        is_read: false,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.electrical,
        content: 'When can you start the outlet installation?',
        is_read: true,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.electrical,
        content: 'I can start tomorrow morning around 9 AM. Should take about 2-3 hours.',
        is_read: true,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.electrical,
        content: 'That works great! See you then.',
        is_read: true,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.hvac,
        content: 'Is your diagnosis fee included in the quoted price?',
        is_read: true,
        created_at: new Date(Date.now() - 15 * 60 * 60 * 1000).toISOString()
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.hvac,
        content: 'Yes, diagnosis is included. If we need to order parts, I\'ll let you know the additional cost.',
        is_read: false,
        created_at: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString()
      },
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.painting,
        content: 'Do you provide the paint or should I buy it?',
        is_read: true,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.painting,
        content: 'I can provide the paint, but if you have a specific brand preference, you can purchase it and I\'ll adjust the price.',
        is_read: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]);
    
    if (messagesError) {
      console.error('Error creating messages:', messagesError);
    } else {
      console.log('Messages created successfully');
    }

    console.log('Creating sample notifications...');
    // Create Sample Notifications
    await supabaseAdmin.from('notifications').insert([
      {
        user_id: requesterId,
        request_id: requestIds.plumbing,
        type: 'new_proposal',
        title: 'New Proposal Received',
        message: 'Demo Provider sent you a proposal for "Need Emergency Plumbing Repair"',
        is_read: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: providerId,
        request_id: requestIds.electrical,
        type: 'proposal_accepted',
        title: 'Proposal Accepted',
        message: 'Demo Requester accepted your proposal for "Electrical Outlet Installation"',
        is_read: true,
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: requesterId,
        request_id: requestIds.electrical,
        type: 'request_matched',
        title: 'New Matches Found',
        message: 'We found 5 providers near you for "Electrical Outlet Installation"',
        is_read: true,
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: providerId,
        request_id: null,
        type: 'subscription_reminder',
        title: 'Subscription Renewal',
        message: 'Your monthly subscription will renew in 15 days',
        is_read: false,
        created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: requesterId,
        request_id: requestIds.hvac,
        type: 'new_proposal',
        title: 'New Proposal Received',
        message: 'Demo Provider sent you a proposal for "AC Unit Not Cooling Properly"',
        is_read: false,
        created_at: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: requesterId,
        request_id: requestIds.painting,
        type: 'new_proposal',
        title: 'New Proposal Received',
        message: 'Demo Provider sent you a proposal for "Interior House Painting"',
        is_read: false,
        created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: requesterId,
        request_id: requestIds.moving,
        type: 'request_matched',
        title: 'New Matches Found',
        message: 'We found 3 providers near you for "Moving Help Needed"',
        is_read: true,
        created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: providerId,
        request_id: requestIds.fence,
        type: 'new_message',
        title: 'New Message',
        message: 'Demo Requester sent you a message about "Fence Repair"',
        is_read: true,
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        user_id: requesterId,
        request_id: requestIds.landscaping,
        type: 'new_proposal',
        title: 'New Proposal Received',
        message: 'Demo Provider sent you a proposal for "Lawn Care and Garden Maintenance"',
        is_read: false,
        created_at: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString()
      }
    ]);

    // Add Referral Data
    await supabaseAdmin.from('referral_codes').upsert({
      user_id: providerId,
      code: 'DEMO2024',
      referral_link: 'https://fayvrs.com/ref/DEMO2024',
      is_active: true,
      total_clicks: 12
    });

    await supabaseAdmin.from('referrer_earnings').upsert({
      user_id: providerId,
      pending_balance: 45.00,
      available_balance: 120.00,
      total_withdrawn: 0,
      lifetime_earnings: 165.00,
      active_referrals_count: 2,
      total_referrals_count: 3
    });

    console.log('Demo accounts setup complete!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo accounts created successfully',
        credentials: {
          requester: {
            email: demoRequesterEmail,
            password: demoPassword,
            id: requesterId
          },
          provider: {
            email: demoProviderEmail,
            password: demoPassword,
            id: providerId
          }
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error setting up demo accounts:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({
        error: errorMessage,
        details: error
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});