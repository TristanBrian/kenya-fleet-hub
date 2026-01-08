# ⚡ Quick Start Guide - Kenya Fleet Hub FMCS

Get up and running in 5 minutes!

---

## 🚀 Fast Setup (5 Minutes)

### 1. Clone & Install (1 min)

```bash
git clone <your-repo-url>
cd kenya-fleet-hub
npm install
```

### 2. Configure Environment (1 min)

Create `.env` file:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_token  # Required for Live Tracking
```

**Get Mapbox Token:**
- Visit [Mapbox Account](https://account.mapbox.com/access-tokens/)
- Copy your Default Public Token (starts with `pk.eyJ1...`)

### 3. Setup Database (2 min)

**Using Supabase Dashboard (No CLI Required):**
1. Go to Supabase Dashboard → SQL Editor
2. Run each migration file from `supabase/migrations/` in order
3. Copy-paste each file content and click Run

**See [SETUP_WITHOUT_CLI.md](SETUP_WITHOUT_CLI.md) for detailed step-by-step instructions**

### 4. Create Test Accounts (30 sec)

**Option A: Manual Creation (Recommended)**
1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User" → "Create New User"
3. Create accounts with emails/passwords from [TEST_CREDENTIALS.md](TEST_CREDENTIALS.md)
4. Assign roles using SQL Editor (see SETUP_WITHOUT_CLI.md)

**Option B: Using Edge Function**
```bash
# Replace YOUR_PROJECT_REF and YOUR_ANON_KEY with actual values
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/seed-test-accounts \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

### 5. Start Development (30 sec)

```bash
npm run dev
```

Visit `http://localhost:5173` and login with:
- **Email**: manager@safirismart.co.ke
- **Password**: Manager2024!

---

## 📚 Full Documentation

- **[README.md](README.md)** - Complete project overview
- **[SETUP_GUIDE.md](SETUP_GUIDE.md)** - Detailed setup instructions
- **[DEPLOYMENT.md](DEPLOYMENT.md)** - Production deployment guide
- **[JUDGES_PRESENTATION.md](JUDGES_PRESENTATION.md)** - Presentation guide
- **[PROJECT_CHECKLIST.md](PROJECT_CHECKLIST.md)** - Readiness checklist

---

## 🎯 Test Accounts

| Role | Email | Password |
|------|-------|----------|
| Fleet Manager | manager@safirismart.co.ke | Manager2024! |
| Operations | operations@safirismart.co.ke | Ops2024! |
| Driver | john.kamau@safirismart.co.ke | Driver2024! |
| Finance | finance@safirismart.co.ke | Finance2024! |

---

## ✅ Verify Installation

1. ✅ Application starts without errors
2. ✅ Can login with test account
3. ✅ Dashboard loads with data
4. ✅ All navigation links work
5. ✅ No console errors

---

## 🆘 Troubleshooting

**Issue**: Environment variables not working
- Ensure variable names start with `VITE_`
- Restart dev server after changes

**Issue**: Database connection errors
- Verify Supabase URL and keys
- Check RLS policies are configured

**Issue**: Build fails
- Clear cache: `rm -rf node_modules package-lock.json`
- Reinstall: `npm install`

---

**Ready to go!** 🎉

