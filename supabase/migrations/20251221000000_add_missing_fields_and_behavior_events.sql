-- Add missing fields to vehicles table
ALTER TABLE public.vehicles 
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS next_service_due DATE;

-- Add fuel_used to trips table (can also be calculated from fuel_logs)
ALTER TABLE public.trips
ADD COLUMN IF NOT EXISTS fuel_used NUMERIC DEFAULT 0;

-- Create driver_behavior_events table for tracking individual events
CREATE TABLE IF NOT EXISTS public.driver_behavior_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  vehicle_id UUID REFERENCES public.vehicles(id) ON DELETE SET NULL,
  event_type TEXT NOT NULL CHECK (event_type IN ('speeding', 'harsh_braking', 'harsh_acceleration', 'excessive_idling', 'rapid_lane_change', 'other')),
  severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  description TEXT,
  location_latitude NUMERIC,
  location_longitude NUMERIC,
  speed_kmh NUMERIC,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.driver_behavior_events ENABLE ROW LEVEL SECURITY;

-- RLS policies for driver_behavior_events
CREATE POLICY "Fleet managers and operations can view all behavior events"
ON public.driver_behavior_events
FOR SELECT
TO authenticated
USING (public.has_any_role(auth.uid(), ARRAY['fleet_manager', 'operations']::app_role[]));

CREATE POLICY "Drivers can view their own behavior events"
ON public.driver_behavior_events
FOR SELECT
TO authenticated
USING (driver_id IN (SELECT id FROM public.drivers WHERE user_id = auth.uid()));

CREATE POLICY "System can insert behavior events"
ON public.driver_behavior_events
FOR INSERT
TO authenticated
WITH CHECK (true);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_driver_behavior_events_driver_id ON public.driver_behavior_events(driver_id);
CREATE INDEX IF NOT EXISTS idx_driver_behavior_events_timestamp ON public.driver_behavior_events(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_driver_behavior_events_event_type ON public.driver_behavior_events(event_type);

-- Function to automatically update driver metrics when behavior events are inserted
CREATE OR REPLACE FUNCTION public.update_driver_metrics_from_event()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.event_type = 'speeding' THEN
    UPDATE public.drivers
    SET speeding_incidents = COALESCE(speeding_incidents, 0) + 1
    WHERE id = NEW.driver_id;
  ELSIF NEW.event_type = 'harsh_braking' THEN
    UPDATE public.drivers
    SET harsh_braking_events = COALESCE(harsh_braking_events, 0) + 1
    WHERE id = NEW.driver_id;
  ELSIF NEW.event_type = 'excessive_idling' THEN
    UPDATE public.drivers
    SET idle_time_hours = COALESCE(idle_time_hours, 0) + 0.5
    WHERE id = NEW.driver_id;
  END IF;
  
  -- Recalculate performance score
  UPDATE public.drivers
  SET performance_score = GREATEST(0, LEAST(100, 
    100 - (COALESCE(speeding_incidents, 0) * 2) - 
    (COALESCE(harsh_braking_events, 0) * 3) - 
    (COALESCE(idle_time_hours, 0)::INTEGER * 1)
  ))
  WHERE id = NEW.driver_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger to update driver metrics
CREATE TRIGGER update_driver_metrics_on_behavior_event
AFTER INSERT ON public.driver_behavior_events
FOR EACH ROW
EXECUTE FUNCTION public.update_driver_metrics_from_event();

-- Add contact_info to drivers table (if not exists via profiles)
-- Note: contact_info is in profiles.mobile_phone, but adding for clarity
COMMENT ON COLUMN public.drivers.license_number IS 'Driver license number';
COMMENT ON COLUMN public.vehicles.model IS 'Vehicle model/make';
COMMENT ON COLUMN public.vehicles.next_service_due IS 'Next scheduled service date';

