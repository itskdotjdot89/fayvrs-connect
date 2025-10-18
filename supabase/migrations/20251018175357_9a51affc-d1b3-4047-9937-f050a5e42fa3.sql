-- Drop existing function first
DROP FUNCTION IF EXISTS public.find_nearby_requests(numeric, numeric, integer, text);

-- Recreate with latitude and longitude in return type
CREATE OR REPLACE FUNCTION public.find_nearby_requests(
  provider_latitude numeric, 
  provider_longitude numeric, 
  radius_miles integer DEFAULT 25, 
  req_category text DEFAULT NULL::text
)
RETURNS TABLE(
  request_id uuid, 
  title text, 
  description text, 
  category text, 
  location text, 
  latitude numeric,
  longitude numeric,
  distance_miles numeric, 
  budget_min numeric, 
  budget_max numeric, 
  created_at timestamp with time zone, 
  requester_name text
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  RETURN QUERY
  SELECT 
    r.id AS request_id,
    r.title,
    r.description,
    r.category,
    r.location,
    r.latitude,
    r.longitude,
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
$function$;