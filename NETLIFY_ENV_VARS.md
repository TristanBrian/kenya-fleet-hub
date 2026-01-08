# 🔑 Netlify Environment Variables - Quick Setup

**URGENT:** Your site needs these environment variables to work!

---

## ⚡ Quick Fix (2 Minutes)

### Step 1: Get Your Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Go to **Settings** → **API**
4. Copy:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (starts with `eyJ...`)

### Step 2: Add to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Select your site: **fleetsmart**
3. Go to **Site settings** → **Environment variables**
4. Click **Add a variable** for each:

**Variable 1:**
- Key: `VITE_SUPABASE_URL`
- Value: `https://xxxxx.supabase.co` (your actual URL)
- Scope: **All scopes**
- Click **Save**

**Variable 2:**
- Key: `VITE_SUPABASE_ANON_KEY`
- Value: `eyJ...` (your actual anon key)
- Scope: **All scopes**
- Click **Save**

**Variable 3 (Optional - for maps):**
- Key: `VITE_MAPBOX_ACCESS_TOKEN`
- Value: `pk.eyJ1...` (your Mapbox token)
- Scope: **All scopes**
- Click **Save**

### Step 3: Redeploy

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**
3. Wait for build to complete
4. Test your site!

---

## ✅ Verification

After redeploying, check:
- ✅ Site loads without white screen
- ✅ No console errors about missing env vars
- ✅ Can access login page
- ✅ Can login with test accounts

---

## 🆘 Still Having Issues?

1. **Double-check variable names:**
   - Must start with `VITE_`
   - No typos
   - No extra spaces

2. **Verify values:**
   - Supabase URL: No trailing slash
   - Anon key: Full key copied (very long string)

3. **Clear cache and redeploy:**
   - Always clear cache when adding/updating env vars

4. **Check build logs:**
   - Go to Deploys tab
   - Click on latest deploy
   - Check for errors

---

**Your Site:** https://fleetsmart.netlify.app/

**Netlify Dashboard:** https://app.netlify.com/sites/fleetsmart

---

*See [NETLIFY_SETUP.md](NETLIFY_SETUP.md) for complete guide*

