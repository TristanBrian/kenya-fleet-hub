# 🚀 Setup Guide Without CLI - Kenya Fleet Hub FMCS

This guide shows you how to set up the project using only the Supabase Dashboard (no CLI required).

---

## 📋 Prerequisites

- Supabase account (free tier works)
- Node.js installed
- Your Supabase project URL and keys

---

## 🔧 Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project (or create a new one)
3. Go to **Settings** → **API**
4. Copy these values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

---

## 🗄️ Step 2: Run Database Migrations

### Using Supabase Dashboard SQL Editor

1. In Supabase Dashboard, go to **SQL Editor**
2. Click **New Query**
3. Run each migration file **in order**:

#### Migration 1: Initial Schema
Copy and paste the contents of:
`supabase/migrations/20251109071828_0530c837-bff5-4dfb-8283-15b8603f666a.sql`

Click **Run** (or press Ctrl+Enter)

#### Migration 2: RLS and Roles
Copy and paste the contents of:
`supabase/migrations/20251110054822_aaf75ae1-5724-4261-9d9f-f9825addbd16.sql`

Click **Run**

#### Migration 3: Profile Updates
Copy and paste the contents of:
`supabase/migrations/20251122065508_ce368aa0-2e18-42c4-8ca3-246c6fdb4c49.sql`

Click **Run**

#### Migration 4: Vehicle Management
Copy and paste the contents of:
`supabase/migrations/20251122070414_ba002263-4c4a-466b-850c-784cd793965e.sql`

Click **Run**

#### Migration 5: Function Fixes
Copy and paste the contents of:
`supabase/migrations/20251122070431_fdf4cbfa-1964-4dce-bb16-08414a38b070.sql`

Click **Run**

#### Migration 6: Driver Policies
Copy and paste the contents of:
`supabase/migrations/20251220072502_17647326-b7af-4040-ab37-4f53b38a933c.sql`

Click **Run**

#### Migration 7: Profile Policies
Copy and paste the contents of:
`supabase/migrations/20251220072511_eddfebe9-7942-45f1-87c9-0fd9cb37aff3.sql`

Click **Run**

#### Migration 8: Missing Fields & Behavior Events
Copy and paste the contents of:
`supabase/migrations/20251221000000_add_missing_fields_and_behavior_events.sql`

Click **Run**

---

## 👥 Step 3: Create Test Accounts

### Option A: Using Edge Function (If Deployed)

1. Go to **Edge Functions** in Supabase Dashboard
2. If `seed-test-accounts` function exists, click on it
3. Click **Invoke** button
4. Or use curl with your actual project URL:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/seed-test-accounts \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

Replace:
- `YOUR_PROJECT_REF` with your actual project reference (from Settings → API)
- `YOUR_ANON_KEY` with your anon key

### Option B: Manual Account Creation

1. Go to **Authentication** → **Users** in Supabase Dashboard
2. Click **Add User** → **Create New User**
3. Create these 4 accounts:

**Fleet Manager:**
- Email: `manager@safirismart.co.ke`
- Password: `Manager2024!`
- Auto Confirm: ✅ Yes

**Operations:**
- Email: `operations@safirismart.co.ke`
- Password: `Ops2024!`
- Auto Confirm: ✅ Yes

**Driver:**
- Email: `john.kamau@safirismart.co.ke`
- Password: `Driver2024!`
- Auto Confirm: ✅ Yes

**Finance:**
- Email: `finance@safirismart.co.ke`
- Password: `Finance2024!`
- Auto Confirm: ✅ Yes

### Step 3b: Assign Roles

After creating users, assign roles in SQL Editor:

```sql
-- Get user IDs first (replace emails with actual user emails)
SELECT id, email FROM auth.users WHERE email IN (
  'manager@safirismart.co.ke',
  'operations@safirismart.co.ke',
  'john.kamau@safirismart.co.ke',
  'finance@safirismart.co.ke'
);

-- Then assign roles (replace USER_ID with actual IDs from above)
INSERT INTO public.user_roles (user_id, role) VALUES
  ('USER_ID_1', 'fleet_manager'),
  ('USER_ID_2', 'operations'),
  ('USER_ID_3', 'driver'),
  ('USER_ID_4', 'finance')
ON CONFLICT (user_id, role) DO NOTHING;
```

---

## 📊 Step 4: Seed Sample Data

### Option A: Using SQL File (Easiest - Recommended)

1. Open the file `supabase/seed_data.sql` in your project
2. Copy the entire contents
3. Paste into Supabase Dashboard → SQL Editor
4. Click **Run**

This will insert:
- ✅ 5 sample vehicles
- ✅ 5 maintenance logs
- ✅ 4 fuel logs
- ✅ 2 trips
- ✅ 3 driver behavior events

### Option B: Manual SQL (Alternative)

Run this SQL script in SQL Editor to seed sample data:

