-- Ensure proper function security
ALTER FUNCTION auth.authenticate SECURITY DEFINER SET search_path = auth, public, extensions;
ALTER FUNCTION auth.create_user SECURITY DEFINER SET search_path = auth, public, extensions;

-- Improve profile sync on user creation
CREATE OR REPLACE FUNCTION auth.create_user(
  email text,
  password text,
  meta_data jsonb DEFAULT '{}'::jsonb
)
RETURNS auth.users AS $$
DECLARE
  new_user auth.users;
  profile_created boolean;
  retry_count int := 0;
  max_retries int := 3;
BEGIN
  -- Create auth user
  INSERT INTO auth.users (
    email,
    encrypted_password,
    raw_user_meta_data,
    email_confirmed_at -- Auto-confirm for demo
  )
  VALUES (
    email,
    crypt(password, gen_salt('bf')),
    meta_data,
    now()
  )
  RETURNING * INTO new_user;

  -- Attempt profile creation with retries
  WHILE retry_count < max_retries LOOP
    BEGIN
      INSERT INTO public.profiles (
        id,
        email,
        role,
        full_name,
        created_at,
        updated_at
      )
      VALUES (
        new_user.id,
        new_user.email,
        CASE 
          WHEN new_user.email LIKE 'demo.%@example.com' THEN 
            CASE 
              WHEN new_user.email = 'demo.admin@example.com' THEN 'admin'::user_role
              WHEN new_user.email = 'demo.processor@example.com' THEN 'processor'::user_role
              ELSE 'user'::user_role
            END
          ELSE 'user'::user_role
        END,
        COALESCE(
          meta_data->>'full_name',
          split_part(new_user.email, '@', 1)
        ),
        now(),
        now()
      );
      
      profile_created := true;
      EXIT;
    EXCEPTION WHEN others THEN
      retry_count := retry_count + 1;
      IF retry_count = max_retries THEN
        RAISE WARNING 'Failed to create profile for user % after % attempts', new_user.id, max_retries;
      END IF;
      PERFORM pg_sleep(power(2, retry_count - 1) * 0.1);
    END;
  END LOOP;

  RETURN new_user;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = auth, public, extensions;

-- Ensure proper schema search path for auth functions
DO $$ 
BEGIN
  -- Update existing functions if they exist
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'authenticate') THEN
    ALTER FUNCTION auth.authenticate SECURITY DEFINER SET search_path = auth, public, extensions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'email_matches') THEN
    ALTER FUNCTION public.email_matches SECURITY DEFINER SET search_path = auth, public, extensions;
  END IF;
  
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'user_has_role') THEN
    ALTER FUNCTION public.user_has_role SECURITY DEFINER SET search_path = auth, public, extensions;
  END IF;
END $$;