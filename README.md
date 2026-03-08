# Safiri Smart Fleet — Fleet Management Control System (FMCS)

> **"Usafiri Bora, Maisha Bora"** — Better Transport, Better Life

A comprehensive, cloud-based Fleet Management Control System designed for transit services in developing countries, with deployment and validation in Kenya. The system monitors vehicles in real-time, assesses schedule compliance, and helps transit operators improve route efficiency, driver safety, and regulatory compliance.

🌐 **Live App**: [kenya-fleet-hub.lovable.app](https://kenya-fleet-hub.lovable.app)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [System Architecture](#system-architecture)
- [Getting Started](#getting-started)
- [Test Accounts](#test-accounts)
- [Role-Based Access](#role-based-access)
- [Project Structure](#project-structure)
- [Market Context](#market-context)
- [Roadmap](#roadmap)
- [References](#references)

---

## 🎯 Overview

Fleet Management Control Systems (FMCS) monitor vehicles in real-time and assess schedule compliance. Transit services in developing countries such as Kenya face challenges with route adherence, schedule compliance, and driver behaviour — often driven by traffic congestion and passenger-count-based pay models.

This prototype addresses those challenges through:

1. **Intelligent Transportation System (ITS) Architecture** designed for developing-country contexts
2. **Real-Time Monitoring** with GPS tracking and interactive maps
3. **Role-Based Dashboards** for fleet managers, operations, drivers, and finance teams
4. **Kenyan Localization** — KES currency, major routes (Nairobi–Mombasa, Thika Highway), checkpoint alerts, matatu classification

### Key Benefits

- ✅ **Operational Efficiency** — Real-time data and analytics for smoother fleet operations
- ✅ **Cost Reduction** — Minimizes vehicle downtime and optimizes routes
- ✅ **Safety Improvement** — Driver behaviour monitoring and compliance tracking
- ✅ **Market Opportunity** — Fleet management software market projected to reach **$116.56 billion by 2032** at **19.8% CAGR** (Fortune Business Insights)

---

## ✨ Key Features

### 1. Real-Time Vehicle Tracking
- 📍 Live GPS monitoring across Kenya with interactive Mapbox maps
- ⚡ Auto-refresh every 30 seconds with real-time database subscriptions
- 🚦 Traffic and police checkpoint alerts
- 📱 Fully mobile-responsive interface

### 2. Driver Management
- 👥 Create driver accounts with auto-generated login credentials
- 📈 Performance scoring with behaviour analytics (speeding, harsh braking, idle time)
- 🎯 Kenyan-themed performance badges ("Mambo Poa Driver", "Needs Improvement")
- 📋 Trip history and assignment tracking
- 🔑 Driver onboarding flow with mandatory password change

### 3. Vehicle Management
- 🚗 Complete fleet inventory with Kenyan license plate formats (KBC, KDA, KBM)
- 🔧 Maintenance scheduling with approval workflow (Finance submits → Fleet Manager approves)
- ⛽ Fuel consumption monitoring with KES pricing
- 📄 Insurance expiry tracking

### 4. Maintenance Workflow
- 💰 Cost tracking in KES with approval/rejection flow
- 📅 Next-due-date alerts and overdue notifications
- 🔄 Resubmission capability for declined requests

### 5. Analytics & Reporting
- 📊 Financial insights, route efficiency metrics, and performance trends
- 📈 PDF report generation
- 💵 Fuel cost analysis and savings reports

### 6. Role-Based Access Control
- 👨‍💼 **Fleet Manager** — Full system access, driver creation, approvals, settings
- 👷 **Operations** — Vehicle & driver management, trip scheduling
- 🚗 **Driver** — Personal dashboard, assigned vehicle & trip view
- 💰 **Finance** — Analytics, maintenance request submission & cost reports

---

## 🛠️ Technology Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Routing** | React Router v6 |
| **Maps** | Mapbox GL JS |
| **Charts** | Recharts |
| **Forms** | React Hook Form + Zod validation |
| **Backend** | Supabase (PostgreSQL, Auth, Edge Functions, RLS, Realtime) |
| **PDF** | jsPDF + jspdf-autotable |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    FMCS Architecture                     │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │
│  │   Vehicle    │  │   Driver     │  │  Operations  │  │
│  │   Tracking   │◄─┤  Management  │◄─┤  Dashboard   │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  │
│         │                 │                 │            │
│         └─────────────────┼─────────────────┘            │
│                           │                              │
│                  ┌────────▼────────┐                     │
│                  │  Data Analytics │                     │
│                  │   & Reporting   │                     │
│                  └─────────────────┘                     │
│                           │                              │
│           ┌───────────────┼───────────────┐              │
│           │               │               │              │
│    ┌──────▼──────┐ ┌──────▼──────┐ ┌──────▼──────┐      │
│    │  Supabase   │ │   Mapbox    │ │  Realtime   │      │
│    │  Database   │ │   Maps/GPS  │ │  Subscript. │      │
│    └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### Database Tables

| Table | Purpose |
|-------|---------|
| `vehicles` | Fleet inventory, GPS coordinates, status |
| `drivers` | License info, performance scores, vehicle assignments |
| `trips` | Route tracking, progress, estimated duration |
| `maintenance_logs` | Service records with approval workflow |
| `fuel_logs` | Consumption tracking with KES pricing |
| `live_locations` | Real-time GPS breadcrumb trail |
| `profiles` | User info (name, phone, base station) |
| `user_roles` | Role assignments (fleet_manager, operations, driver, finance) |
| `kenyan_routes` | Major route reference data |
| `routes_master` | Custom route definitions |
| `vehicle_types` | Vehicle classification reference |

All tables are protected with **Row-Level Security (RLS)** policies ensuring users only access data appropriate to their role.

---

## 🚀 Getting Started

### Option A: Use the Live App (Recommended)

Visit **[kenya-fleet-hub.lovable.app](https://kenya-fleet-hub.lovable.app)** and log in with any test account below.

On the login page, click **"Initialize Demo Accounts"** to set up the demo accounts, then use one-click login.

### Option B: Run Locally

#### Prerequisites
- Node.js v18+ and npm (or bun)

#### Steps

```bash
# 1. Clone the repository
git clone https://github.com/TristanBrian/kenya-fleet-hub
cd kenya-fleet-hub

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev
```

The app runs at `http://localhost:5173`. The backend (database, auth, edge functions) is cloud-hosted and requires no local setup.

#### Build for Production

```bash
npm run build
```

---

## 🎯 Test Accounts

| Role | Email | Password | Access |
|------|-------|----------|--------|
| Fleet Manager | manager@safirismart.co.ke | Manager2024! | Full access |
| Operations | operations@safirismart.co.ke | Ops2024! | Vehicles, drivers, trips |
| Driver | john.kamau@safirismart.co.ke | Driver2024! | Personal dashboard |
| Finance | finance@safirismart.co.ke | Finance2024! | Analytics & maintenance requests |

> **Tip**: On the login page, click the **Demo** tab for one-click login with any role.

---

## 🔐 Role-Based Access

| Feature | Fleet Manager | Operations | Driver | Finance |
|---------|:---:|:---:|:---:|:---:|
| Dashboard Overview | ✅ | ✅ | ✅ | ✅ |
| Live Tracking | ✅ | ✅ | ❌ | ❌ |
| Manage Vehicles | ✅ | ✅ | ❌ | ❌ |
| Manage Drivers | ✅ | ✅ | ❌ | ❌ |
| Create Driver Accounts | ✅ | ✅ | ❌ | ❌ |
| Assign Drivers to Vehicles | ✅ | ✅ | ❌ | ❌ |
| Manage Trips | ✅ | ✅ | ❌ | ❌ |
| View Own Trips | ✅ | ✅ | ✅ | ❌ |
| Submit Maintenance Requests | ❌ | ❌ | ❌ | ✅ |
| Approve/Decline Maintenance | ✅ | ✅ | ❌ | ❌ |
| Analytics & Reports | ✅ | ✅ | ❌ | ✅ |
| System Settings | ✅ | ❌ | ❌ | ❌ |

---

## 📁 Project Structure

```
kenya-fleet-hub/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── dashboard/        # Dashboard widgets & managers
│   │   ├── ui/               # shadcn/ui base components
│   │   ├── KenyaFleetMap.tsx  # Mapbox fleet map
│   │   ├── AppSidebar.tsx     # Navigation sidebar
│   │   └── Layout.tsx         # App shell layout
│   ├── pages/                # Route page components
│   │   ├── Auth.tsx           # Login / signup / demo
│   │   ├── Dashboard.tsx      # Main dashboard
│   │   ├── LiveTracking.tsx   # Real-time GPS view
│   │   ├── Vehicles.tsx       # Vehicle management
│   │   ├── Drivers.tsx        # Driver management
│   │   ├── Maintenance.tsx    # Maintenance workflow
│   │   ├── Analytics.tsx      # Reports & charts
│   │   └── Settings.tsx       # System configuration
│   ├── hooks/                # Custom React hooks
│   ├── integrations/         # Supabase client & types
│   ├── utils/                # Helpers (PDF generation)
│   └── main.tsx              # App entry point
├── supabase/
│   ├── migrations/           # Database schema migrations
│   └── functions/            # Edge functions
│       ├── create-driver/        # Driver account provisioning
│       ├── generate-live-locations/ # Simulated GPS data
│       ├── seed-test-accounts/   # Demo account setup
│       └── seed-sample-data/     # Sample fleet data
├── index.html
├── package.json
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 📊 Market Context

The fleet management software market is projected to reach **$116.56 billion by 2032** with a **19.8% CAGR** (Fortune Business Insights), driven by:

- Increasing reliance on transportation and logistics
- Growing demand for real-time tracking and analytics
- Regulatory compliance requirements
- Safety and operational efficiency needs

This system is positioned for the **developing-country segment**, where cost-effective solutions with local context (Kenyan routes, KES currency, matatu/Sacco support) create a competitive advantage.

---

## 🚀 Roadmap

### Implemented ✅
- Real-time vehicle tracking with Mapbox
- Driver account creation with credential generation
- Maintenance approval/rejection workflow with resubmission
- Role-based access control (4 roles)
- Analytics dashboards with PDF report export
- Kenyan localization (KES, routes, checkpoint alerts)
- Driver onboarding flow with mandatory password change
- Live fleet status grid with driver assignment

### Planned 🔮
- Mobile app for drivers (React Native)
- Advanced route optimization with AI
- Predictive maintenance scheduling
- M-Pesa payment integration
- Multi-language support (Swahili + English)
- Third-party API for fleet data
- Compliance reporting automation

---

## 📚 References

- Rojas, A. (2020). *Fleet Management Control Systems: A Comprehensive Approach*
- Ramirez-Guerrero, T., et al. (2022). *Transit Service Compliance in Medium-Sized Cities*
- Fortune Business Insights. *Fleet Management Software Market Report 2024–2032*

---

## 🙏 Acknowledgments

- Built with ❤️ for Kenyan transit services
- Designed to improve transportation in developing countries
- Special thanks to the transit operators and drivers who participated in validation testing

---

**Status**: 🚀 Active Development

*"Usafiri Bora, Maisha Bora" — Better Transport, Better Life*
