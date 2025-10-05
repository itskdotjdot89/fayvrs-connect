-- Enable PostGIS extension for geographic calculations
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS earthdistance CASCADE;

-- Add geolocation columns to profiles
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS latitude numeric,
ADD COLUMN IF NOT EXISTS longitude numeric;

-- Add index for geographic queries
CREATE INDEX IF NOT EXISTS idx_profiles_coordinates ON public.profiles(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Create provider_specialties table
CREATE TABLE IF NOT EXISTS public.provider_specialties (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  category text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(provider_id, category)
);

-- Enable RLS on provider_specialties
ALTER TABLE public.provider_specialties ENABLE ROW LEVEL SECURITY;

-- RLS policies for provider_specialties
CREATE POLICY "Anyone can view provider specialties"
  ON public.provider_specialties
  FOR SELECT
  USING (true);

CREATE POLICY "Providers can insert own specialties"
  ON public.provider_specialties
  FOR INSERT
  WITH CHECK (auth.uid() = provider_id);

CREATE POLICY "Providers can update own specialties"
  ON public.provider_specialties
  FOR UPDATE
  USING (auth.uid() = provider_id);

CREATE POLICY "Providers can delete own specialties"
  ON public.provider_specialties
  FOR DELETE
  USING (auth.uid() = provider_id);

-- Create notification_preferences table
CREATE TABLE IF NOT EXISTS public.notification_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE UNIQUE,
  push_enabled boolean DEFAULT true,
  email_enabled boolean DEFAULT true,
  sms_enabled boolean DEFAULT false,
  in_app_enabled boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notification_preferences
ALTER TABLE public.notification_preferences ENABLE ROW LEVEL SECURITY;

-- RLS policies for notification_preferences
CREATE POLICY "Users can view own notification preferences"
  ON public.notification_preferences
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own notification preferences"
  ON public.notification_preferences
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences"
  ON public.notification_preferences
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type text NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  request_id uuid REFERENCES public.requests(id) ON DELETE CASCADE,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on notifications
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- RLS policies for notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
  ON public.notifications
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Add index for notification queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id_is_read ON public.notifications(user_id, is_read);

-- Create trigger for notification_preferences updated_at
CREATE TRIGGER update_notification_preferences_updated_at
  BEFORE UPDATE ON public.notification_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Create function to calculate distance between two points (in miles)
CREATE OR REPLACE FUNCTION public.calculate_distance_miles(
  lat1 numeric,
  lng1 numeric,
  lat2 numeric,
  lng2 numeric
)
RETURNS numeric
LANGUAGE plpgsql
IMMUTABLE
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

-- Create function to find providers within radius
CREATE OR REPLACE FUNCTION public.find_providers_in_radius(
  req_latitude numeric,
  req_longitude numeric,
  req_category text,
  radius_miles numeric DEFAULT 25
)
RETURNS TABLE (
  provider_id uuid,
  full_name text,
  email text,
  phone text,
  distance_miles numeric,
  has_push boolean,
  has_email boolean,
  has_sms boolean,
  has_in_app boolean
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id as provider_id,
    p.full_name,
    p.email,
    p.phone,
    calculate_distance_miles(req_latitude, req_longitude, p.latitude, p.longitude) as distance_miles,
    COALESCE(np.push_enabled, true) as has_push,
    COALESCE(np.email_enabled, true) as has_email,
    COALESCE(np.sms_enabled, false) as has_sms,
    COALESCE(np.in_app_enabled, true) as has_in_app
  FROM profiles p
  INNER JOIN user_roles ur ON p.id = ur.user_id
  LEFT JOIN provider_specialties ps ON p.id = ps.provider_id
  LEFT JOIN notification_preferences np ON p.id = np.user_id
  WHERE ur.role = 'provider'
    AND p.latitude IS NOT NULL 
    AND p.longitude IS NOT NULL
    AND (req_category IS NULL OR ps.category = req_category)
    AND calculate_distance_miles(req_latitude, req_longitude, p.latitude, p.longitude) <= radius_miles
  GROUP BY p.id, p.full_name, p.email, p.phone, p.latitude, p.longitude, np.push_enabled, np.email_enabled, np.sms_enabled, np.in_app_enabled;
END;
$$;