# 🗺️ Mapbox Configuration Guide - Live Tracking

This guide explains how to configure Mapbox for the Live Tracking feature in Kenya Fleet Hub FMCS.

---

## 📋 Overview

The Live Tracking feature uses **Mapbox GL JS** to display an interactive map showing vehicle locations in real-time. Mapbox requires an access token to function.

---

## 🔑 Getting Your Mapbox Access Token

### Step 1: Create Mapbox Account
1. Visit [Mapbox Account](https://account.mapbox.com/)
2. Sign up for a free account (or log in if you already have one)
3. Free tier includes **50,000 map loads per month**

### Step 2: Get Your Access Token
1. After logging in, navigate to **Access Tokens** page
2. You'll see your **Default Public Token** (starts with `pk.eyJ1...`)
3. Copy this token

**OR** create a new token:
1. Click **Create a token**
2. Give it a name (e.g., "Kenya Fleet Hub")
3. Select scopes:
   - ✅ `styles:read` (required)
   - ✅ `fonts:read` (required)
   - ✅ `datasets:read` (optional, for custom data)
4. Copy the generated token

---

## ⚙️ Configuration Methods

### Method 1: Environment Variable (Recommended)

Add to your `.env` file:

```env
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsbXh4eHh4eHgiLCJ9.your-token-here
```

**Advantages:**
- ✅ Secure (not committed to git)
- ✅ Works in all environments
- ✅ No manual configuration needed
- ✅ Production-ready

### Method 2: Manual Configuration (Fallback)

If environment variable is not set, users can configure the token directly in the Live Tracking page:

1. Navigate to **Live Tracking** (`/live-tracking`)
2. You'll see a configuration card
3. Enter your Mapbox token
4. Click **Save Token**

**Note:** This saves to localStorage and is only for development/testing.

---

## 🔧 Implementation Details

### How It Works

The `KenyaFleetMap` component checks for the token in this order:

1. **Environment Variable** (`VITE_MAPBOX_ACCESS_TOKEN`) - **Priority 1**
2. **LocalStorage** (`mapbox_token`) - **Fallback**
3. **Manual Input** - **Last Resort**

### Code Location

- **Component**: `src/components/KenyaFleetMap.tsx`
- **Usage**: `src/pages/LiveTracking.tsx`
- **Also Used**: `src/components/dashboard/FleetMapView.tsx`

---

## 🚀 Setup Instructions

### Development

1. **Create `.env` file** in project root:
   ```env
   VITE_MAPBOX_ACCESS_TOKEN=your_token_here
   ```

2. **Restart dev server**:
   ```bash
   npm run dev
   ```

3. **Verify**: Navigate to Live Tracking page - map should load automatically

### Production

1. **Set environment variable** in your hosting platform:
   - **Vercel**: Project Settings → Environment Variables
   - **Netlify**: Site Settings → Environment Variables
   - **Other**: Set `VITE_MAPBOX_ACCESS_TOKEN` in your deployment config

2. **Rebuild**:
   ```bash
   npm run build
   ```

3. **Deploy**: The token will be included in the build

---

## ✅ Verification

### Check if Token is Configured

1. Open browser console (F12)
2. Navigate to Live Tracking page
3. Look for:
   - ✅ **Success**: Map loads with vehicle markers
   - ❌ **Error**: "Invalid token" or map doesn't load

### Test Token

Visit: `https://api.mapbox.com/tokens/v2?access_token=YOUR_TOKEN`

Should return JSON with token information.

---

## 🔒 Security Best Practices

1. **Never commit tokens to Git**
   - Add `.env` to `.gitignore`
   - Use environment variables in production

2. **Use Public Tokens Only**
   - Mapbox public tokens are safe for client-side use
   - They have URL restrictions you can configure

3. **Restrict Token Scopes**
   - Only grant necessary permissions
   - Use URL restrictions in Mapbox dashboard

4. **Rotate Tokens Regularly**
   - Change tokens if compromised
   - Update environment variables accordingly

---

## 🐛 Troubleshooting

### Issue: Map Not Loading

**Symptoms:**
- Blank map area
- "Invalid token" error
- Configuration card showing

**Solutions:**
1. Check `.env` file exists and has correct variable name
2. Verify token starts with `pk.eyJ1...`
3. Restart dev server after adding token
4. Check browser console for errors
5. Verify token is valid at Mapbox dashboard

### Issue: "Invalid Token" Error

**Causes:**
- Token expired or revoked
- Token doesn't have required scopes
- Token format incorrect

**Solutions:**
1. Generate new token in Mapbox dashboard
2. Update `.env` file with new token
3. Restart server
4. Clear browser cache/localStorage

### Issue: Token Not Found

**Causes:**
- Environment variable not set
- Variable name incorrect
- Server not restarted

**Solutions:**
1. Verify `.env` file in project root
2. Check variable name: `VITE_MAPBOX_ACCESS_TOKEN`
3. Restart dev server: `npm run dev`
4. Check for typos in variable name

---

## 📊 Mapbox Usage & Limits

### Free Tier Limits
- **50,000 map loads/month**
- **50,000 geocoding requests/month**
- Sufficient for small to medium fleets

### Monitoring Usage
1. Visit [Mapbox Account](https://account.mapbox.com/)
2. Check **Usage** dashboard
3. Monitor map loads and API calls

### Upgrading
If you exceed free tier:
- Upgrade to **Pay-as-you-go** plan
- $5 per 1,000 additional map loads
- No credit card required for free tier

---

## 🔗 Related Documentation

- [README.md](README.md) - Project overview
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment guide
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Setup instructions
- [Mapbox Documentation](https://docs.mapbox.com/) - Official Mapbox docs

---

## 📝 Example `.env` File

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Mapbox Configuration (Required for Live Tracking)
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsbXh4eHh4eHgiLCJ9.your-token-here

# Environment
NODE_ENV=development
```

---

## ✅ Checklist

- [ ] Mapbox account created
- [ ] Access token obtained
- [ ] Token added to `.env` file
- [ ] Dev server restarted
- [ ] Live Tracking page tested
- [ ] Map loads successfully
- [ ] Vehicle markers visible
- [ ] Production environment variable set (if deploying)

---

**Last Updated**: 2024

*Mapbox integration enables real-time vehicle tracking on an interactive map.*

