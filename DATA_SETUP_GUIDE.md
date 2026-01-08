# 📊 Data Setup Guide - Kenya Fleet Hub FMCS

This guide explains the database structure and how to seed sample data for the Fleet Management Control System.

---

## 🗄️ Database Schema Overview

### Core Tables

#### 1. **vehicles**
Tracks all fleet vehicles with GPS coordinates and maintenance information.

**Fields:**
- `id` (UUID) - Primary key
- `license_plate` (TEXT) - Unique Kenyan license plate
- `vehicle_type` (TEXT) - 'matatu', 'truck', or 'bus'
- `model` (TEXT) - Vehicle model/make
- `route_assigned` (TEXT) - Current route assignment
- `status` (TEXT) - 'active', 'maintenance', or 'inactive'
- `current_latitude` (DECIMAL) - GPS latitude
- `current_longitude` (DECIMAL) - GPS longitude
- `last_service_date` (DATE) - Last maintenance date
- `next_service_due` (DATE) - Next scheduled service
- `insurance_expiry` (DATE) - Insurance expiration
- `fuel_efficiency_kml` (NUMERIC) - Fuel efficiency
- `monthly_fuel_consumption_liters` (NUMERIC) - Monthly fuel usage
- `maintenance_status` (TEXT) - Current maintenance status

#### 2. **drivers**
Manages driver information and performance metrics.

**Fields:**
- `id` (UUID) - Primary key
- `user_id` (UUID) - Links to auth.users
- `license_number` (TEXT) - Driver license number
- `vehicle_id` (UUID) - Assigned vehicle
- `performance_score` (INTEGER) - 0-100 performance score
- `total_trips` (INTEGER) - Total trips completed
- `speeding_incidents` (INTEGER) - Count of speeding events
- `harsh_braking_events` (INTEGER) - Count of harsh braking
- `idle_time_hours` (NUMERIC) - Total idle time

#### 3. **trips**
Records vehicle trips and route assignments.

**Fields:**
- `id` (UUID) - Primary key
- `vehicle_id` (UUID) - Vehicle on trip
- `driver_id` (UUID) - Driver assigned
- `route` (TEXT) - Route name
- `start_location` (TEXT) - Starting point
- `end_location` (TEXT) - Destination
- `start_time` (TIMESTAMP) - Trip start
- `end_time` (TIMESTAMP) - Trip end
- `estimated_duration_hours` (NUMERIC) - Expected duration
- `distance_km` (NUMERIC) - Trip distance
- `status` (TEXT) - 'in_progress', 'completed', 'cancelled'
- `progress_percent` (INTEGER) - Trip completion percentage
- `fuel_used` (NUMERIC) - Fuel consumed

#### 4. **maintenance_logs**
Tracks vehicle maintenance history.

**Fields:**
- `id` (UUID) - Primary key
- `vehicle_id` (UUID) - Vehicle serviced
- `service_type` (TEXT) - Type of service
- `description` (TEXT) - Service details
- `date_performed` (DATE) - Service date
- `cost_kes` (DECIMAL) - Cost in Kenyan Shillings
- `next_due_date` (DATE) - Next service due
- `performed_by` (TEXT) - Service provider

#### 5. **driver_behavior_events**
Tracks individual driver behavior incidents.

**Fields:**
- `id` (UUID) - Primary key
- `driver_id` (UUID) - Driver involved
- `vehicle_id` (UUID) - Vehicle at time of event
- `event_type` (TEXT) - 'speeding', 'harsh_braking', 'harsh_acceleration', 'excessive_idling', etc.
- `severity` (TEXT) - 'low', 'medium', 'high', 'critical'
- `description` (TEXT) - Event description
- `location_latitude` (NUMERIC) - GPS latitude
- `location_longitude` (NUMERIC) - GPS longitude
- `speed_kmh` (NUMERIC) - Speed at time of event
- `timestamp` (TIMESTAMP) - When event occurred

#### 6. **fuel_logs**
Records fuel consumption and costs.

**Fields:**
- `id` (UUID) - Primary key
- `vehicle_id` (UUID) - Vehicle refueled
- `driver_id` (UUID) - Driver who refueled
- `liters` (DECIMAL) - Fuel amount
- `price_per_liter_kes` (DECIMAL) - Price per liter
- `total_cost_kes` (DECIMAL) - Calculated total cost
- `station_location` (TEXT) - Fuel station location
- `route` (TEXT) - Route at time of refuel
- `odometer_reading` (INTEGER) - Odometer reading

#### 7. **live_locations**
Real-time GPS tracking data.

**Fields:**
- `id` (UUID) - Primary key
- `vehicle_id` (UUID) - Vehicle being tracked
- `trip_id` (UUID) - Associated trip
- `latitude` (NUMERIC) - GPS latitude
- `longitude` (NUMERIC) - GPS longitude
- `speed_kmh` (NUMERIC) - Current speed
- `heading` (NUMERIC) - Direction of travel
- `timestamp` (TIMESTAMP) - Location timestamp

---

## 🌱 Seeding Sample Data

### Method 1: Using Edge Function (Recommended)

Deploy and call the seed function:

