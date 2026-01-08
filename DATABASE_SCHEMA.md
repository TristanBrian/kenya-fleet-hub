# 🗄️ Database Schema Reference - Kenya Fleet Hub FMCS

Complete reference for all database tables, relationships, and data structures.

---

## 📊 Schema Overview

```
┌─────────────┐
│ auth.users  │
└──────┬──────┘
       │
       ▼
┌─────────────┐      ┌──────────────┐
│  profiles   │──────▶│  user_roles  │
└──────┬──────┘      └──────────────┘
       │
       ▼
┌─────────────┐      ┌──────────────┐
│   drivers   │──────▶│  vehicles   │
└──────┬──────┘      └──────┬───────┘
       │                    │
       │                    ▼
       │            ┌──────────────┐
       │            │    trips     │
       │            └──────┬───────┘
       │                    │
       │                    ▼
       │            ┌──────────────┐
       │            │live_locations│
       │            └──────────────┘
       │
       ▼
┌─────────────────────┐
│driver_behavior_events│
└─────────────────────┘

┌──────────────┐      ┌──────────────┐
│  vehicles    │──────▶│maintenance_ │
└──────────────┘      │    logs      │
                      └──────────────┘

┌──────────────┐      ┌──────────────┐
│  vehicles    │──────▶│  fuel_logs  │
└──────────────┘      └──────────────┘
```

---

## 📋 Table Definitions

### 1. **profiles**
User profile information linked to authentication.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK, FK → auth.users | User ID |
| full_name | TEXT | NOT NULL | User's full name |
| mobile_phone | TEXT | | Contact number |
| role | TEXT | DEFAULT 'driver' | Legacy role field |
| base_station | TEXT | | Base station location |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### 2. **user_roles**
Role-based access control (separate from profiles for security).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Role assignment ID |
| user_id | UUID | FK → auth.users | User ID |
| role | app_role | NOT NULL | Role enum value |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Roles:** `fleet_manager`, `operations`, `driver`, `finance`

### 3. **vehicles**
Fleet vehicle information with GPS tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Vehicle ID |
| license_plate | TEXT | UNIQUE, NOT NULL | Kenyan license plate |
| vehicle_type | TEXT | CHECK | 'matatu', 'truck', 'bus' |
| model | TEXT | | Vehicle model/make |
| route_assigned | TEXT | | Current route |
| status | TEXT | DEFAULT 'active' | 'active', 'maintenance', 'inactive' |
| current_latitude | DECIMAL(10,8) | | GPS latitude |
| current_longitude | DECIMAL(11,8) | | GPS longitude |
| last_location_update | TIMESTAMPTZ | | Last GPS update |
| last_service_date | DATE | | Last maintenance date |
| next_service_due | DATE | | Next scheduled service |
| insurance_expiry | DATE | | Insurance expiration |
| fuel_efficiency_kml | NUMERIC | DEFAULT 6.2 | Fuel efficiency |
| monthly_fuel_consumption_liters | NUMERIC | | Monthly fuel usage |
| maintenance_status | TEXT | DEFAULT 'good' | Maintenance status |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### 4. **drivers**
Driver information and performance metrics.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Driver ID |
| user_id | UUID | FK → profiles | Linked user account |
| license_number | TEXT | UNIQUE, NOT NULL | Driver license number |
| vehicle_id | UUID | FK → vehicles | Assigned vehicle |
| performance_score | INTEGER | DEFAULT 100, CHECK 0-100 | Performance score |
| total_trips | INTEGER | DEFAULT 0 | Total trips completed |
| speeding_incidents | INTEGER | DEFAULT 0 | Speeding event count |
| harsh_braking_events | INTEGER | DEFAULT 0 | Harsh braking count |
| idle_time_hours | NUMERIC | DEFAULT 0 | Total idle time |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### 5. **trips**
Vehicle trip and route assignment records.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Trip ID |
| vehicle_id | UUID | FK → vehicles, NOT NULL | Vehicle on trip |
| driver_id | UUID | FK → drivers | Assigned driver |
| route | TEXT | NOT NULL | Route name |
| start_location | TEXT | NOT NULL | Starting point |
| end_location | TEXT | NOT NULL | Destination |
| start_time | TIMESTAMPTZ | NOT NULL | Trip start time |
| end_time | TIMESTAMPTZ | | Trip end time |
| estimated_duration_hours | NUMERIC | | Expected duration |
| distance_km | NUMERIC | | Trip distance |
| status | TEXT | DEFAULT 'in_progress' | Trip status |
| progress_percent | INTEGER | DEFAULT 0 | Completion percentage |
| fuel_used | NUMERIC | DEFAULT 0 | Fuel consumed |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### 6. **maintenance_logs**
Vehicle maintenance history and scheduling.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Maintenance log ID |
| vehicle_id | UUID | FK → vehicles, NOT NULL | Vehicle serviced |
| service_type | TEXT | NOT NULL | Type of service |
| description | TEXT | | Service details |
| date_performed | DATE | DEFAULT CURRENT_DATE | Service date |
| cost_kes | DECIMAL(10,2) | NOT NULL | Cost in KES |
| next_due_date | DATE | | Next service due |
| performed_by | TEXT | | Service provider |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### 7. **fuel_logs**
Fuel consumption and cost tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Fuel log ID |
| vehicle_id | UUID | FK → vehicles, NOT NULL | Vehicle refueled |
| driver_id | UUID | FK → drivers | Driver who refueled |
| liters | DECIMAL(10,2) | NOT NULL | Fuel amount |
| price_per_liter_kes | DECIMAL(10,2) | NOT NULL | Price per liter |
| total_cost_kes | DECIMAL(10,2) | GENERATED | Calculated total |
| station_location | TEXT | | Fuel station |
| route | TEXT | | Route at refuel |
| odometer_reading | INTEGER | | Odometer reading |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### 8. **driver_behavior_events**
Individual driver behavior incident tracking.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Event ID |
| driver_id | UUID | FK → drivers, NOT NULL | Driver involved |
| vehicle_id | UUID | FK → vehicles | Vehicle at event |
| event_type | TEXT | NOT NULL, CHECK | Event type |
| severity | TEXT | DEFAULT 'medium', CHECK | Severity level |
| description | TEXT | | Event description |
| location_latitude | NUMERIC | | GPS latitude |
| location_longitude | NUMERIC | | GPS longitude |
| speed_kmh | NUMERIC | | Speed at event |
| timestamp | TIMESTAMPTZ | DEFAULT NOW() | Event timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

