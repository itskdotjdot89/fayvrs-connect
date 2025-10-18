-- Create function to find nearby providers
CREATE OR REPLACE FUNCTION public.find_nearby_providers(
  req_latitude NUMERIC,
  req_longitude NUMERIC,
  radius_miles INTEGER DEFAULT 25,
  req_category TEXT DEFAULT NULL
)
RETURNS TABLE(
  provider_id UUID,
  provider_name TEXT,
  provider_email TEXT,
  provider_avatar TEXT,
  provider_bio TEXT,
  provider_location TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  service_radius INTEGER,
  distance_miles NUMERIC,
  is_verified BOOLEAN,
  specialties TEXT[]
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id AS provider_id,
    p.full_name AS provider_name,
    p.email AS provider_email,
    p.avatar_url AS provider_avatar,
    p.bio AS provider_bio,
    p.location AS provider_location,
    p.latitude,
    p.longitude,
    p.service_radius,
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
    p.is_verified,
    -- Get array of provider specialties
    ARRAY(
      SELECT ps.category 
      FROM provider_specialties ps 
      WHERE ps.provider_id = p.id
    ) AS specialties
  FROM profiles p
  INNER JOIN user_roles ur ON ur.user_id = p.id
  LEFT JOIN provider_subscriptions ps ON ps.provider_id = p.id
  WHERE 
    -- Must be a provider
    ur.role = 'provider'
    -- Must have location set
    AND p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    -- Must have active subscription
    AND ps.status = 'active' 
    AND ps.expires_at > NOW()
    -- Within specified radius
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
    ) <= radius_miles
    -- Category filter (if specified)
    AND (
      req_category IS NULL 
      OR EXISTS (
        SELECT 1 FROM provider_specialties ps2 
        WHERE ps2.provider_id = p.id 
        AND ps2.category ILIKE req_category
      )
    )
  ORDER BY distance_miles ASC
  LIMIT 50;
END;
$$;