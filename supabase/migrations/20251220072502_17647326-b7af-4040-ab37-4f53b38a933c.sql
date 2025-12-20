-- Add INSERT policy for fleet managers to create drivers
CREATE POLICY "Fleet managers can insert drivers"
ON public.drivers
FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role, 'operations'::app_role]));

-- Add UPDATE policy for fleet managers to update drivers
CREATE POLICY "Fleet managers can update drivers"
ON public.drivers
FOR UPDATE
USING (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role, 'operations'::app_role]));

-- Add DELETE policy for fleet managers to delete drivers
CREATE POLICY "Fleet managers can delete drivers"
ON public.drivers
FOR DELETE
USING (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role]));