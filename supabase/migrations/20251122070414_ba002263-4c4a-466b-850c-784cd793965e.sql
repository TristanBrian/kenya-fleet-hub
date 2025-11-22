-- Enable INSERT for fleet managers on vehicles table
DROP POLICY IF EXISTS "Fleet managers can insert vehicles" ON public.vehicles;
CREATE POLICY "Fleet managers can insert vehicles" 
ON public.vehicles 
FOR INSERT 
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role, 'operations'::app_role]));

-- Enable UPDATE for fleet managers on vehicles table
DROP POLICY IF EXISTS "Fleet managers can update vehicles" ON public.vehicles;
CREATE POLICY "Fleet managers can update vehicles" 
ON public.vehicles 
FOR UPDATE 
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role, 'operations'::app_role]));

-- Enable DELETE for fleet managers on vehicles table
DROP POLICY IF EXISTS "Fleet managers can delete vehicles" ON public.vehicles;
CREATE POLICY "Fleet managers can delete vehicles" 
ON public.vehicles 
FOR DELETE 
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role, 'operations'::app_role]));

-- Create vehicle_types table
CREATE TABLE IF NOT EXISTS public.vehicle_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.vehicle_types ENABLE ROW LEVEL SECURITY;

-- RLS policies for vehicle_types
CREATE POLICY "Everyone can view vehicle types" 
ON public.vehicle_types 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Fleet managers can insert vehicle types" 
ON public.vehicle_types 
FOR INSERT 
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role]));

CREATE POLICY "Fleet managers can update vehicle types" 
ON public.vehicle_types 
FOR UPDATE 
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role]));

CREATE POLICY "Fleet managers can delete vehicle types" 
ON public.vehicle_types 
FOR DELETE 
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role]));

-- Create routes_master table
CREATE TABLE IF NOT EXISTS public.routes_master (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  distance_km NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.routes_master ENABLE ROW LEVEL SECURITY;

-- RLS policies for routes_master
CREATE POLICY "Everyone can view routes" 
ON public.routes_master 
FOR SELECT 
TO authenticated
USING (true);

CREATE POLICY "Fleet managers can insert routes" 
ON public.routes_master 
FOR INSERT 
TO authenticated
WITH CHECK (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role]));

CREATE POLICY "Fleet managers can update routes" 
ON public.routes_master 
FOR UPDATE 
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role]));

CREATE POLICY "Fleet managers can delete routes" 
ON public.routes_master 
FOR DELETE 
TO authenticated
USING (has_any_role(auth.uid(), ARRAY['fleet_manager'::app_role]));

-- Insert mock vehicle types
INSERT INTO public.vehicle_types (name, description) VALUES
  ('Truck - 10 Ton', 'Medium capacity cargo truck'),
  ('Truck - 20 Ton', 'Large capacity cargo truck'),
  ('Lorry', 'Standard commercial lorry'),
  ('Van', 'Light commercial van'),
  ('Pickup', 'Utility pickup truck'),
  ('Flatbed', 'Flatbed trailer truck')
ON CONFLICT (name) DO NOTHING;

-- Insert mock routes
INSERT INTO public.routes_master (name, start_location, end_location, distance_km) VALUES
  ('Nairobi-Mombasa Highway', 'Nairobi', 'Mombasa', 480),
  ('Thika-Nakuru Route', 'Thika', 'Nakuru', 180),
  ('Nairobi-Kisumu Highway', 'Nairobi', 'Kisumu', 350),
  ('Mombasa-Malindi Coastal', 'Mombasa', 'Malindi', 120),
  ('Nairobi-Eldoret Route', 'Nairobi', 'Eldoret', 310),
  ('Western Circuit', 'Nairobi', 'Kisii', 380)
ON CONFLICT (name) DO NOTHING;

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_vehicle_types_updated_at ON public.vehicle_types;
CREATE TRIGGER update_vehicle_types_updated_at
    BEFORE UPDATE ON public.vehicle_types
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_routes_master_updated_at ON public.routes_master;
CREATE TRIGGER update_routes_master_updated_at
    BEFORE UPDATE ON public.routes_master
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();