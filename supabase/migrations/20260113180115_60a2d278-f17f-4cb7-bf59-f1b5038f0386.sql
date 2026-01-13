-- Add missing RLS policies for maintenance_logs (UPDATE and DELETE)
CREATE POLICY "Fleet managers and operations can update maintenance logs"
ON public.maintenance_logs
FOR UPDATE
USING (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role, 'operations'::app_role]));

CREATE POLICY "Fleet managers can delete maintenance logs"
ON public.maintenance_logs
FOR DELETE
USING (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role]));

-- Add missing RLS policies for trips (INSERT, UPDATE, DELETE)
CREATE POLICY "Fleet managers and operations can insert trips"
ON public.trips
FOR INSERT
WITH CHECK (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role, 'operations'::app_role]));

CREATE POLICY "Fleet managers and operations can update trips"
ON public.trips
FOR UPDATE
USING (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role, 'operations'::app_role]));

CREATE POLICY "Fleet managers can delete trips"
ON public.trips
FOR DELETE
USING (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role]));

-- Add missing vehicle types that are used in existing data
INSERT INTO public.vehicle_types (name, description)
VALUES 
  ('matatu', 'Public service vehicle/minibus'),
  ('truck', 'Heavy cargo truck'),
  ('bus', 'Long-distance passenger bus')
ON CONFLICT (name) DO NOTHING;