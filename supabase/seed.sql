-- supabase/seed.sql
-- Initial admin user creation
INSERT INTO auth.users (
    email,
    encrypted_password,
    email_confirmed_at
) VALUES (
    'admin@example.com',
    crypt('admin123', gen_salt('bf')),
    now()
) ON CONFLICT DO NOTHING;

-- Set up admin profile
INSERT INTO public.profiles (
    id,
    role,
    email
) 
SELECT 
    id,
    'admin'::user_role,
    email
FROM auth.users 
WHERE email = 'admin@example.com'
ON CONFLICT DO NOTHING;
