-- Add admin role to samuelkennethjohnsonjr@gmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('5d580ab1-9ab3-47c8-845d-890137f34d28', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;