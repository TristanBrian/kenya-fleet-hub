-- ============================================
-- Kenya Fleet Hub FMCS - Sample Data Seeding
-- ============================================
-- Run this script in Supabase SQL Editor after running all migrations
-- This will populate sample data for testing and demonstration

-- ============================================
-- 1. INSERT SAMPLE VEHICLES
-- ============================================
INSERT INTO public.vehicles (
  license_plate, vehicle_type, model, route_assigned, status, 
  current_latitude, current_longitude, last_service_date, next_service_due, 
  insurance_expiry, fuel_efficiency_kml, monthly_fuel_consumption_liters, maintenance_status
)
VALUES
  ('KBC 234Y', 'matatu', 'Toyota Hiace', 'Nairobi-Mombasa', 'active', -1.2921, 36.8219, '2024-11-15', '2025-02-15', '2025-06-30', 6.5, 1200, 'good'),
  ('KDA 567B', 'truck', 'Isuzu NPR', 'Nairobi-Nakuru', 'maintenance', -0.3031, 36.0800, '2024-10-20', '2025-01-20', '2025-05-15', 5.8, 1800, 'due_soon'),
  ('KBM 890C', 'matatu', 'Nissan Urvan', 'Thika Highway', 'active', -1.0333, 37.0833, '2024-12-01', '2025-03-01', '2025-07-20', 7.2, 950, 'good'),
  ('KCA 123D', 'bus', 'Scania K270', 'Nairobi-Kisumu', 'active', -0.0917, 34.7680, '2024-11-10', '2025-02-10', '2025-08-10', 4.5, 2500, 'good'),
  ('KAB 456E', 'truck', 'Mercedes-Benz Actros', 'Nairobi-Mombasa', 'active', -2.7833, 38.2333, '2024-10-05', '2025-01-05', '2025-04-30', 6.0, 2000, 'good')
ON CONFLICT (license_plate) DO NOTHING;

-- ============================================
-- 2. INSERT SAMPLE MAINTENANCE LOGS
-- ============================================
INSERT INTO public.maintenance_logs (vehicle_id, service_type, description, date_performed, cost_kes, next_due_date, performed_by)
SELECT 
  v.id,
  'Oil Change',
  'Regular oil change and filter replacement',
  '2024-11-15',
  8500,
  '2025-02-15',
  'AutoCare Nairobi'
FROM public.vehicles v WHERE v.license_plate = 'KBC 234Y'
ON CONFLICT DO NOTHING;

INSERT INTO public.maintenance_logs (vehicle_id, service_type, description, date_performed, cost_kes, next_due_date, performed_by)
SELECT 
  v.id,
  'Major Service',
  'Full service including brakes, transmission, and engine check',
  '2024-10-20',
  45000,
  '2025-01-20',
  'Kenya Motors'
FROM public.vehicles v WHERE v.license_plate = 'KDA 567B'
ON CONFLICT DO NOTHING;

INSERT INTO public.maintenance_logs (vehicle_id, service_type, description, date_performed, cost_kes, next_due_date, performed_by)
SELECT 
  v.id,
  'Tire Replacement',
  'Replaced 4 tires',
  '2024-12-01',
  120000,
  '2025-06-01',
  'Tire Center Thika'
FROM public.vehicles v WHERE v.license_plate = 'KBM 890C'
ON CONFLICT DO NOTHING;

INSERT INTO public.maintenance_logs (vehicle_id, service_type, description, date_performed, cost_kes, next_due_date, performed_by)
SELECT 
  v.id,
  'Engine Repair',
  'Engine overhaul and parts replacement',
  '2024-11-10',
  120000,
  '2025-05-10',
  'Kenya Motors'
FROM public.vehicles v WHERE v.license_plate = 'KCA 123D'
ON CONFLICT DO NOTHING;

INSERT INTO public.maintenance_logs (vehicle_id, service_type, description, date_performed, cost_kes, next_due_date, performed_by)
SELECT 
  v.id,
  'Brake Service',
  'Brake pad replacement and fluid change',
  '2024-10-05',
  25000,
  '2025-04-05',
  'AutoCare Nairobi'
FROM public.vehicles v WHERE v.license_plate = 'KAB 456E'
ON CONFLICT DO NOTHING;

-- ============================================
-- 3. INSERT SAMPLE FUEL LOGS
-- ============================================
INSERT INTO public.fuel_logs (vehicle_id, driver_id, liters, price_per_liter_kes, station_location, route, odometer_reading)
SELECT 
  v.id,
  (SELECT id FROM public.drivers LIMIT 1),
  50,
  185,
  'Shell Mombasa Road',
  'Nairobi-Mombasa',
  125000
FROM public.vehicles v WHERE v.license_plate = 'KBC 234Y'
ON CONFLICT DO NOTHING;

