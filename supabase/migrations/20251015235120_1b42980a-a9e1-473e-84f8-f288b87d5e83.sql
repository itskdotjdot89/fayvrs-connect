-- Fix RLS security issues by adding proper admin policies

-- 1. Add admin policy for viewing all identity verifications
CREATE POLICY "Admins can view all verifications"
ON public.identity_verifications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 2. Add admin policy for updating any identity verification
CREATE POLICY "Admins can update any verification"
ON public.identity_verifications
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 3. Add admin policy to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 4. Add admin policy to update any profile
CREATE POLICY "Admins can update any profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 5. Add admin policy to view all requests
CREATE POLICY "Admins can view all requests"
ON public.requests
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 6. Add admin policy to update any request
CREATE POLICY "Admins can update any request"
ON public.requests
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 7. Add admin policy to view all proposals
CREATE POLICY "Admins can view all proposals"
ON public.proposals
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 8. Add admin policy to view all messages
CREATE POLICY "Admins can view all messages"
ON public.messages
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 9. Add admin policy to view all notifications
CREATE POLICY "Admins can view all notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 10. Add admin policy to view all provider subscriptions
CREATE POLICY "Admins can view all subscriptions"
ON public.provider_subscriptions
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 11. Add admin policy to update provider subscriptions
CREATE POLICY "Admins can update any subscription"
ON public.provider_subscriptions
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- 12. Add policy for service role to insert notifications (for edge functions)
CREATE POLICY "Service role can insert notifications"
ON public.notifications
FOR INSERT
TO service_role
WITH CHECK (true);

-- 13. Add policy for service role to update provider subscriptions (for edge functions)
CREATE POLICY "Service role can insert subscriptions"
ON public.provider_subscriptions
FOR INSERT
TO service_role
WITH CHECK (true);

CREATE POLICY "Service role can update subscriptions"
ON public.provider_subscriptions
FOR UPDATE
TO service_role
USING (true);

-- 14. Ensure user_roles table has proper admin policies
CREATE POLICY "Admins can view all user roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));