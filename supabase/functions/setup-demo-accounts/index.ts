import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Utility functions for relative timestamps (always fresh)
const hoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const daysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
const minutesAgo = (minutes: number) => new Date(Date.now() - minutes * 60 * 1000).toISOString();

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
      bio: 'Professional service provider with 10+ years of experience in home improvement. Licensed, insured, and background-checked. This is a demo account showcasing the platform\'s provider features.',
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

    // Add Provider Specialties for Demo Provider
    await supabaseAdmin.from('provider_specialties').delete().eq('provider_id', providerId);
    await supabaseAdmin.from('provider_specialties').insert([
      { provider_id: providerId, category: 'Plumbing Services' },
      { provider_id: providerId, category: 'Electrical Services' },
      { provider_id: providerId, category: 'Handyman Services' },
      { provider_id: providerId, category: 'HVAC Services' }
    ]);

    // Add Provider Specialties for Demo Requester (for role switching feature)
    await supabaseAdmin.from('provider_specialties').delete().eq('provider_id', requesterId);
    await supabaseAdmin.from('provider_specialties').insert([
      { provider_id: requesterId, category: 'Photography' },
      { provider_id: requesterId, category: 'Graphic Design' },
      { provider_id: requesterId, category: 'Web Development' }
    ]);

    // Add Provider Subscriptions for BOTH demo accounts (for role switching feature)
    await supabaseAdmin.from('provider_subscriptions').delete().eq('provider_id', providerId);
    await supabaseAdmin.from('provider_subscriptions').delete().eq('provider_id', requesterId);
    await supabaseAdmin.from('provider_subscriptions').insert([
      {
        provider_id: providerId,
        plan: 'monthly',
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: '2030-12-31T23:59:59.000Z'
      },
      {
        provider_id: requesterId,
        plan: 'monthly',
        status: 'active',
        started_at: new Date().toISOString(),
        expires_at: '2030-12-31T23:59:59.000Z'
      }
    ]);

    // Add Identity Verifications for BOTH demo accounts (approved status for app store review)
    await supabaseAdmin.from('identity_verifications').delete().eq('user_id', providerId);
    await supabaseAdmin.from('identity_verifications').delete().eq('user_id', requesterId);
    await supabaseAdmin.from('identity_verifications').insert([
      {
        user_id: providerId,
        status: 'approved',
        id_document_url: 'https://placeholder.demo/provider-id-document.jpg',
        selfie_url: 'https://placeholder.demo/provider-selfie.jpg',
        submitted_at: daysAgo(30),
        reviewed_at: daysAgo(29),
        reviewer_notes: 'Demo account - auto-verified for app store review'
      },
      {
        user_id: requesterId,
        status: 'approved',
        id_document_url: 'https://placeholder.demo/requester-id-document.jpg',
        selfie_url: 'https://placeholder.demo/requester-selfie.jpg',
        submitted_at: daysAgo(30),
        reviewed_at: daysAgo(29),
        reviewer_notes: 'Demo account - auto-verified for app store review'
      }
    ]);

    // Add Portfolio Items for Demo Provider
    await supabaseAdmin.from('portfolio_items').delete().eq('provider_id', providerId);
    await supabaseAdmin.from('portfolio_items').insert([
      {
        provider_id: providerId,
        title: 'Kitchen Renovation',
        description: 'Complete kitchen remodel including plumbing and electrical work. Custom cabinets and countertops installed.',
        image_url: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=800',
        media_type: 'image',
        is_featured: true
      },
      {
        provider_id: providerId,
        title: 'Bathroom Upgrade',
        description: 'Modern bathroom installation with new fixtures, tilework, and walk-in shower.',
        image_url: 'https://images.unsplash.com/photo-1552321554-5fefe8c9ef14?w=800',
        media_type: 'image',
        is_featured: true
      },
      {
        provider_id: providerId,
        title: 'Electrical Panel Upgrade',
        description: 'Upgraded 200 amp electrical panel with modern circuit breakers for whole-home safety.',
        image_url: 'https://images.unsplash.com/photo-1621905251918-48416bd8575a?w=800',
        media_type: 'image',
        is_featured: false
      },
      {
        provider_id: providerId,
        title: 'Deck Construction',
        description: 'Built custom cedar deck with integrated lighting and aluminum railing system.',
        image_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800',
        media_type: 'image',
        is_featured: true
      },
      {
        provider_id: providerId,
        title: 'HVAC Installation',
        description: 'New energy-efficient HVAC system installation in 2500 sq ft home with smart thermostat.',
        image_url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800',
        media_type: 'image',
        is_featured: false
      },
      {
        provider_id: providerId,
        title: 'Living Room Paint Job',
        description: 'Professional interior painting with custom color matching and clean edges throughout.',
        image_url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800',
        media_type: 'image',
        is_featured: false
      },
      {
        provider_id: providerId,
        title: 'Smart Home Installation',
        description: 'Complete smart thermostat, lighting, and security system installation with app control.',
        image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
        media_type: 'image',
        is_featured: true
      },
      {
        provider_id: providerId,
        title: 'Fence Installation',
        description: 'Custom privacy fence with decorative post caps and stained cedar finish.',
        image_url: 'https://images.unsplash.com/photo-1558618047-f4b511ba1c80?w=800',
        media_type: 'image',
        is_featured: false
      }
    ]);

    // Add Portfolio Items for Demo Requester (for role switching)
    await supabaseAdmin.from('portfolio_items').delete().eq('provider_id', requesterId);
    await supabaseAdmin.from('portfolio_items').insert([
      {
        provider_id: requesterId,
        title: 'Corporate Headshots',
        description: 'Professional headshot photography for LinkedIn and company websites.',
        image_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800',
        media_type: 'image',
        is_featured: true
      },
      {
        provider_id: requesterId,
        title: 'Brand Identity Design',
        description: 'Complete brand identity package including logo, business cards, and style guide.',
        image_url: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800',
        media_type: 'image',
        is_featured: true
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

    console.log('Creating sample requests with fresh timestamps and images...');
    
    // Create Sample Requests with enhanced content
    const requestIds = {
      plumbing: crypto.randomUUID(),
      electrical: crypto.randomUUID(),
      fence: crypto.randomUUID(),
      hvac: crypto.randomUUID(),
      painting: crypto.randomUUID(),
      moving: crypto.randomUUID(),
      landscaping: crypto.randomUUID(),
      network: crypto.randomUUID(),
      tutoring: crypto.randomUUID(),
      dj: crypto.randomUUID()
    };

    await supabaseAdmin.from('requests').upsert([
      {
        id: requestIds.plumbing,
        user_id: requesterId,
        title: 'Need Emergency Plumbing Repair',
        description: 'Kitchen sink has a persistent drip that\'s getting worse. The leak appears to be coming from under the sink near the drain pipe connection. I\'ve tried tightening the connections but it hasn\'t helped. Available any day this week after 2 PM. The sink is a standard single-basin with a garbage disposal unit.',
        request_type: 'service',
        category: 'Plumbing Services',
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        budget_min: 150,
        budget_max: 300,
        status: 'open',
        moderation_status: 'approved',
        images: ['https://images.unsplash.com/photo-1585704032915-c3400ca199e7?w=800'],
        created_at: hoursAgo(4)
      },
      {
        id: requestIds.electrical,
        user_id: requesterId,
        title: 'Electrical Outlet Installation in Home Office',
        description: 'Need to install 3 new outlets in my home office for my work-from-home setup. Looking for a licensed electrician who can ensure the work is up to code. Would prefer USB outlets for at least 2 of them. The walls are drywall and I have access to the attic above for running wires. Available mornings before noon.',
        request_type: 'service',
        category: 'Electrical Services',
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        budget_min: 200,
        budget_max: 450,
        status: 'in_progress',
        moderation_status: 'approved',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
        created_at: daysAgo(2)
      },
      {
        id: requestIds.fence,
        user_id: requesterId,
        title: 'Fence Repair After Storm Damage',
        description: 'Wooden fence damaged in recent storm. Need repair or replacement of 3 sections (approximately 18 feet total). The posts seem solid but several boards are broken or missing. Would prefer matching cedar wood if possible. Gate hinge also needs adjustment. Can provide photos.',
        request_type: 'service',
        category: 'Handyman Services',
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        budget_min: 500,
        budget_max: 1000,
        status: 'completed',
        moderation_status: 'approved',
        created_at: daysAgo(10)
      },
      {
        id: requestIds.hvac,
        user_id: requesterId,
        title: 'AC Unit Not Cooling Properly',
        description: 'Air conditioning system running but not cooling the house effectively. The unit is about 8 years old (Carrier brand, 3-ton). I\'ve already replaced the filter but that didn\'t help. Thermostat seems to be working correctly. Could be refrigerant, compressor, or something else? Need HVAC technician to diagnose and repair. Available weekdays after 4 PM or weekends.',
        request_type: 'service',
        category: 'HVAC Services',
        location: 'San Francisco, CA',
        latitude: 37.7799,
        longitude: -122.4144,
        budget_min: 100,
        budget_max: 500,
        status: 'open',
        moderation_status: 'approved',
        images: ['https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800'],
        created_at: hoursAgo(18)
      },
      {
        id: requestIds.painting,
        user_id: requesterId,
        title: 'Interior House Painting - 3 Bedrooms',
        description: 'Looking for professional painter to paint 3 bedrooms (approximately 12x12, 10x10, and 10x12) and the upstairs hallway. Currently beige, want to go with light gray tones. Need quality work with clean edges around trim and windows. Have already purchased the paint (Benjamin Moore). Just need labor. Furniture will be moved to center of rooms.',
        request_type: 'service',
        category: 'Painting Services',
        location: 'San Francisco, CA',
        latitude: 37.7699,
        longitude: -122.4244,
        budget_min: 800,
        budget_max: 1500,
        status: 'open',
        moderation_status: 'approved',
        images: ['https://images.unsplash.com/photo-1562259949-e8e7689d7828?w=800', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?w=800'],
        created_at: daysAgo(1)
      },
      {
        id: requestIds.moving,
        user_id: requesterId,
        title: 'Moving Help - Apartment to Storage',
        description: 'Need 2-3 people to help move furniture from 2-bedroom apartment to a storage unit about 5 miles away. Heavy items include queen bed frame, couch, dresser, desk, and about 20 boxes. I have a rental truck already. Just need muscle and help loading/unloading. Elevator in both buildings. Should take about 3 hours. Tips included!',
        request_type: 'service',
        category: 'Moving Services',
        location: 'San Francisco, CA',
        latitude: 37.7819,
        longitude: -122.4094,
        budget_min: 200,
        budget_max: 400,
        status: 'open',
        moderation_status: 'approved',
        created_at: hoursAgo(6)
      },
      {
        id: requestIds.landscaping,
        user_id: requesterId,
        title: 'Lawn Care and Garden Maintenance',
        description: 'Looking for reliable weekly lawn care service for my front and backyard (total about 2000 sq ft). Need mowing, edging, hedge trimming, and general yard cleanup. Have all the equipment if needed or you can bring your own. Looking for someone to start an ongoing service. Yard is relatively flat with a few flower beds that need weeding.',
        request_type: 'service',
        category: 'Landscaping Services',
        location: 'San Francisco, CA',
        latitude: 37.7769,
        longitude: -122.4174,
        budget_min: 80,
        budget_max: 150,
        status: 'open',
        moderation_status: 'approved',
        created_at: hoursAgo(12)
      },
      {
        id: requestIds.network,
        user_id: requesterId,
        title: 'Home Network Setup and Troubleshooting',
        description: 'Need help setting up a more reliable home network. Currently have dead zones in the backyard and upstairs bedrooms. Looking to set up a mesh WiFi system (already purchased Eero 3-pack) and run ethernet to my home office. House is 2 stories, about 2200 sq ft. Also need help organizing the cable clutter behind my entertainment center.',
        request_type: 'service',
        category: 'Technology Services',
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        budget_min: 150,
        budget_max: 300,
        status: 'open',
        moderation_status: 'approved',
        images: ['https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800'],
        created_at: hoursAgo(3)
      },
      {
        id: requestIds.tutoring,
        user_id: requesterId,
        title: 'Math Tutor for High School Student',
        description: 'Looking for a patient math tutor for my 10th grader who is struggling with Algebra 2. Needs help with quadratic equations, factoring, and word problems. Prefer in-person sessions at our home or local library. Would like 2 sessions per week, 1 hour each. Student learns best with visual examples and practice problems.',
        request_type: 'service',
        category: 'Tutoring Services',
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        budget_min: 40,
        budget_max: 80,
        status: 'open',
        moderation_status: 'approved',
        created_at: daysAgo(1)
      },
      {
        id: requestIds.dj,
        user_id: requesterId,
        title: 'DJ Needed for 40th Birthday Party',
        description: 'Planning my husband\'s surprise 40th birthday party and need a DJ! The party will be at our backyard (covered patio area) on Saturday, February 15th from 7-11 PM. About 50 guests expected. Music preferences: 80s hits, classic rock, and some current pop. Need DJ to bring their own equipment and handle music/announcements. Let me know if you have any questions!',
        request_type: 'service',
        category: 'Event Services',
        location: 'San Francisco, CA',
        latitude: 37.7749,
        longitude: -122.4194,
        budget_min: 300,
        budget_max: 600,
        status: 'open',
        moderation_status: 'approved',
        created_at: hoursAgo(8)
      }
    ]);

    console.log('Creating sample proposals with varied statuses...');
    
    // Create Sample Proposals with varied statuses
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
        message: 'I can help with your plumbing emergency! I have 10+ years of experience with kitchen sink repairs. Based on your description, it sounds like either the P-trap connection or drain gasket needs replacement - both are common and straightforward fixes. I carry standard parts in my truck and can arrive within 2 hours. The $250 quote includes parts, labor, and a 30-day warranty on the repair.',
        price: 250,
        status: 'pending',
        created_at: hoursAgo(3)
      },
      {
        id: proposalIds.electrical,
        request_id: requestIds.electrical,
        provider_id: providerId,
        message: 'Licensed electrician here (License #ET-54821). I specialize in home office setups. USB outlets are a great choice - I recommend Leviton combination outlets. Since you have attic access, running new circuits will be straightforward. Price includes 3 USB outlets, materials, permit fee, and installation. Available Thursday or Friday morning. All work guaranteed and up to code.',
        price: 375,
        status: 'accepted',
        created_at: daysAgo(2)
      },
      {
        id: proposalIds.fence,
        request_id: requestIds.fence,
        provider_id: providerId,
        message: 'I specialize in fence repairs and can match your existing cedar. For 3 sections (18 feet), I\'ll replace all damaged boards and reinforce the posts. I source my cedar from a local mill so the color matching will be excellent. The quote includes materials, labor, staining to match, and gate adjustment. Can complete the job in one day. 5-year warranty on workmanship.',
        price: 750,
        status: 'accepted',
        created_at: daysAgo(10)
      },
      {
        id: proposalIds.hvac,
        request_id: requestIds.hvac,
        provider_id: providerId,
        message: 'HVAC certified technician with 15 years experience here. For an 8-year-old Carrier system, the symptoms you describe often indicate low refrigerant (possibly a slow leak) or a failing capacitor - both common issues. I\'ll bring my diagnostic equipment and can usually identify the problem within 30 minutes. The $200 quote covers the diagnostic visit. If repairs are needed, I\'ll provide a detailed estimate before proceeding. Parts are typically available same-day.',
        price: 200,
        status: 'pending',
        created_at: hoursAgo(15)
      },
      {
        id: proposalIds.painting,
        request_id: requestIds.painting,
        provider_id: providerId,
        message: 'Professional painter with 8 years experience here. Since you\'ve already purchased Benjamin Moore (excellent choice!), I can focus entirely on prep and application. My process: 1) Thorough prep including patching any holes, 2) Tape all trim/windows, 3) Apply primer where needed, 4) Two coats of your paint, 5) Touch-ups and cleanup. For 3 bedrooms and hallway, I estimate 2 full days. I guarantee clean lines and professional results.',
        price: 1100,
        status: 'pending',
        created_at: hoursAgo(20)
      },
      {
        id: proposalIds.moving,
        request_id: requestIds.moving,
        provider_id: providerId,
        message: 'I have a crew of 3 experienced movers ready to help. We bring our own equipment (dollies, furniture pads, straps) and work efficiently. With elevator access at both locations and a truck already rented, we can definitely finish in 3 hours or less. We\'re careful with furniture and communicate well throughout the move. Available this Saturday or Sunday. Looking forward to helping!',
        price: 350,
        status: 'rejected',
        created_at: hoursAgo(4)
      },
      {
        id: proposalIds.landscaping,
        request_id: requestIds.landscaping,
        provider_id: providerId,
        message: 'I offer reliable weekly lawn care and would love to add you to my route. For 2000 sq ft, my service includes: mowing (mulching or bagging your preference), edging along walkways and beds, hedge trimming monthly, weeding flower beds, and general cleanup. I bring all my own commercial equipment. I have 3 openings on Wednesday mornings - perfect timing for weekend entertaining! First service includes extra attention to edges and beds.',
        price: 95,
        status: 'pending',
        created_at: hoursAgo(10)
      }
    ]);

    // Update request with selected proposal
    await supabaseAdmin.from('requests').update({
      selected_proposal_id: proposalIds.electrical
    }).eq('id', requestIds.electrical);

    await supabaseAdmin.from('requests').update({
      selected_proposal_id: proposalIds.fence
    }).eq('id', requestIds.fence);

    console.log('Creating comprehensive message threads...');
    
    // Create comprehensive message threads
    const { error: messagesError } = await supabaseAdmin.from('messages').insert([
      // Plumbing thread (4 messages - active negotiation)
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.plumbing,
        content: 'Hi! Thanks for the quick response. Can you come today? The dripping is getting worse and I\'m worried about water damage.',
        is_read: true,
        created_at: hoursAgo(2)
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.plumbing,
        content: 'Yes, I can be there in about 2 hours. I\'ll bring replacement P-trap parts and gaskets. Can you turn off the water supply under the sink in the meantime to prevent any damage?',
        is_read: true,
        created_at: hoursAgo(2)
      },
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.plumbing,
        content: 'Perfect, I found the valve and turned it off. The address is 123 Demo Street, San Francisco. I\'ll be home all afternoon.',
        is_read: true,
        created_at: hoursAgo(2)
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.plumbing,
        content: 'Great, see you soon! I\'ll text you when I\'m 10 minutes away.',
        is_read: false,
        created_at: hoursAgo(1)
      },

      // Electrical thread (6 messages - full job lifecycle)
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.electrical,
        content: 'Hi! Your proposal looks great. Quick question - are the outlets going to be standard white or do you have other color options?',
        is_read: true,
        created_at: daysAgo(2)
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.electrical,
        content: 'I can install white, ivory, or light almond. I also have a few decora-style plates if you prefer that look. USB outlets typically come in white but I can order others if needed (adds 2-3 days).',
        is_read: true,
        created_at: daysAgo(2)
      },
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.electrical,
        content: 'White works perfectly! Let\'s go with USB outlets for 2 of them and standard for 1. Can you do Thursday morning?',
        is_read: true,
        created_at: daysAgo(2)
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.electrical,
        content: 'Thursday at 9 AM works great! I\'ll bring all the materials. Should take about 2-3 hours. See you then!',
        is_read: true,
        created_at: daysAgo(2)
      },
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.electrical,
        content: 'The outlets look fantastic! Professional work and very clean installation. Thank you so much!',
        is_read: true,
        created_at: hoursAgo(6)
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.electrical,
        content: 'Thank you for the kind words! It was a pleasure working in your home. Don\'t hesitate to reach out for any future electrical needs. I also do smart switches and lighting if you\'re interested!',
        is_read: false,
        created_at: hoursAgo(5)
      },

      // Fence thread (4 messages - completed job with review request)
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.fence,
        content: 'Great work on the fence repair! Everything looks perfect and the color matching is spot on.',
        is_read: true,
        created_at: daysAgo(5)
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.fence,
        content: 'Thank you so much! I\'m glad you\'re happy with it. The stain will deepen a bit over the next week as it cures. If you notice any issues, I\'m just a message away!',
        is_read: true,
        created_at: daysAgo(5)
      },
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.fence,
        content: 'Will do! Already recommended you to my neighbor who needs some deck repairs.',
        is_read: true,
        created_at: daysAgo(4)
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.fence,
        content: 'That means a lot! Referrals are the best compliment. When you get a chance, a review on my profile would really help other homeowners find me. Thanks again!',
        is_read: false,
        created_at: daysAgo(4)
      },

      // HVAC thread (3 messages - scheduling)
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.hvac,
        content: 'Is your diagnostic fee included if you end up doing the repair, or is it separate?',
        is_read: true,
        created_at: hoursAgo(14)
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.hvac,
        content: 'Great question! If you proceed with the repair, I apply the $200 diagnostic fee as a credit toward the total repair cost. So you\'re not paying twice. I\'ll give you a full breakdown before any work begins.',
        is_read: true,
        created_at: hoursAgo(13)
      },
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.hvac,
        content: 'That sounds fair! Can you come by tomorrow after 4 PM? I want to get this resolved before the heat wave this weekend.',
        is_read: false,
        created_at: hoursAgo(12)
      },

      // Painting thread (2 messages - initial questions)
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.painting,
        content: 'Do I need to move all the furniture out of the rooms or just to the center?',
        is_read: true,
        created_at: hoursAgo(18)
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.painting,
        content: 'Just moving to the center works perfectly! I\'ll cover everything with plastic sheeting. If you have any fragile items or electronics, those are best removed. I also recommend taking down any wall art and curtains the night before. Makes the process much smoother!',
        is_read: false,
        created_at: hoursAgo(16)
      },

      // Moving thread (3 messages - rejected but polite exchange)
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.moving,
        content: 'Thanks for the proposal! I appreciate the quick response. I actually found a neighbor who can help for less, but I\'ll keep you in mind for future moves!',
        is_read: true,
        created_at: hoursAgo(3)
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.moving,
        content: 'No problem at all! Neighbors helping neighbors is what it\'s all about. If you ever need professional movers for a bigger job or long-distance, give me a shout. Good luck with the move!',
        is_read: true,
        created_at: hoursAgo(3)
      },
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.moving,
        content: 'Will do, thanks for understanding! 🙏',
        is_read: true,
        created_at: hoursAgo(2)
      },

      // Landscaping thread (2 messages - discussing schedule)
      {
        sender_id: requesterId,
        recipient_id: providerId,
        request_id: requestIds.landscaping,
        content: 'Wednesday mornings work great for me. Do you need access to the backyard or can you go through the side gate?',
        is_read: true,
        created_at: hoursAgo(8)
      },
      {
        sender_id: providerId,
        recipient_id: requesterId,
        request_id: requestIds.landscaping,
        content: 'Side gate access is perfect! Just leave it unlocked on Wednesday mornings and I\'ll take care of everything. I\'ll text you when I arrive and when I\'m finished so you know it\'s done. Looking forward to keeping your yard looking great!',
        is_read: false,
        created_at: hoursAgo(7)
      }
    ]);
    
    if (messagesError) {
      console.error('Error creating messages:', messagesError);
    } else {
      console.log('Messages created successfully');
    }

    console.log('Creating comprehensive notifications...');
    
    // Create comprehensive notifications for both accounts
    await supabaseAdmin.from('notifications').insert([
      // Notifications for Demo Requester
      {
        user_id: requesterId,
        request_id: requestIds.plumbing,
        type: 'new_proposal',
        title: 'New Proposal Received',
        message: 'Demo Provider sent you a proposal for "Need Emergency Plumbing Repair" - $250',
        is_read: false,
        created_at: hoursAgo(3)
      },
      {
        user_id: requesterId,
        request_id: requestIds.electrical,
        type: 'proposal_accepted',
        title: 'Work Completed',
        message: 'Your electrical outlet installation has been completed. Leave a review!',
        is_read: false,
        created_at: hoursAgo(6)
      },
      {
        user_id: requesterId,
        request_id: requestIds.hvac,
        type: 'new_proposal',
        title: 'New Proposal Received',
        message: 'Demo Provider sent you a proposal for "AC Unit Not Cooling Properly" - $200',
        is_read: false,
        created_at: hoursAgo(15)
      },
      {
        user_id: requesterId,
        request_id: requestIds.painting,
        type: 'new_proposal',
        title: 'New Proposal Received',
        message: 'Demo Provider sent you a proposal for "Interior House Painting" - $1,100',
        is_read: true,
        created_at: hoursAgo(20)
      },
      {
        user_id: requesterId,
        request_id: requestIds.landscaping,
        type: 'new_proposal',
        title: 'New Proposal Received',
        message: 'Demo Provider sent you a proposal for "Lawn Care and Garden Maintenance" - $95/visit',
        is_read: false,
        created_at: hoursAgo(10)
      },
      {
        user_id: requesterId,
        request_id: requestIds.network,
        type: 'request_matched',
        title: 'Providers Found Nearby',
        message: 'We found 3 tech specialists near you for "Home Network Setup"',
        is_read: true,
        created_at: hoursAgo(2)
      },
      {
        user_id: requesterId,
        request_id: requestIds.dj,
        type: 'request_matched',
        title: 'Providers Found Nearby',
        message: 'We found 5 DJs near you for "DJ Needed for 40th Birthday Party"',
        is_read: false,
        created_at: hoursAgo(7)
      },
      {
        user_id: requesterId,
        request_id: null,
        type: 'new_message',
        title: 'New Message',
        message: 'Demo Provider sent you a message about the plumbing repair',
        is_read: false,
        created_at: hoursAgo(1)
      },

      // Notifications for Demo Provider
      {
        user_id: providerId,
        request_id: requestIds.electrical,
        type: 'proposal_accepted',
        title: 'Proposal Accepted! 🎉',
        message: 'Demo Requester accepted your proposal for "Electrical Outlet Installation"',
        is_read: true,
        created_at: daysAgo(2)
      },
      {
        user_id: providerId,
        request_id: requestIds.moving,
        type: 'proposal_rejected',
        title: 'Proposal Update',
        message: 'Demo Requester chose another provider for "Moving Help Needed"',
        is_read: true,
        created_at: hoursAgo(3)
      },
      {
        user_id: providerId,
        request_id: requestIds.plumbing,
        type: 'new_request_nearby',
        title: 'New Request Nearby',
        message: 'Emergency plumbing repair needed 0.3 miles away - matches your specialties',
        is_read: true,
        created_at: hoursAgo(4)
      },
      {
        user_id: providerId,
        request_id: requestIds.hvac,
        type: 'new_request_nearby',
        title: 'New Request Nearby',
        message: 'AC repair needed 0.5 miles away - matches your HVAC specialty',
        is_read: true,
        created_at: hoursAgo(18)
      },
      {
        user_id: providerId,
        request_id: null,
        type: 'subscription_reminder',
        title: 'Subscription Active',
        message: 'Your provider subscription is active. You have unlimited proposals!',
        is_read: false,
        created_at: daysAgo(1)
      },
      {
        user_id: providerId,
        request_id: requestIds.fence,
        type: 'review_request',
        title: 'Request a Review',
        message: 'Fence repair completed! Remind Demo Requester to leave a review',
        is_read: true,
        created_at: daysAgo(5)
      },
      {
        user_id: providerId,
        request_id: null,
        type: 'new_message',
        title: 'New Message',
        message: 'Demo Requester sent you a message about scheduling',
        is_read: false,
        created_at: hoursAgo(12)
      },
      {
        user_id: providerId,
        request_id: requestIds.landscaping,
        type: 'new_message',
        title: 'New Message',
        message: 'Demo Requester responded to your lawn care proposal',
        is_read: false,
        created_at: hoursAgo(8)
      }
    ]);

    // Add Referral Data
    await supabaseAdmin.from('referral_codes').upsert({
      user_id: providerId,
      code: 'DEMO2024',
      referral_link: 'https://fayvrs.com/ref/DEMO2024',
      is_active: true,
      total_clicks: 24
    });

    await supabaseAdmin.from('referrer_earnings').upsert({
      user_id: providerId,
      pending_balance: 45.00,
      available_balance: 180.00,
      total_withdrawn: 60.00,
      lifetime_earnings: 285.00,
      active_referrals_count: 3,
      total_referrals_count: 5
    });

    console.log('Demo accounts setup complete!');

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Demo accounts created successfully with enhanced data for App Store review',
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
        },
        summary: {
          requests: 10,
          proposals: 7,
          messageThreads: 7,
          notifications: 16,
          portfolioItems: 10
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
