-- Add both roles to demo accounts for role switching feature

-- Add requester role to demo-provider account
INSERT INTO user_roles (user_id, role)
VALUES ('7c067834-7bbb-4092-ba08-6c9b82d6073a', 'requester')
ON CONFLICT (user_id, role) DO NOTHING;

-- Add provider role to demo-requester account  
INSERT INTO user_roles (user_id, role)
VALUES ('b445d9e8-e75d-4e2f-93af-ab92919ecdd9', 'provider')
ON CONFLICT (user_id, role) DO NOTHING;