```bash
# Deploy the function
supabase functions deploy seed-sample-data

# Call the function
curl -X POST https://your-project.supabase.co/functions/v1/seed-sample-data \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### Method 2: Manual SQL Insertion

Run SQL commands in Supabase SQL Editor:

```sql
-- Insert sample vehicles
INSERT INTO public.vehicles (license_plate, vehicle_type, model, route_assigned, status, current_latitude, current_longitude, last_service_date, next_service_due)
VALUES
  ('KBC 234Y', 'matatu', 'Toyota Hiace', 'Nairobi-Mombasa', 'active', -1.2921, 36.8219, '2024-11-15', '2025-02-15'),
  ('KDA 567B', 'truck', 'Isuzu NPR', 'Nairobi-Nakuru', 'maintenance', -0.3031, 36.0800, '2024-10-20', '2025-01-20'),
  ('KBM 890C', 'matatu', 'Nissan Urvan', 'Thika Highway', 'active', -1.0333, 37.0833, '2024-12-01', '2025-03-01');

-- Insert sample maintenance logs
INSERT INTO public.maintenance_logs (vehicle_id, service_type, description, date_performed, cost_kes, next_due_date)
SELECT 
  v.id,
  'Oil Change',
  'Regular oil change and filter replacement',
  '2024-11-15',
  8500,
  '2025-02-15'
FROM public.vehicles v
WHERE v.license_plate = 'KBC 234Y'
LIMIT 1;
```

### Method 3: Using Supabase Dashboard

1. Go to **Table Editor** in Supabase Dashboard
2. Select each table
3. Click **Insert** → **Insert row**
4. Fill in the data manually

---

## 📋 Sample Data Checklist

### Required Data for Full Functionality

- [ ] **Vehicles** (Minimum 5 vehicles)
  - [ ] Mix of matatus, trucks, and buses
  - [ ] Kenyan license plates (KBC, KDA, KBM series)
  - [ ] GPS coordinates on major routes
  - [ ] Various statuses (active, maintenance)

- [ ] **Drivers** (Minimum 3 drivers)
  - [ ] Linked to user accounts
  - [ ] Assigned to vehicles
  - [ ] Performance scores set
  - [ ] Behavior metrics initialized

- [ ] **Trips** (Minimum 3 active trips)
  - [ ] Various routes
  - [ ] Different statuses
  - [ ] Progress tracking

- [ ] **Maintenance Logs** (Minimum 5 logs)
  - [ ] Various service types
  - [ ] Recent and upcoming dates
  - [ ] KES costs

- [ ] **Fuel Logs** (Minimum 5 logs)
  - [ ] Different vehicles
  - [ ] Various routes
  - [ ] Realistic fuel prices (KES 185/L)

- [ ] **Driver Behavior Events** (Minimum 5 events)
  - [ ] Various event types
  - [ ] Different severities
  - [ ] Recent timestamps

---

## 🔄 Data Relationships

```
users (auth.users)
  └── profiles
       └── drivers
            ├── vehicles (assigned)
            ├── trips
            ├── driver_behavior_events
            └── fuel_logs

vehicles
  ├── trips
  ├── maintenance_logs
  ├── fuel_logs
  └── live_locations
```

---

## ✅ Verification

### Check Data Exists

```sql
-- Count records in each table
SELECT 
  'vehicles' as table_name, COUNT(*) as count FROM vehicles
UNION ALL
SELECT 'drivers', COUNT(*) FROM drivers
UNION ALL
SELECT 'trips', COUNT(*) FROM trips
UNION ALL
SELECT 'maintenance_logs', COUNT(*) FROM maintenance_logs
UNION ALL
SELECT 'fuel_logs', COUNT(*) FROM fuel_logs
UNION ALL
SELECT 'driver_behavior_events', COUNT(*) FROM driver_behavior_events;
```

### Verify Relationships

```sql
-- Check vehicles with assigned drivers
SELECT v.license_plate, d.license_number, p.full_name
FROM vehicles v
LEFT JOIN drivers d ON v.id = d.vehicle_id
LEFT JOIN profiles p ON d.user_id = p.id;
```

---

## 🎯 Sample Data for Testing

### Kenyan License Plates
- KBC 234Y (Matatu - Nairobi-Mombasa)
- KDA 567B (Truck - Nairobi-Nakuru)
- KBM 890C (Matatu - Thika Highway)
- KCA 123D (Bus - Nairobi-Kisumu)
- KAB 456E (Truck - Nairobi-Mombasa)

### Routes
- Nairobi-Mombasa (483.5 km)
- Nairobi-Nakuru (157.3 km)
- Thika Highway (50.4 km)
- Nairobi-Kisumu (349.8 km)

### Service Types
- Oil Change
- Major Service
- Tire Replacement
- Brake Service
- Engine Repair

---

## 🔧 Troubleshooting

### Issue: No data showing in dashboard

**Solution:**
1. Verify RLS policies allow access
2. Check user has correct role
3. Ensure data exists in tables
4. Run seed function again

### Issue: Relationships not working

**Solution:**
1. Verify foreign keys are set correctly
2. Check UUIDs match between tables
3. Ensure referenced records exist

### Issue: Behavior events not updating driver metrics

**Solution:**
1. Check trigger function exists
2. Verify trigger is created
3. Test trigger manually

---

## 📚 Related Documentation

- [README.md](README.md) - Project overview
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Setup instructions
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [ROLE_BASED_ACCESS.md](ROLE_BASED_ACCESS.md) - Access control

---

**Last Updated**: 2024

*Proper data setup ensures all features work correctly and the dashboard displays meaningful information.*

