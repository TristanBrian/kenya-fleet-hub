-- Create app_role enum for role-based access
CREATE TYPE public.app_role AS ENUM ('fleet_manager', 'operations', 'driver', 'finance');

-- Create user_roles table (CRITICAL: separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function to check user roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Function to check if user has any of multiple roles
CREATE OR REPLACE FUNCTION public.has_any_role(_user_id UUID, _roles app_role[])
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = ANY(_roles)
  )
$$;

-- RLS policy for user_roles table
CREATE POLICY "Users can view their own roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Create trips table for route assignments
CREATE TABLE public.trips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  route TEXT NOT NULL,
  start_location TEXT NOT NULL,
  end_location TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  estimated_duration_hours NUMERIC,
  distance_km NUMERIC,
  status TEXT NOT NULL DEFAULT 'in_progress',
  progress_percent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.trips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fleet managers and operations can view all trips"
ON public.trips
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['fleet_manager', 'operations', 'finance']::app_role[]));

CREATE POLICY "Drivers can view their own trips"
ON public.trips
FOR SELECT
TO authenticated
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Create live_locations table for GPS tracking
CREATE TABLE public.live_locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE CASCADE NOT NULL,
  trip_id UUID REFERENCES public.trips(id) ON DELETE CASCADE,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  speed_kmh NUMERIC,
  heading NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.live_locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Fleet managers and operations can view all locations"
ON public.live_locations
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['fleet_manager', 'operations']::app_role[]));

-- Update drivers table to add performance metrics
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS speeding_incidents INTEGER DEFAULT 0;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS harsh_braking_events INTEGER DEFAULT 0;
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS idle_time_hours NUMERIC DEFAULT 0;

-- Update vehicles table for better tracking
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS fuel_efficiency_kml NUMERIC DEFAULT 6.2;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS monthly_fuel_consumption_liters NUMERIC DEFAULT 0;
ALTER TABLE public.vehicles ADD COLUMN IF NOT EXISTS maintenance_status TEXT DEFAULT 'good';

-- Update RLS policies for vehicles to use user_roles
DROP POLICY IF EXISTS "Managers can view all vehicles" ON public.vehicles;
DROP POLICY IF EXISTS "Drivers can view assigned vehicles" ON public.vehicles;

CREATE POLICY "Fleet managers and operations can view all vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['fleet_manager', 'operations', 'finance']::app_role[]));

CREATE POLICY "Drivers can view their assigned vehicles"
ON public.vehicles
FOR SELECT
TO authenticated
USING (id IN (SELECT vehicle_id FROM public.drivers WHERE user_id = auth.uid()));

-- Update RLS policies for drivers to use user_roles
DROP POLICY IF EXISTS "Managers can view all drivers" ON public.drivers;
DROP POLICY IF EXISTS "Drivers can view their own record" ON public.drivers;

CREATE POLICY "Fleet managers and operations can view all drivers"
ON public.drivers
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['fleet_manager', 'operations']::app_role[]));

CREATE POLICY "Drivers can view their own record"
ON public.drivers
FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Update RLS policies for maintenance_logs
DROP POLICY IF EXISTS "Managers can view all maintenance logs" ON public.maintenance_logs;
DROP POLICY IF EXISTS "Managers can insert maintenance logs" ON public.maintenance_logs;

CREATE POLICY "Fleet managers, operations, and finance can view maintenance logs"
ON public.maintenance_logs
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['fleet_manager', 'operations', 'finance']::app_role[]));

CREATE POLICY "Fleet managers and operations can insert maintenance logs"
ON public.maintenance_logs
FOR INSERT
TO authenticated
WITH CHECK (public.has_any_role(auth.uid(), ARRAY['fleet_manager', 'operations']::app_role[]));

-- Update RLS policies for fuel_logs
DROP POLICY IF EXISTS "Managers can view all fuel logs" ON public.fuel_logs;
DROP POLICY IF EXISTS "Drivers can view their fuel logs" ON public.fuel_logs;

CREATE POLICY "Fleet managers, operations, and finance can view fuel logs"
ON public.fuel_logs
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['fleet_manager', 'operations', 'finance']::app_role[]));

CREATE POLICY "Drivers can view their own fuel logs"
ON public.fuel_logs
FOR SELECT
TO authenticated
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

-- Enable realtime for live tracking
ALTER PUBLICATION supabase_realtime ADD TABLE public.live_locations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.trips;

-- Create trigger for trips updated_at
CREATE TRIGGER update_trips_updated_at
BEFORE UPDATE ON public.trips
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();