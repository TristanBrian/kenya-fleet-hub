-- Remove the restrictive check constraint on profiles.role
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Add a more flexible check constraint or none at all
-- Since we have a separate user_roles table for proper role management,
-- the profiles.role can be a simple text field
ALTER TABLE public.profiles 
  ALTER COLUMN role TYPE text;