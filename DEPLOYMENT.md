# 🚀 Deployment Guide - Kenya Fleet Hub FMCS

This guide provides step-by-step instructions for deploying the Fleet Management Control System to production.

---

## 📋 Prerequisites

- Node.js 18+ installed
- npm or bun package manager
- Supabase account (free tier available)
- Git repository access
- Domain name (optional, for custom domain)

---

## 🔧 Step 1: Environment Setup

### 1.1 Clone Repository

```bash
git clone <your-repository-url>
cd kenya-fleet-hub
```

### 1.2 Install Dependencies

```bash
npm install
# or
bun install
```

### 1.3 Create Environment File

Create a `.env` file in the root directory:

```env
# Supabase Configuration (Required)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Mapbox Configuration (Required for Live Tracking)
VITE_MAPBOX_ACCESS_TOKEN=your_mapbox_access_token

# Environment
NODE_ENV=production
```

**Getting Mapbox Access Token:**
1. Go to [Mapbox Account](https://account.mapbox.com/)
2. Sign up or log in (free account available)
3. Navigate to **Access Tokens**
4. Copy your **Default Public Token** or create a new one
5. Required scopes: `styles:read`, `fonts:read`, `datasets:read`

### 1.4 Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project or select existing project
3. Navigate to **Settings** → **API**
4. Copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

---

## 🗄️ Step 2: Database Setup

### 2.1 Run Migrations

All migrations are located in `supabase/migrations/`. Run them in order:

```bash
# Using Supabase CLI (recommended)
supabase db push

# Or manually via Supabase Dashboard:
# 1. Go to SQL Editor
# 2. Run each migration file in chronological order:
#    - 20251109071828_0530c837-bff5-4dfb-8283-15b8603f666a.sql
#    - 20251110054822_aaf75ae1-5724-4261-9d9f-f9825addbd16.sql
#    - 20251122065508_ce368aa0-2e18-42c4-8ca3-246c6fdb4c49.sql
#    - 20251122070414_ba002263-4c4a-466b-850c-784cd793965e.sql
#    - 20251122070431_fdf4cbfa-1964-4dce-bb16-08414a38b070.sql
#    - 20251220072502_17647326-b7af-4040-ab37-4f53b38a933c.sql
#    - 20251220072511_eddfebe9-7942-45f1-87c9-0fd9cb37aff3.sql
```

### 2.2 Verify Database Schema

Check that all tables are created:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

Expected tables:
- drivers
- fuel_logs
- kenyan_routes
- live_locations
- maintenance_logs
- profiles
- routes_master
- trips
- user_roles
- vehicle_types
- vehicles

### 2.3 Set Up Row-Level Security

RLS policies are included in migrations. Verify they're enabled:

```sql
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

---

## 🔐 Step 3: Authentication Setup

### 3.1 Configure Supabase Auth

1. Go to **Authentication** → **Settings**
2. Enable **Email** provider
3. Configure email templates (optional)
4. Set **Site URL** to your deployment URL

### 3.2 Create Initial Admin Account

Use the seed function or create manually:

```bash
# Option 1: Use seed function
curl -X POST https://your-project.supabase.co/functions/v1/seed-test-accounts

# Option 2: Manual creation via Supabase Dashboard
# Go to Authentication → Users → Add User
```

### 3.3 Assign Roles

After creating users, assign roles in `user_roles` table:

```sql
INSERT INTO user_roles (user_id, role)
VALUES ('user-uuid', 'fleet_manager');
```

---

## ⚙️ Step 4: Edge Functions Setup

### 4.1 Deploy Edge Functions

```bash
# Using Supabase CLI
supabase functions deploy seed-test-accounts
supabase functions deploy generate-live-locations
supabase functions deploy create-driver
```

### 4.2 Configure Function Secrets

Set environment variables for functions:

```bash
supabase secrets set SUPABASE_URL=your_url
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

---

## 🏗️ Step 5: Build Application

### 5.1 Production Build

```bash
npm run build
# or
bun run build
```

This creates a `dist/` folder with optimized production files.

### 5.2 Preview Build Locally

```bash
npm run preview
# or
bun run preview
```

Visit `http://localhost:4173` to verify the build.

---

## 🌐 Step 6: Deploy to Hosting

### Option A: Vercel (Recommended)

1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Deploy**:
   ```bash
   vercel
   ```

3. **Configure Environment Variables**:
   - Go to Vercel Dashboard → Project → Settings → Environment Variables
   - Add all variables from `.env` file

4. **Redeploy**:
   ```bash
   vercel --prod
   ```

### Option B: Netlify

1. **Connect Repository**:
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click **Add new site** → **Import an existing project**
   - Connect your Git provider and select repository

2. **Configure Build Settings** (Auto-detected):
   - Build command: `npm run build`
   - Publish directory: `dist`

3. **Set Environment Variables** (CRITICAL):
   - Go to **Site settings** → **Environment variables**
   - Add these variables:
     ```
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key-here
     VITE_MAPBOX_ACCESS_TOKEN=your-mapbox-token (optional)
     ```
   - **Important:** After adding variables, redeploy with cache cleared

4. **Deploy**:
   - Netlify will auto-deploy on git push
   - Or manually: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

**See [NETLIFY_SETUP.md](NETLIFY_SETUP.md) for detailed Netlify deployment guide**

### Option C: Traditional Hosting

1. **Upload `dist/` folder** to your web server
2. **Configure web server** (nginx/Apache) to serve static files
3. **Set up SSL certificate** (Let's Encrypt recommended)
4. **Configure environment variables** on server

### Option D: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Build and run:

```bash
docker build -t kenya-fleet-hub .
docker run -p 80:80 kenya-fleet-hub
```

---

## 🔄 Step 7: Post-Deployment

### 7.1 Verify Deployment

1. Visit your deployment URL
2. Test login functionality
3. Verify all pages load correctly
4. Check console for errors

### 7.2 Set Up Monitoring

- **Error Tracking**: Consider Sentry or similar
- **Analytics**: Google Analytics or Plausible
- **Uptime Monitoring**: UptimeRobot or Pingdom

### 7.3 Configure Custom Domain

1. **Add Domain in Hosting Provider**:
   - Vercel: Project Settings → Domains
   - Netlify: Domain Settings → Custom Domains

2. **Update Supabase Site URL**:
   - Authentication → Settings → Site URL

3. **Update CORS Settings** (if needed)

---

## 🧪 Step 8: Testing

### 8.1 Functional Testing

- [ ] User authentication (signup/login)
- [ ] Dashboard loads with data
- [ ] Live tracking shows vehicles
- [ ] Vehicle management (CRUD)
- [ ] Driver management (CRUD)
- [ ] Maintenance logs
- [ ] Analytics reports
- [ ] Role-based access control

### 8.2 Performance Testing

- [ ] Page load times < 3 seconds
- [ ] Real-time updates working
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility

### 8.3 Security Testing

- [ ] RLS policies enforced
- [ ] Unauthorized access blocked
- [ ] HTTPS enabled
- [ ] Environment variables secure

---

## 📊 Step 9: Production Checklist

### Database
- [ ] All migrations applied
- [ ] RLS policies active
- [ ] Indexes created (if needed)
- [ ] Backups configured

### Application
- [ ] Environment variables set
- [ ] Build successful
- [ ] No console errors
- [ ] All routes working

### Security
- [ ] HTTPS enabled
- [ ] CORS configured
- [ ] API keys secured
- [ ] Authentication working

### Monitoring
- [ ] Error tracking set up
- [ ] Analytics configured
- [ ] Uptime monitoring active
- [ ] Logs accessible

---

## 🐛 Troubleshooting

### Issue: Build Fails

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: Environment Variables Not Working

**Solution:**
- Verify variable names start with `VITE_`
- Restart development server after changes
- Check for typos in variable names

### Issue: Database Connection Errors

**Solution:**
- Verify Supabase URL and keys
- Check network connectivity
- Verify RLS policies allow access

### Issue: Real-Time Updates Not Working

**Solution:**
- Check Supabase real-time is enabled
- Verify WebSocket connections
- Check browser console for errors

---

## 📞 Support

For deployment issues:
1. Check [SETUP_GUIDE.md](SETUP_GUIDE.md)
2. Review [README.md](README.md)
3. Check Supabase documentation
4. Review error logs

---

## 🔄 Updates & Maintenance

### Updating the Application

```bash
git pull origin main
npm install
npm run build
# Redeploy to hosting provider
```

### Database Migrations

```bash
# Create new migration
supabase migration new migration_name

# Apply migrations
supabase db push
```

### Edge Functions Updates

```bash
supabase functions deploy function-name
```

---

**Deployment Status**: ✅ Ready for Production

*Last Updated: 2024*

