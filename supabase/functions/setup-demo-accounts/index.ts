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

    // Assign Roles
    await supabaseAdmin.from('user_roles').upsert([
      { user_id: requesterId, role: 'requester' },
      { user_id: providerId, role: 'provider' }
    ]);

    // Add Provider Specialties
    await supabaseAdmin.from('provider_specialties').delete().eq('provider_id', providerId);
    await supabaseAdmin.from('provider_specialties').insert([
      { provider_id: providerId, category: 'Plumbing Services' },
      { provider_id: providerId, category: 'Electrical Services' },
      { provider_id: providerId, category: 'Handyman Services' }
    ]);

    // Add Provider Subscription
    await supabaseAdmin.from('provider_subscriptions').upsert({
      provider_id: providerId,
      plan: 'monthly',
      status: 'active',
      started_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
      expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
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
      }
    ]);

    // Create Sample Requests
    const requestIds = {
      plumbing: crypto.randomUUID(),
      electrical: crypto.randomUUID(),
      fence: crypto.randomUUID()
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
      }
    ]);

    // Create Sample Proposals
    const proposalIds = {
      plumbing: crypto.randomUUID(),
      electrical: crypto.randomUUID(),
      fence: crypto.randomUUID()
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
      }
    ]);

    // Update request with selected proposal
    await supabaseAdmin.from('requests').update({
      selected_proposal_id: proposalIds.electrical
    }).eq('id', requestIds.electrical);

    // Create Sample Messages
    await supabaseAdmin.from('messages').insert([
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
      }
    ]);

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