**Event Types:** `speeding`, `harsh_braking`, `harsh_acceleration`, `excessive_idling`, `rapid_lane_change`, `other`

**Severity Levels:** `low`, `medium`, `high`, `critical`

### 9. **live_locations**
Real-time GPS tracking data.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Location ID |
| vehicle_id | UUID | FK → vehicles, NOT NULL | Vehicle tracked |
| trip_id | UUID | FK → trips | Associated trip |
| latitude | NUMERIC | NOT NULL | GPS latitude |
| longitude | NUMERIC | NOT NULL | GPS longitude |
| speed_kmh | NUMERIC | | Current speed |
| heading | NUMERIC | | Direction of travel |
| timestamp | TIMESTAMPTZ | DEFAULT NOW() | Location timestamp |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### 10. **kenyan_routes**
Master data for Kenyan transit routes.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | UUID | PK | Route ID |
| route_name | TEXT | UNIQUE, NOT NULL | Route name |
| start_city | TEXT | NOT NULL | Starting city |
| end_city | TEXT | NOT NULL | Destination city |
| distance_km | DECIMAL(10,2) | NOT NULL | Route distance |
| typical_duration_hours | DECIMAL(5,2) | NOT NULL | Typical duration |
| common_challenges | TEXT[] | | Array of challenges |
| created_at | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

## 🔗 Relationships

### Foreign Keys

- `profiles.id` → `auth.users.id` (CASCADE DELETE)
- `user_roles.user_id` → `auth.users.id` (CASCADE DELETE)
- `drivers.user_id` → `profiles.id` (CASCADE DELETE)
- `drivers.vehicle_id` → `vehicles.id` (SET NULL)
- `trips.vehicle_id` → `vehicles.id` (CASCADE DELETE)
- `trips.driver_id` → `drivers.id` (SET NULL)
- `maintenance_logs.vehicle_id` → `vehicles.id` (CASCADE DELETE)
- `fuel_logs.vehicle_id` → `vehicles.id` (CASCADE DELETE)
- `fuel_logs.driver_id` → `drivers.id` (SET NULL)
- `driver_behavior_events.driver_id` → `drivers.id` (CASCADE DELETE)
- `driver_behavior_events.vehicle_id` → `vehicles.id` (SET NULL)
- `live_locations.vehicle_id` → `vehicles.id` (CASCADE DELETE)
- `live_locations.trip_id` → `trips.id` (CASCADE DELETE)

---

## 🔐 Row-Level Security (RLS)

All tables have RLS enabled with role-based policies:

- **Fleet Managers**: Full access to all data
- **Operations**: Access to vehicles, drivers, trips, maintenance
- **Drivers**: Access to own records and assigned vehicle
- **Finance**: Read-only access to vehicles, maintenance, analytics

---

## ⚙️ Functions & Triggers

### Functions

- `has_role(user_id, role)` - Check if user has specific role
- `has_any_role(user_id, roles[])` - Check if user has any of multiple roles
- `update_driver_metrics_from_event()` - Auto-update driver metrics from behavior events
- `update_updated_at_column()` - Auto-update timestamp columns

### Triggers

- `update_driver_metrics_on_behavior_event` - Updates driver metrics when behavior events are inserted
- `update_profiles_updated_at` - Auto-updates profiles.updated_at
- `update_vehicles_updated_at` - Auto-updates vehicles.updated_at
- `update_drivers_updated_at` - Auto-updates drivers.updated_at
- `update_trips_updated_at` - Auto-updates trips.updated_at
- `on_auth_user_created` - Auto-creates profile on user signup

---

## 📊 Indexes

Performance indexes created:

- `idx_driver_behavior_events_driver_id` - On driver_behavior_events(driver_id)
- `idx_driver_behavior_events_timestamp` - On driver_behavior_events(timestamp DESC)
- `idx_driver_behavior_events_event_type` - On driver_behavior_events(event_type)

---

## 🔄 Real-time Subscriptions

Enabled for:
- `live_locations` - Real-time GPS updates
- `trips` - Trip status changes
- `vehicles` - Vehicle status updates

---

**Last Updated**: 2024

*Complete database schema reference for Kenya Fleet Hub FMCS*

