-- Allow fleet managers to view all profiles (needed to see driver info)
CREATE POLICY "Fleet managers can view all profiles"
ON public.profiles
FOR SELECT
USING (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role, 'operations'::app_role]));