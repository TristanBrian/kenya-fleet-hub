# 🔐 Safiri Smart Fleet - Test Credentials

## Quick Setup Instructions

### Option 1: Automatic Seeding (Recommended)
Call the seed edge function once to automatically create all test accounts:

```bash
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/seed-test-accounts
```

This will create all 4 test accounts with their proper roles automatically.

### Option 2: Manual Account Creation
If you prefer to create accounts manually through the signup flow, use these credentials:

## 🏢 Test Account Credentials

### 1. FLEET MANAGER (Full Access)
**Email:** `manager@safirismart.co.ke`  
**Password:** `Manager2024!`  
**Role:** Fleet Manager  
**Access:** All dashboards, full administrative capabilities

**Capabilities:**
- View all vehicles and drivers
- Access analytics and reports
- Manage maintenance schedules
- Live tracking monitoring
- Financial oversight

---

### 2. OPERATIONS TEAM
**Email:** `operations@safirismart.co.ke`  
**Password:** `Ops2024!`  
**Role:** Operations  
**Access:** Vehicle and driver management, tracking

**Capabilities:**
- Manage vehicles and drivers
- Live tracking access
- Maintenance scheduling
- Limited analytics

---

### 3. DRIVER ACCOUNT
**Email:** `john.kamau@safirismart.co.ke`  
**Password:** `Driver2024!`  
**Role:** Driver  
**Access:** Personal dashboard and assigned vehicle only

**Capabilities:**
- View assigned vehicle
- Personal performance metrics
- Trip history
- Limited dashboard access

---

### 4. FINANCE TEAM
**Email:** `finance@safirismart.co.ke`  
**Password:** `Finance2024!`  
**Role:** Finance  
**Access:** Analytics and cost reports

**Capabilities:**
- View analytics dashboard
- Access fuel and maintenance costs
- Financial reports
- Read-only access to vehicle data

---

## 🚀 System Features Available After Login

### ✅ Executive Dashboard
- 18 active vehicles across Kenya
- KES 2.45M monthly fuel costs
- Real-time route status
- Performance metrics

### ✅ Live Tracking Dashboard
- GPS-enabled vehicle monitoring
- Real-time position updates
- Kenyan route visualization
- Traffic and checkpoint alerts

### ✅ Vehicle Management
- 18 vehicles with Kenyan license plates
- Service history and maintenance schedules
- Fuel efficiency tracking
- Status monitoring

### ✅ Driver Management
- 6 driver profiles with performance scores
- Behavior monitoring (speeding, braking, idling)
- Swahili performance badges
- Trip history

### ✅ Maintenance Dashboard
- Service records with KES pricing
- Overdue maintenance alerts
- Upcoming service schedules
- Cost tracking

### ✅ Analytics & Reports
- Financial breakdowns
- Route efficiency metrics
- Cost optimization insights
- Performance trends

---

## 🇰🇪 Kenyan Context Features

✅ **Swahili Integration**
- "Karibu" welcome messages
- Performance badges: "Mambo Poa", "Bora Kabisa", "Sawa Sawa"
- Kenyan cultural elements throughout

✅ **Local Business Features**
- KES currency formatting
- M-Pesa payment tracking
- Checkpoint delay monitoring
- Major Kenyan routes (Nairobi-Mombasa, Thika Highway, etc.)

✅ **Route Database**
- Nairobi-Mombasa: 480km
- Nairobi-Kisumu: 350km
- Thika Super Highway: 50km
- Western Circuit routes

---

## 📊 Sample Data Included

✅ **18 Vehicles**
- License plates: KBC 234Y, KDA 567B, KBM 890C, etc.
- Mix of matatus, trucks, and buses
- Active GPS coordinates
- Service histories

✅ **6 Drivers**
- Performance scores ranging 45-94%
- Kenyan names (John Kamau, Sarah Wanjiku, etc.)
- Behavior metrics
- Trip records

✅ **Financial Data**
- Maintenance logs with costs
- Fuel consumption records
- 30 days of historical data

---

## 🔄 Testing Workflow

1. **Login** with any test account
2. **Explore Dashboard** - See fleet overview
3. **Check Live Tracking** - View active vehicles
4. **Review Analytics** - Financial insights
5. **Manage Resources** - Vehicles and drivers
6. **Test Role Permissions** - Switch between accounts

---

## 🛠️ Technical Notes

- **Database:** Lovable Cloud (Supabase)
- **Auth:** Role-based access control (RLS policies)
- **Real-time:** Live location updates
- **Security:** Separate user_roles table
- **Currency:** All amounts in Kenyan Shillings (KES)

---

## 📱 Mobile Responsive

All dashboards are fully responsive and work on:
- Desktop browsers
- Tablets
- Mobile devices
- Driver mobile access optimized

---

## 🆘 Need Help?

If test accounts aren't working:
1. Ensure you've run the seed function
2. Check that auto-confirm email is enabled in Cloud settings
3. Verify user_roles table has proper entries
4. Try manual signup if automatic seeding fails

---

**Built with Lovable Cloud** 🚀  
*Usafiri Bora, Maisha Bora* - Better Transport, Better Life