INSERT INTO public.fuel_logs (vehicle_id, driver_id, liters, price_per_liter_kes, station_location, route, odometer_reading)
SELECT 
  v.id,
  (SELECT id FROM public.drivers LIMIT 1 OFFSET 1),
  80,
  185,
  'Total Nakuru',
  'Nairobi-Nakuru',
  98000
FROM public.vehicles v WHERE v.license_plate = 'KDA 567B'
ON CONFLICT DO NOTHING;

INSERT INTO public.fuel_logs (vehicle_id, driver_id, liters, price_per_liter_kes, station_location, route, odometer_reading)
SELECT 
  v.id,
  (SELECT id FROM public.drivers LIMIT 1),
  40,
  185,
  'Kobil Thika',
  'Thika Highway',
  75000
FROM public.vehicles v WHERE v.license_plate = 'KBM 890C'
ON CONFLICT DO NOTHING;

INSERT INTO public.fuel_logs (vehicle_id, driver_id, liters, price_per_liter_kes, station_location, route, odometer_reading)
SELECT 
  v.id,
  (SELECT id FROM public.drivers LIMIT 1),
  100,
  185,
  'Total Kisumu',
  'Nairobi-Kisumu',
  150000
FROM public.vehicles v WHERE v.license_plate = 'KCA 123D'
ON CONFLICT DO NOTHING;

-- ============================================
-- 4. INSERT SAMPLE TRIPS
-- ============================================
INSERT INTO public.trips (vehicle_id, driver_id, route, start_location, end_location, start_time, estimated_duration_hours, distance_km, status, progress_percent, fuel_used)
SELECT 
  v.id,
  (SELECT id FROM public.drivers LIMIT 1),
  'Nairobi-Mombasa',
  'Nairobi',
  'Mombasa',
  NOW(),
  6.5,
  483.5,
  'in_progress',
  45,
  75
FROM public.vehicles v WHERE v.license_plate = 'KBC 234Y'
ON CONFLICT DO NOTHING;

INSERT INTO public.trips (vehicle_id, driver_id, route, start_location, end_location, start_time, end_time, estimated_duration_hours, distance_km, status, progress_percent, fuel_used)
SELECT 
  v.id,
  (SELECT id FROM public.drivers LIMIT 1),
  'Thika Highway',
  'Nairobi',
  'Thika',
  NOW() - INTERVAL '1 hour',
  NOW(),
  0.75,
  50.4,
  'completed',
  100,
  7
FROM public.vehicles v WHERE v.license_plate = 'KBM 890C'
ON CONFLICT DO NOTHING;

-- ============================================
-- 5. INSERT SAMPLE DRIVER BEHAVIOR EVENTS
-- ============================================
-- Note: This will only work if drivers exist
INSERT INTO public.driver_behavior_events (driver_id, vehicle_id, event_type, severity, description, location_latitude, location_longitude, speed_kmh, timestamp)
SELECT 
  d.id,
  v.id,
  'speeding',
  'medium',
  'Exceeded speed limit by 15 km/h',
  -1.5167,
  37.2667,
  115,
  NOW() - INTERVAL '2 hours'
FROM public.drivers d
LEFT JOIN public.vehicles v ON v.id = d.vehicle_id
WHERE d.id IS NOT NULL
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.driver_behavior_events (driver_id, vehicle_id, event_type, severity, description, location_latitude, location_longitude, speed_kmh, timestamp)
SELECT 
  d.id,
  v.id,
  'harsh_braking',
  'high',
  'Sudden brake application',
  -2.0833,
  37.6500,
  80,
  NOW() - INTERVAL '1 hour'
FROM public.drivers d
LEFT JOIN public.vehicles v ON v.id = d.vehicle_id
WHERE d.id IS NOT NULL
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.driver_behavior_events (driver_id, vehicle_id, event_type, severity, description, location_latitude, location_longitude, speed_kmh, timestamp)
SELECT 
  d.id,
  v.id,
  'excessive_idling',
  'low',
  'Vehicle idling for 15 minutes',
  -0.3031,
  36.0800,
  0,
  NOW() - INTERVAL '30 minutes'
FROM public.drivers d
LEFT JOIN public.vehicles v ON v.id = d.vehicle_id
WHERE d.id IS NOT NULL
LIMIT 1 OFFSET 1
ON CONFLICT DO NOTHING;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these to verify data was inserted:

-- SELECT COUNT(*) as vehicle_count FROM vehicles;
-- SELECT COUNT(*) as maintenance_count FROM maintenance_logs;
-- SELECT COUNT(*) as fuel_count FROM fuel_logs;
-- SELECT COUNT(*) as trip_count FROM trips;
-- SELECT COUNT(*) as behavior_count FROM driver_behavior_events;

