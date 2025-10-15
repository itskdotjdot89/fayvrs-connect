-- Phase 4: Provider Matching & Notifications - Database Setup

-- Add service_radius column to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS service_radius INTEGER DEFAULT 25;

ALTER TABLE public.profiles 
ADD CONSTRAINT service_radius_range 
CHECK (service_radius >= 5 AND service_radius <= 100);

COMMENT ON COLUMN public.profiles.service_radius IS 
'Maximum distance (in miles) provider is willing to travel for jobs';

-- Add latitude and longitude to requests table
ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS latitude NUMERIC;

ALTER TABLE public.requests
ADD COLUMN IF NOT EXISTS longitude NUMERIC;

COMMENT ON COLUMN public.requests.latitude IS 'Latitude coordinate from geocoded location';
COMMENT ON COLUMN public.requests.longitude IS 'Longitude coordinate from geocoded location';

-- Create find_providers_in_radius function
CREATE OR REPLACE FUNCTION public.find_providers_in_radius(
  req_latitude NUMERIC,
  req_longitude NUMERIC,
  req_category TEXT DEFAULT NULL,
  radius_miles INTEGER DEFAULT 25
)
RETURNS TABLE (
  provider_id UUID,
  provider_name TEXT,
  provider_email TEXT,
  provider_phone TEXT,
  distance_miles NUMERIC,
  has_specialty BOOLEAN,
  has_push BOOLEAN,
  has_email BOOLEAN,
  has_sms BOOLEAN,
  has_in_app BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS provider_id,
    p.full_name AS provider_name,
    p.email AS provider_email,
    p.phone AS provider_phone,
    -- Calculate distance using Haversine formula
    (
      3959 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(req_latitude)) * 
          cos(radians(p.latitude)) * 
          cos(radians(p.longitude) - radians(req_longitude)) + 
          sin(radians(req_latitude)) * 
          sin(radians(p.latitude))
        ))
      )
    )::NUMERIC(10, 2) AS distance_miles,
    -- Check if provider has matching specialty
    EXISTS (
      SELECT 1 FROM provider_specialties ps 
      WHERE ps.provider_id = p.id 
      AND (req_category IS NULL OR ps.category ILIKE req_category)
    ) AS has_specialty,
    -- Get notification preferences
    COALESCE(np.push_enabled, true) AS has_push,
    COALESCE(np.email_enabled, true) AS has_email,
    COALESCE(np.sms_enabled, false) AS has_sms,
    COALESCE(np.in_app_enabled, true) AS has_in_app
  FROM profiles p
  LEFT JOIN notification_preferences np ON np.user_id = p.id
  LEFT JOIN provider_subscriptions ps ON ps.provider_id = p.id
  WHERE 
    -- Must be a provider
    EXISTS (
      SELECT 1 FROM user_roles ur 
      WHERE ur.user_id = p.id AND ur.role = 'provider'
    )
    -- Must have location set
    AND p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    -- Must have active subscription
    AND ps.status = 'active' 
    AND ps.expires_at > NOW()
    -- Within provider's service radius (or use request radius if not set)
    AND (
      3959 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(req_latitude)) * 
          cos(radians(p.latitude)) * 
          cos(radians(p.longitude) - radians(req_longitude)) + 
          sin(radians(req_latitude)) * 
          sin(radians(p.latitude))
        ))
      )
    ) <= COALESCE(p.service_radius, radius_miles)
  ORDER BY distance_miles ASC
  LIMIT 50;
END;
$$;

-- Create find_nearby_requests function
CREATE OR REPLACE FUNCTION public.find_nearby_requests(
  provider_latitude NUMERIC,
  provider_longitude NUMERIC,
  radius_miles INTEGER DEFAULT 25,
  req_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  request_id UUID,
  title TEXT,
  description TEXT,
  category TEXT,
  location TEXT,
  distance_miles NUMERIC,
  budget_min NUMERIC,
  budget_max NUMERIC,
  created_at TIMESTAMPTZ,
  requester_name TEXT
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    r.id AS request_id,
    r.title,
    r.description,
    r.category,
    r.location,
    -- Calculate distance
    (
      3959 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(provider_latitude)) * 
          cos(radians(r.latitude)) * 
          cos(radians(r.longitude) - radians(provider_longitude)) + 
          sin(radians(provider_latitude)) * 
          sin(radians(r.latitude))
        ))
      )
    )::NUMERIC(10, 2) AS distance_miles,
    r.budget_min,
    r.budget_max,
    r.created_at,
    p.full_name AS requester_name
  FROM requests r
  JOIN profiles p ON p.id = r.user_id
  WHERE 
    r.status = 'open'
    AND r.latitude IS NOT NULL
    AND r.longitude IS NOT NULL
    -- Within radius
    AND (
      3959 * acos(
        LEAST(1.0, GREATEST(-1.0,
          cos(radians(provider_latitude)) * 
          cos(radians(r.latitude)) * 
          cos(radians(r.longitude) - radians(provider_longitude)) + 
          sin(radians(provider_latitude)) * 
          sin(radians(r.latitude))
        ))
      )
    ) <= radius_miles
    -- Category match (if specified)
    AND (req_category IS NULL OR r.category ILIKE req_category)
  ORDER BY distance_miles ASC
  LIMIT 20;
END;
$$;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_location 
ON profiles(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_requests_location 
ON requests(latitude, longitude) 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_provider_specialties_provider_category 
ON provider_specialties(provider_id, category);

CREATE INDEX IF NOT EXISTS idx_notification_preferences_user 
ON notification_preferences(user_id);

CREATE INDEX IF NOT EXISTS idx_provider_subscriptions_status
ON provider_subscriptions(provider_id, status, expires_at);