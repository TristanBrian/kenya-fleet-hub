# 🔐 Role-Based Access Control (RBAC) - Kenya Fleet Hub FMCS

This document outlines the role-based access control system implemented in the Fleet Management Control System.

---

## 👥 User Roles

The system supports four distinct roles:

1. **Fleet Manager** (`fleet_manager`) - Full administrative access
2. **Operations** (`operations`) - Day-to-day operations management
3. **Driver** (`driver`) - Personal dashboard and assigned vehicle
4. **Finance** (`finance`) - Financial reports and cost analysis

---

## 📊 Access Matrix

| Feature | Fleet Manager | Operations | Driver | Finance |
|---------|--------------|------------|--------|---------|
| **Dashboard** | ✅ Full | ✅ Full | ✅ Personal | ✅ Financial |
| **Vehicles** | ✅ All (CRUD) | ✅ All (CRUD) | ⚠️ Assigned Only | ✅ Read-only |
| **Drivers** | ✅ All (CRUD) | ✅ All (CRUD) | ⚠️ Self Only | ❌ No Access |
| **Live Tracking** | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| **Maintenance** | ✅ All (CRUD) | ✅ All (CRUD) | ❌ No | ✅ Read-only |
| **Analytics** | ✅ All Reports | ❌ No | ❌ No | ✅ All Reports |
| **Settings** | ✅ Full | ✅ Full | ✅ Personal | ✅ Personal |

---

## 🎯 Role-Specific Dashboards

### Fleet Manager Dashboard
- Complete fleet overview
- All vehicles and drivers
- Financial analytics
- Performance metrics
- Route compliance tracking
- Full administrative controls

### Operations Dashboard
- Vehicle and driver management
- Live tracking
- Maintenance scheduling
- Daily operations overview
- Route assignments

### Driver Dashboard
- Personal performance metrics
- Assigned vehicle information
- Trip history
- Performance score
- Personal settings

### Finance Dashboard
- Financial overview
- Cost breakdown (Fuel, Maintenance)
- Budget analysis
- Savings tracking
- Cost per vehicle metrics
- Read-only access to vehicles and maintenance

---

## 🛡️ Implementation Details

### 1. Role Hook (`useRole`)
Located at `src/hooks/useRole.ts`

Provides:
- Current user role
- Profile information
- Role checking functions (`hasRole`, `hasAnyRole`)
- Role-specific boolean flags (`isFleetManager`, `isDriver`, etc.)

### 2. Sidebar Navigation
Located at `src/components/AppSidebar.tsx`

- Dynamically filters menu items based on user role
- Only shows accessible features
- Role-specific navigation structure

### 3. Page-Level Access Control
All pages check user roles before rendering:
- **Dashboard** (`src/pages/Dashboard.tsx`) - Role-specific dashboard content
- **Live Tracking** (`src/pages/LiveTracking.tsx`) - Fleet Manager & Operations only
- **Vehicles** (`src/pages/Vehicles.tsx`) - All roles (with different permissions)
- **Drivers** (`src/pages/Drivers.tsx`) - Fleet Manager & Operations only
- **Maintenance** (`src/pages/Maintenance.tsx`) - Fleet Manager, Operations & Finance
- **Analytics** (`src/pages/Analytics.tsx`) - Fleet Manager & Finance only
- **Settings** (`src/pages/Settings.tsx`) - All roles

### 4. Database-Level Security (RLS)
Row-Level Security policies enforce access at the database level:
- Users can only see data they're authorized to view
- Role-based queries using `has_role()` and `has_any_role()` functions
- Separate `user_roles` table for secure role management

---

## 🔒 Access Denied Pages

When a user tries to access a feature they don't have permission for:
- Shows a clear "Access Denied" message
- Explains why access is restricted
- Provides a button to return to dashboard
- Prevents unauthorized data access

---

## 📝 Role Assignment

### During User Creation
Roles are assigned via the `user_roles` table:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('user-uuid', 'fleet_manager');
```

### Test Accounts
Test accounts are created with the `seed-test-accounts` edge function:
- `manager@safirismart.co.ke` → `fleet_manager`
- `operations@safirismart.co.ke` → `operations`
- `john.kamau@safirismart.co.ke` → `driver`
- `finance@safirismart.co.ke` → `finance`

---

## 🎨 UI Indicators

### Role Badge
- Displayed in the header
- Color-coded by role:
  - **Fleet Manager**: Primary color (blue)
  - **Operations**: Blue
  - **Driver**: Green
  - **Finance**: Purple

### Navigation
- Only accessible features shown in sidebar
- Hidden menu items for unauthorized roles
- Clear visual hierarchy

---

## ✅ Testing Role-Based Access

### Test Scenarios

1. **Fleet Manager**
   - ✅ Can access all features
   - ✅ Can create/edit vehicles and drivers
   - ✅ Can view all analytics
   - ✅ Can manage maintenance

2. **Operations**
   - ✅ Can manage vehicles and drivers
   - ✅ Can view live tracking
   - ✅ Can manage maintenance
   - ❌ Cannot view analytics
   - ❌ Cannot access financial reports

3. **Driver**
   - ✅ Can view personal dashboard
   - ✅ Can view assigned vehicle
   - ✅ Can view own driver record
   - ❌ Cannot view other drivers
   - ❌ Cannot access live tracking
   - ❌ Cannot view analytics

4. **Finance**
   - ✅ Can view financial dashboard
   - ✅ Can view analytics and reports
   - ✅ Can view vehicles (read-only)
   - ✅ Can view maintenance logs (read-only)
   - ❌ Cannot manage vehicles
   - ❌ Cannot view drivers
   - ❌ Cannot access live tracking

---

## 🔄 Role Updates

To change a user's role:

```sql
-- Update user role
UPDATE user_roles 
SET role = 'operations' 
WHERE user_id = 'user-uuid';
```

The UI will automatically reflect the new role after refresh.

---

## 🚨 Security Considerations

1. **Frontend Checks**: UI-level access control for better UX
2. **Backend Checks**: Database RLS policies enforce security
3. **Role Validation**: Roles verified on every request
4. **Session Management**: Roles checked on session refresh
5. **Error Handling**: Graceful handling of unauthorized access

---

## 📚 Related Documentation

- [README.md](README.md) - Project overview
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Setup instructions
- [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md) - Test account information
- [PROJECT_CHECKLIST.md](PROJECT_CHECKLIST.md) - Project readiness checklist

---

**Last Updated**: 2024

*Role-based access control ensures each user sees only what they need, improving security and user experience.*