```sql
-- Insert Sample Vehicles
INSERT INTO public.vehicles (license_plate, vehicle_type, model, route_assigned, status, current_latitude, current_longitude, last_service_date, next_service_due, insurance_expiry, fuel_efficiency_kml, monthly_fuel_consumption_liters, maintenance_status)
VALUES
  ('KBC 234Y', 'matatu', 'Toyota Hiace', 'Nairobi-Mombasa', 'active', -1.2921, 36.8219, '2024-11-15', '2025-02-15', '2025-06-30', 6.5, 1200, 'good'),
  ('KDA 567B', 'truck', 'Isuzu NPR', 'Nairobi-Nakuru', 'maintenance', -0.3031, 36.0800, '2024-10-20', '2025-01-20', '2025-05-15', 5.8, 1800, 'due_soon'),
  ('KBM 890C', 'matatu', 'Nissan Urvan', 'Thika Highway', 'active', -1.0333, 37.0833, '2024-12-01', '2025-03-01', '2025-07-20', 7.2, 950, 'good'),
  ('KCA 123D', 'bus', 'Scania K270', 'Nairobi-Kisumu', 'active', -0.0917, 34.7680, '2024-11-10', '2025-02-10', '2025-08-10', 4.5, 2500, 'good'),
  ('KAB 456E', 'truck', 'Mercedes-Benz Actros', 'Nairobi-Mombasa', 'active', -2.7833, 38.2333, '2024-10-05', '2025-01-05', '2025-04-30', 6.0, 2000, 'good')
ON CONFLICT (license_plate) DO NOTHING;

-- Insert Sample Maintenance Logs
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

-- Insert Sample Fuel Logs
INSERT INTO public.fuel_logs (vehicle_id, driver_id, liters, price_per_liter_kes, station_location, route, odometer_reading)
SELECT 
  v.id,
  d.id,
  50,
  185,
  'Shell Mombasa Road',
  'Nairobi-Mombasa',
  125000
FROM public.vehicles v
LEFT JOIN public.drivers d ON d.vehicle_id = v.id
WHERE v.license_plate = 'KBC 234Y'
LIMIT 1
ON CONFLICT DO NOTHING;

INSERT INTO public.fuel_logs (vehicle_id, driver_id, liters, price_per_liter_kes, station_location, route, odometer_reading)
SELECT 
  v.id,
  d.id,
  80,
  185,
  'Total Nakuru',
  'Nairobi-Nakuru',
  98000
FROM public.vehicles v
LEFT JOIN public.drivers d ON d.vehicle_id = v.id
WHERE v.license_plate = 'KDA 567B'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert Sample Trips
INSERT INTO public.trips (vehicle_id, driver_id, route, start_location, end_location, start_time, estimated_duration_hours, distance_km, status, progress_percent, fuel_used)
SELECT 
  v.id,
  d.id,
  'Nairobi-Mombasa',
  'Nairobi',
  'Mombasa',
  NOW(),
  6.5,
  483.5,
  'in_progress',
  45,
  75
FROM public.vehicles v
LEFT JOIN public.drivers d ON d.vehicle_id = v.id
WHERE v.license_plate = 'KBC 234Y'
LIMIT 1
ON CONFLICT DO NOTHING;

-- Insert Sample Driver Behavior Events (if drivers exist)
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
```

### Option B: Using Edge Function (If You Deploy It)

1. Go to **Edge Functions** in Supabase Dashboard
2. Click **Create a new function**
3. Name it `seed-sample-data`
4. Copy the code from `supabase/functions/seed-sample-data/index.ts`
5. Paste it into the function editor
6. Click **Deploy**
7. Click **Invoke** to run it

Or use curl with your actual project details:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/seed-sample-data \
  -H "Authorization: Bearer YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

---

## ⚙️ Step 5: Configure Environment Variables

1. Create `.env` file in project root:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_REF.supabase.co
VITE_SUPABASE_ANON_KEY=YOUR_ANON_KEY_HERE
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token_optional
```

2. Replace placeholders with your actual values

---

## 🚀 Step 6: Install Dependencies & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173` and login with:
- Email: `manager@safirismart.co.ke`
- Password: `Manager2024!`

---

## ✅ Verification

### Check Tables Exist

Run in SQL Editor:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Should show: drivers, driver_behavior_events, fuel_logs, kenyan_routes, live_locations, maintenance_logs, profiles, routes_master, trips, user_roles, vehicle_types, vehicles

### Check Data Exists

```sql
SELECT 
  'vehicles' as table_name, COUNT(*) as count FROM vehicles
UNION ALL
SELECT 'drivers', COUNT(*) FROM drivers
UNION ALL
SELECT 'trips', COUNT(*) FROM trips
UNION ALL
SELECT 'maintenance_logs', COUNT(*) FROM maintenance_logs
UNION ALL
SELECT 'fuel_logs', COUNT(*) FROM fuel_logs;
```

---

## 🆘 Troubleshooting

### Issue: Migrations fail

- Run migrations one at a time
- Check for error messages
- Some migrations may have "IF NOT EXISTS" checks - that's OK

### Issue: Can't find project reference

- Go to Settings → API
- Project URL format: `https://xxxxx.supabase.co`
- The `xxxxx` part is your project reference

### Issue: Users created but can't login

- Check **Authentication** → **Settings** → **Email Auth** is enabled
- Ensure **Auto Confirm** was checked when creating users
- Or manually confirm users in Authentication → Users

---

## 📚 Next Steps

- See [SETUP_GUIDE.md](SETUP_GUIDE.md) for detailed feature walkthrough
- See [DATA_SETUP_GUIDE.md](DATA_SETUP_GUIDE.md) for more data seeding options
- See [QUICK_START.md](QUICK_START.md) for quick reference

---

**You're all set!** 🎉

