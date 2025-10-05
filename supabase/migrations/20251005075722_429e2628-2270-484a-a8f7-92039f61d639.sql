-- Drop existing public view policy
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON profiles;

-- Create policy for users to view their own complete profile (including phone)
CREATE POLICY "Users can view own complete profile"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Create policy for viewing other users' profiles (excluding sensitive data)
-- Note: Application layer must filter out phone field when querying other users' profiles
CREATE POLICY "Users can view other public profiles"
ON profiles
FOR SELECT
TO authenticated
USING (auth.uid() != id);

-- Allow anonymous users to view public profile info (excluding phone)
-- Note: Application layer must filter out phone field for anonymous access
CREATE POLICY "Anonymous users can view public profiles"
ON profiles
FOR SELECT
TO anon
USING (true);