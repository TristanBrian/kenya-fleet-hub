-- Drop the restrictive vehicle_type check constraint
ALTER TABLE public.vehicles DROP CONSTRAINT vehicles_vehicle_type_check;

-- Add a new constraint that includes all vehicle types from the vehicle_types table
-- Using a more flexible approach that allows any non-empty text
ALTER TABLE public.vehicles ADD CONSTRAINT vehicles_vehicle_type_check 
CHECK (vehicle_type IS NOT NULL AND length(trim(vehicle_type)) > 0);