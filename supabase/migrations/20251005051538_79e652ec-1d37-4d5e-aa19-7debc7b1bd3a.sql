-- Fix calculate_distance_miles function to set search_path (security best practice)
CREATE OR REPLACE FUNCTION public.calculate_distance_miles(
  lat1 numeric,
  lng1 numeric,
  lat2 numeric,
  lng2 numeric
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN (
    earth_distance(
      ll_to_earth(lat1, lng1),
      ll_to_earth(lat2, lng2)
    ) / 1609.34
  );
END;
$$;