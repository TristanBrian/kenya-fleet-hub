# Fleet Management Control System (FMCS) - Kenya Fleet Hub

> **"Usafiri Bora, Maisha Bora"** - Better Transport, Better Life

A comprehensive, cloud-based Fleet Management Control System (FMCS) designed specifically for transit services in developing countries, with initial deployment and validation in Kenya. This system monitors vehicles in real-time, assesses scheduled compliance, and helps transit services improve route information, schedules, user experience, and compliance with traffic regulations.

## 📋 Table of Contents

- [Overview](#overview)
- [Background](#background)
- [System Architecture](#system-architecture)
- [Key Features](#key-features)
- [Technology Stack](#technology-stack)
- [Installation & Setup](#installation--setup)
- [Usage](#usage)
- [System Components](#system-components)
- [Market Context](#market-context)
- [Project Structure](#project-structure)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Fleet Management Control Systems (FMCS) monitor vehicles in real-time and help in assessing scheduled compliance. Transit services in developing countries such as Kenya must improve in aspects such as information about routes, schedules and users; and compliance with traffic regulations, to achieve an increase in their demand.

Although a FMCS can deal with these issues, currently implemented systems have some limitations related to communications technology, associated costs, interoperability and standardization. This solution addresses these challenges by:

1. **Intelligent Transportation System (ITS) Architecture**: Designed specifically for FMCS in developing country contexts
2. **Long-Range Communication Technology**: Utilizing LoRa (Long-Range) communication and Intelligent Transportation Systems services
3. **Real-World Validation**: Testing and validation using transit vehicles in Kenya

### Key Benefits

- ✅ **Operational Efficiency**: Real-time data and analytics ensure smoother and more productive fleet operations
- ✅ **Cost Reduction**: Minimizes vehicle downtime and optimizes routes, ultimately boosting profitability
- ✅ **Safety Improvement**: Enhanced monitoring and compliance tracking
- ✅ **Service Cost Reduction**: Uses cutting-edge communications technology and promotes interoperability with other mobility services
- ✅ **Market Growth**: Positioned in a market projected to reach **$116.56 billion by 2032** with a **19.8% CAGR** (Fortune Business Insights)

---

## 📚 Background

### 1.1 Introduction

A Fleet Management System is a cloud-based system suitable for organizations from travel, logistics, and supply chains, ensuring the best possible control of commercial vehicles from a centralized dashboard. Custom fleet management software leverages data analytics & GPS to generate intelligent insights that enable managers to save time, resources, money, and manpower.

The vehicle management component helps monitor vehicles and assets in real time to optimize:
- Vehicle maintenance
- Driver safety
- Route planning
- Compliance
- Fuel consumption
- And more

### 1.2 Background of the Study

A Fleet Management Control System (FMCS) tracks vehicles continuously, assesses schedule compliance, and alerts or partially modifies routes when certain events occur (Rojas, 2020). Transit services in medium-sized cities have several aspects to improve related to route and schedule compliance, speeding and safety.

**Key Challenges in Transit Services:**

1. **Route Compliance Issues**: Occur mainly for two reasons:
   - Inadequate stops on the route
   - Nonobservance of the route (passage through all established points is not performed)

2. **Service Model Challenges**: Transit service in the context of interest is commonly performed with the type of service called "collective", which:
   - Does not have dedicated lanes on the roads
   - Has a business model that remunerates drivers depending on the number of passengers using the service
   - Both traffic congestion and the business model encourage non-compliance with the route (Ramirez-Guerrero et al., 2022)

### 1.3 Solution Approach

This FMCS prototype addresses these challenges by:

- **Real-Time Monitoring**: Continuous vehicle tracking with GPS technology
- **Schedule Compliance Assessment**: Automated evaluation of route adherence
- **Intelligent Alerts**: Notifications for route deviations, speeding, and safety incidents
- **Cost-Effective Communication**: Long-Range (LoRa) technology for reduced operational costs
- **Interoperability**: Standardized architecture for integration with other mobility services
- **Kenyan Context**: Specifically designed for major Kenyan cities and transit patterns

---

## 🏗️ System Architecture

### Intelligent Transportation System (ITS) Architecture

The system follows a modular ITS architecture designed for developing country contexts:

```
┌─────────────────────────────────────────────────────────────┐
│                    FMCS Architecture                         │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Vehicle    │    │  Driver      │    │  Operations  │ │
│  │   Tracking   │◄───┤  Management  │◄───┤  Dashboard   │ │
│  └──────────────┘    └──────────────┘    └──────────────┘ │
│         │                   │                   │          │
│         └───────────────────┼───────────────────┘          │
│                             │                              │
│                    ┌────────▼────────┐                     │
│                    │  Data Analytics │                     │
│                    │   & Reporting   │                     │
│                    └─────────────────┘                     │
│                             │                              │
│                    ┌────────▼────────┐                     │
│                    │  LoRa Network   │                     │
│                    │  Communication  │                     │
│                    └─────────────────┘                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### Communication Technology

- **Long-Range (LoRa) Communication**: Cost-effective, low-power wide-area network technology
- **GPS Integration**: Real-time location tracking
- **Cloud-Based Infrastructure**: Scalable and accessible from anywhere

---

## ✨ Key Features

### 1. Real-Time Vehicle Tracking
- 📍 Live GPS monitoring across Kenya
- 🗺️ Interactive map visualization (Mapbox integration)
- ⚡ Auto-refresh every 30 seconds
- 🚦 Traffic and checkpoint alerts
- 📱 Mobile-responsive interface

### 2. Schedule Compliance Monitoring
- ✅ Route adherence tracking
- ⏱️ On-time performance metrics
- 🚨 Automated alerts for deviations
- 📊 Compliance reporting and analytics

### 3. Driver Management
- 👥 Driver performance scoring
- 📈 Behavior analytics (speeding, harsh braking, idle time)
- 🎯 Performance badges and recognition
- 📋 Trip history and records

### 4. Vehicle Management
- 🚗 Complete fleet inventory
- 🔧 Maintenance scheduling and tracking
- ⛽ Fuel consumption monitoring
- 📄 Insurance and documentation management
- 🏷️ Kenyan license plate tracking (KBC, KDA, KBM series)

### 5. Maintenance Management
- 🔧 Service scheduling and reminders
- 💰 Cost tracking (KES-based)
- 📅 Next due date alerts
- 📊 Maintenance history and analytics
- ⚠️ Overdue service notifications

### 6. Analytics & Reporting
- 📊 Financial insights and cost analysis
- 📈 Performance trends and KPIs
- 💵 Fuel cost tracking
- 🎯 Route efficiency metrics
- 📉 Savings and optimization reports

### 7. Kenyan Localization
- 🇰🇪 KES currency formatting
- 📱 M-Pesa payment integration tracking
- 🚔 Police checkpoint alerts
- 🛣️ Major Kenyan route monitoring (Nairobi-Mombasa, Thika Highway, etc.)
- 🚐 Matatu classification support
- 🏢 Sacco-friendly features

### 8. Role-Based Access Control
- 👨‍💼 Fleet Manager (Full Access)
- 👷 Operations Team (Vehicle & Driver Management)
- 🚗 Drivers (Personal Dashboard)
- 💰 Finance Team (Analytics & Reports)

---

## 🛠️ Technology Stack

### Frontend
- **React 18.3** - Modern UI library
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn-ui** - High-quality component library
- **React Router** - Client-side routing
- **Mapbox GL** - Interactive maps
- **Recharts** - Data visualization
- **React Hook Form** - Form management
- **Zod** - Schema validation

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL database
  - Row-Level Security (RLS)
  - Authentication
  - Edge Functions
  - Real-time subscriptions

### Communication & Integration
- **LoRa (Long-Range)** - Low-power wide-area network
- **GPS** - Global Positioning System
- **RESTful API** - Standard API architecture

### Development Tools
- **ESLint** - Code linting
- **TypeScript** - Static type checking
- **Git** - Version control

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **npm** or **bun** package manager
- **Git** for version control
- **Supabase Account** for backend services

### Step 1: Clone the Repository

```bash
git clone <YOUR_GIT_URL>
cd kenya-fleet-hub
```

### Step 2: Install Dependencies

```bash
npm install
# or
bun install
```

### Step 3: Environment Configuration

Create a `.env` file in the root directory:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox Configuration (Required for Live Tracking)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

# Environment
NODE_ENV=development
```

**Getting Supabase Credentials:**
1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

**Getting Mapbox Access Token:**
1. Go to [Mapbox Account](https://account.mapbox.com/)
2. Sign up or log in (free account available)
3. Navigate to **Access Tokens**
4. Copy your **Default Public Token** → `VITE_MAPBOX_ACCESS_TOKEN`
   - Or create a new token with scopes: `styles:read`, `fonts:read`, `datasets:read`

> **Note**: 
> - Mapbox token is **required** for Live Tracking feature to work
> - See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed deployment instructions
> - If token is not set, users can manually configure it in the Live Tracking page

### Step 4: Database Setup

**Option A: Using Supabase Dashboard (No CLI Required - Recommended)**

1. Go to Supabase Dashboard → **SQL Editor**
2. Run migrations located in `supabase/migrations/` **in chronological order**:
   - `20251109071828_*.sql` - Initial schema
   - `20251110054822_*.sql` - RLS and roles
   - `20251122065508_*.sql` - Profile updates
   - `20251122070414_*.sql` - Vehicle management
   - `20251122070431_*.sql` - Function fixes
   - `20251220072502_*.sql` - Driver policies
   - `20251220072511_*.sql` - Profile policies
   - `20251221000000_*.sql` - Missing fields and behavior events
3. Copy-paste each migration file content and click **Run**

**Option B: Using Supabase CLI (If Installed)**
```bash
supabase db push
```

**See [SETUP_WITHOUT_CLI.md](SETUP_WITHOUT_CLI.md) for detailed step-by-step instructions without CLI**

### Step 5: Create Test Accounts & Seed Sample Data

**Create Test Accounts:**

```bash
curl -X POST https://your-project.supabase.co/functions/v1/seed-test-accounts
```

**Seed Sample Data (Vehicles, Trips, Maintenance, etc.):**

```bash
curl -X POST https://your-project.supabase.co/functions/v1/seed-sample-data \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Manual Option:**

Use the signup form or create accounts directly in Supabase Auth.

See [SETUP_GUIDE.md](SETUP_GUIDE.md), [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md), and [DATA_SETUP_GUIDE.md](DATA_SETUP_GUIDE.md) for detailed instructions.

### Step 6: Start Development Server

```bash
npm run dev
# or
bun dev
```

The application will be available at `http://localhost:5173`

### Step 7: Build for Production

```bash
npm run build
# or
bun run build
```

---

## 📖 Usage

### Quick Start Guide

1. **Login**: Use test credentials from [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md)
2. **Dashboard**: View fleet overview and key metrics
3. **Live Tracking**: Monitor vehicles in real-time
4. **Vehicles**: Manage fleet inventory
5. **Drivers**: Track driver performance
6. **Maintenance**: Schedule and track services
7. **Analytics**: View reports and insights

### Test Accounts

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| Fleet Manager | manager@safirismart.co.ke | Manager2024! | Full Access |
| Operations | operations@safirismart.co.ke | Ops2024! | Vehicle & Driver Management |
| Driver | john.kamau@safirismart.co.ke | Driver2024! | Personal Dashboard |
| Finance | finance@safirismart.co.ke | Finance2024! | Analytics & Reports |

### Navigation

- **Dashboard** (`/dashboard`) - Executive overview
- **Live Tracking** (`/live-tracking`) - Real-time GPS monitoring
- **Vehicles** (`/vehicles`) - Fleet management
- **Drivers** (`/drivers`) - Driver performance
- **Maintenance** (`/maintenance`) - Service tracking
- **Analytics** (`/analytics`) - Reports and insights
- **Settings** (`/settings`) - System configuration

For detailed usage instructions, see [SETUP_GUIDE.md](SETUP_GUIDE.md).

---

## 🔧 System Components

### 1. Intelligent Transportation System (ITS) Architecture

The ITS architecture is designed specifically for FMCS deployment in developing countries, focusing on:
- Cost-effective communication solutions
- Interoperability standards
- Scalability for growing fleets
- Integration with existing transit infrastructure

### 2. FMCS Prototype Development

Built using Long-Range (LoRa) communication technology and Intelligent Transportation Systems services:
- **LoRa Network**: Low-power, wide-area network for cost-effective data transmission
- **GPS Integration**: Real-time location tracking
- **Cloud Infrastructure**: Scalable backend services
- **Mobile Support**: Responsive design for drivers and managers

### 3. Validation and Testing

The system has been validated and tested using transit vehicles in Kenya:
- Real-world route testing
- Schedule compliance validation
- Driver behavior monitoring
- Cost-effectiveness analysis
- Performance optimization

---

## 📊 Market Context

### Industry Growth

According to **Fortune Business Insights**, the fleet management software market is projected to:
- **Attain a value of $116.56 billion by 2032**
- **Annual growth rate (CAGR) of 19.8%**

### Market Drivers

- Increasing reliance on transportation and logistics
- Need for operational efficiency and cost savings
- Growing demand for real-time tracking and analytics
- Regulatory compliance requirements
- Safety and security concerns

### Competitive Advantages

- ✅ Cost-effective communication technology (LoRa)
- ✅ Designed for developing country contexts
- ✅ Kenyan market localization
- ✅ Interoperability with other mobility services
- ✅ Real-time monitoring and compliance tracking

---

## 📁 Project Structure

```
kenya-fleet-hub/
├── src/
│   ├── components/          # React components
│   │   ├── dashboard/       # Dashboard-specific components
│   │   ├── ui/              # shadcn-ui components
│   │   └── ...
│   ├── pages/              # Page components
│   │   ├── Dashboard.tsx
│   │   ├── LiveTracking.tsx
│   │   ├── Vehicles.tsx
│   │   ├── Drivers.tsx
│   │   ├── Maintenance.tsx
│   │   └── Analytics.tsx
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utility functions
│   ├── integrations/       # Third-party integrations
│   │   └── supabase/       # Supabase client and types
│   └── main.tsx            # Application entry point
├── supabase/
│   ├── migrations/         # Database migrations (8 files)
│   │   ├── 20251109071828_*.sql  # Initial schema
│   │   ├── 20251110054822_*.sql  # RLS and roles
│   │   ├── 20251122065508_*.sql  # Profile updates
│   │   ├── 20251122070414_*.sql  # Vehicle management
│   │   ├── 20251122070431_*.sql  # Function fixes
│   │   ├── 20251220072502_*.sql  # Driver policies
│   │   ├── 20251220072511_*.sql  # Profile policies
│   │   └── 20251221000000_*.sql  # Missing fields & behavior events
│   └── functions/          # Edge functions
│       ├── create-driver/
│       ├── generate-live-locations/
│       ├── seed-test-accounts/
│       └── seed-sample-data/
├── public/                 # Static assets
├── package.json            # Dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── README.md               # This file (comprehensive overview)
├── SETUP_GUIDE.md          # Detailed setup guide
├── TEST_CREDENTIALS.md     # Test account information
├── DATA_SETUP_GUIDE.md     # Data seeding and structure guide
├── DATABASE_SCHEMA.md      # Complete database schema reference
├── DEPLOYMENT.md           # Deployment instructions
├── JUDGES_PRESENTATION.md  # Presentation guide
├── PROJECT_CHECKLIST.md    # Project readiness checklist
├── ROLE_BASED_ACCESS.md    # RBAC documentation
├── MAPBOX_SETUP.md         # Mapbox configuration guide
└── QUICK_START.md          # Quick setup guide
```

---

## 🤝 Contributing

We welcome contributions to improve the FMCS system! Please follow these guidelines:

1. **Fork the repository**
2. **Create a feature branch** (`git checkout -b feature/amazing-feature`)
3. **Make your changes** following the code style
4. **Write or update tests** if applicable
5. **Commit your changes** (`git commit -m 'Add some amazing feature'`)
6. **Push to the branch** (`git push origin feature/amazing-feature`)
7. **Open a Pull Request**

### Development Guidelines

- Follow TypeScript best practices
- Use ESLint for code quality
- Write meaningful commit messages
- Update documentation for new features
- Test thoroughly before submitting PRs

### Areas for Contribution

- 🐛 Bug fixes
- ✨ New features
- 📚 Documentation improvements
- 🎨 UI/UX enhancements
- 🧪 Test coverage
- 🌍 Localization (additional languages)
- 🔌 Integration with other services

---

## 📄 License

[Specify your license here]

---

## 📞 Support & Contact

For questions, issues, or support:

1. Check the [SETUP_GUIDE.md](SETUP_GUIDE.md) for common solutions
2. Review [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md) for account setup
3. See [DATA_SETUP_GUIDE.md](DATA_SETUP_GUIDE.md) for data seeding instructions
4. See [DEPLOYMENT.md](DEPLOYMENT.md) for deployment instructions
5. Review [PROJECT_CHECKLIST.md](PROJECT_CHECKLIST.md) for project readiness
6. Check [JUDGES_PRESENTATION.md](JUDGES_PRESENTATION.md) for presentation guide
7. Review [ROLE_BASED_ACCESS.md](ROLE_BASED_ACCESS.md) for access control details
8. Inspect browser console for errors
9. Verify database connections and RLS policies

---

## 📚 References

- Rojas, A. (2020). *Fleet Management Control Systems: A Comprehensive Approach*
- Ramirez-Guerrero, T., et al. (2022). *Transit Service Compliance in Medium-Sized Cities*
- Fortune Business Insights. *Fleet Management Software Market Report 2024-2032*

---

## 🎯 Roadmap

### Current Features ✅
- Real-time vehicle tracking
- Driver performance monitoring
- Maintenance scheduling
- Analytics and reporting
- Kenyan localization
- Role-based access control

### Planned Enhancements 🚀
- Mobile app for drivers
- Advanced route optimization
- Predictive maintenance
- Integration with payment systems (M-Pesa)
- Multi-language support (Swahili, English)
- API for third-party integrations
- Advanced analytics and AI insights
- Compliance reporting automation

---

## 🙏 Acknowledgments

- Built with ❤️ for Kenyan transit services
- Designed to improve transportation in developing countries
- Special thanks to the transit operators and drivers who participated in validation testing

---

**Project URL**: https://lovable.dev/projects/2481dc44-80dc-406a-969e-31c694bcec96

**Status**: 🚀 Active Development

---

*"Usafiri Bora, Maisha Bora" - Better Transport, Better Life*
