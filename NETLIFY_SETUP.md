# 🌐 Netlify Deployment Guide - Kenya Fleet Hub FMCS

Complete guide for deploying to Netlify with proper environment variable configuration.

---

## 🚀 Quick Deployment

### Step 1: Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **Add new site** → **Import an existing project**
3. Connect your Git provider (GitHub, GitLab, Bitbucket)
4. Select your `kenya-fleet-hub` repository
5. Netlify will auto-detect Vite settings

### Step 2: Configure Build Settings

Netlify should auto-detect these settings, but verify:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Node version**: `18` or higher

### Step 3: Set Environment Variables (CRITICAL)

This is the most important step! Go to **Site settings** → **Environment variables** and add:

#### Required Variables:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Optional (but recommended):

```
VITE_MAPBOX_ACCESS_TOKEN=pk.eyJ1...your-token-here
```

**How to get these values:**

1. **Supabase URL & Key:**
   - Go to [Supabase Dashboard](https://app.supabase.com)
   - Select your project
   - Go to **Settings** → **API**
   - Copy:
     - **Project URL** → `VITE_SUPABASE_URL`
     - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

2. **Mapbox Token (Optional):**
   - Go to [Mapbox Account](https://account.mapbox.com/access-tokens/)
   - Copy your **Default Public Token** → `VITE_MAPBOX_ACCESS_TOKEN`

### Step 4: Deploy

1. Click **Deploy site**
2. Wait for build to complete
3. Your site will be live at `https://your-site-name.netlify.app`

---

## 🔧 Detailed Setup Instructions

### Method 1: Via Netlify Dashboard (Recommended)

1. **Navigate to Environment Variables:**
   - Go to your site dashboard
   - Click **Site settings**
   - Click **Environment variables** in the left sidebar

2. **Add Each Variable:**
   - Click **Add a variable**
   - Enter variable name (e.g., `VITE_SUPABASE_URL`)
   - Enter variable value
   - Select scope:
     - **All scopes** (for production)
     - Or specific scopes (production, deploy previews, branch deploys)
   - Click **Save**

3. **Verify Variables:**
   - You should see all three variables listed
   - Variables starting with `VITE_` will be available in your build

4. **Redeploy:**
   - Go to **Deploys** tab
   - Click **Trigger deploy** → **Clear cache and deploy site**
   - This ensures new environment variables are picked up

### Method 2: Via netlify.toml (Alternative)

Create a `netlify.toml` file in your project root:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[build.environment]
  NODE_VERSION = "18"

# Note: Do NOT put actual secrets here!
# Use Netlify Dashboard for sensitive values
# This is just for reference
```

Then set variables via Dashboard as shown in Method 1.

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Site builds successfully (check Deploys tab)
- [ ] No build errors in Netlify logs
- [ ] Environment variables are set (check Site settings)
- [ ] Site loads without white screen
- [ ] Can access login page
- [ ] Can login with test accounts
- [ ] Dashboard loads with data
- [ ] No console errors about missing env vars

---

## 🐛 Troubleshooting

### Error: "Missing Supabase environment variables"

**Cause:** Environment variables not set in Netlify

**Solution:**
1. Go to **Site settings** → **Environment variables**
2. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
3. **Important:** Clear cache and redeploy
4. Go to **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

### Error: White Screen / Blank Page

**Possible Causes:**
1. Missing environment variables
2. Build failed
3. JavaScript errors

**Solution:**
1. Check **Deploys** tab for build errors
2. Check browser console (F12) for errors
3. Verify all environment variables are set
4. Check Netlify build logs for errors

### Error: "Cannot connect to Supabase"

**Cause:** Wrong Supabase URL or key

**Solution:**
1. Double-check Supabase credentials in Netlify
2. Verify URL format: `https://xxxxx.supabase.co` (no trailing slash)
3. Verify key is the **anon/public** key, not service role key
4. Test credentials in Supabase Dashboard

### Build Succeeds but Site Doesn't Work

**Possible Causes:**
1. Environment variables not prefixed with `VITE_`
2. Variables set but not redeployed
3. Cached build

**Solution:**
1. Ensure all variables start with `VITE_`
2. Clear cache and redeploy
3. Check browser console for specific errors

---

## 🔒 Security Best Practices

### ✅ DO:
- Use Netlify Dashboard for environment variables (encrypted)
- Use **anon/public** key (safe for client-side)
- Set variables per environment (production, preview, branch)
- Never commit `.env` files to Git

### ❌ DON'T:
- Put secrets in `netlify.toml`
- Commit `.env` files
- Use service role key in frontend
- Share environment variables publicly

---

## 📊 Environment Variable Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_SUPABASE_URL` | ✅ Yes | Supabase project URL | `https://xxxxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | ✅ Yes | Supabase anon/public key | `eyJhbGc...` |
| `VITE_MAPBOX_ACCESS_TOKEN` | ⚠️ Optional | Mapbox token for maps | `pk.eyJ1...` |

---

## 🔄 Updating Environment Variables

### To Update Existing Variables:

1. Go to **Site settings** → **Environment variables**
2. Find the variable you want to update
3. Click **Edit**
4. Update the value
5. Click **Save**
6. **Redeploy** (with cache cleared)

### To Add New Variables:

1. Go to **Site settings** → **Environment variables**
2. Click **Add a variable**
3. Enter name and value
4. Select scope
5. Click **Save**
6. **Redeploy**

---

## 🌍 Custom Domain Setup

1. Go to **Domain settings**
2. Click **Add custom domain**
3. Enter your domain name
4. Follow DNS configuration instructions
5. Update Supabase **Site URL** to match your custom domain

---

## 📈 Monitoring & Analytics

### Netlify Analytics:
- Go to **Analytics** tab
- View site traffic and performance
- Monitor build times

### Error Tracking:
- Check **Deploys** tab for build errors
- Check browser console for runtime errors
- Use Netlify Functions logs for edge function errors

---

## 🚨 Common Issues & Solutions

### Issue: Build Fails

**Check:**
- Node version compatibility
- Build command correctness
- Dependencies in `package.json`
- Netlify build logs

**Solution:**
```bash
# Test build locally first
npm run build

# If successful locally, check Netlify logs
```

### Issue: Environment Variables Not Working

**Check:**
- Variables start with `VITE_`
- Variables are set in correct scope
- Site was redeployed after adding variables

**Solution:**
- Clear cache and redeploy
- Check build logs for variable injection

### Issue: Site Works Locally but Not on Netlify

**Common Causes:**
- Missing environment variables
- Different Node version
- Build cache issues

**Solution:**
1. Compare local `.env` with Netlify variables
2. Clear Netlify build cache
3. Redeploy

---

## 📝 Quick Reference

### Netlify Dashboard URLs:
- **Sites**: https://app.netlify.com/sites
- **Your Site**: https://app.netlify.com/sites/your-site-name
- **Environment Variables**: Site settings → Environment variables
- **Deploys**: Deploys tab → Trigger deploy

### Your Deployment:
- **Live URL**: https://fleetsmart.netlify.app/
- **Deploy Status**: Check Deploys tab
- **Build Logs**: Click on any deploy to see logs

---

## ✅ Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Site builds successfully
- [ ] No console errors
- [ ] Login page works
- [ ] Can login with test accounts
- [ ] Dashboard loads
- [ ] All features accessible
- [ ] Mobile responsive
- [ ] Custom domain configured (if applicable)

---

## 🆘 Getting Help

If you encounter issues:

1. **Check Netlify Build Logs:**
   - Go to Deploys tab
   - Click on failed deploy
   - Review error messages

2. **Check Browser Console:**
   - Open site in browser
   - Press F12
   - Check Console tab for errors

3. **Verify Environment Variables:**
   - Site settings → Environment variables
   - Ensure all required variables are set

4. **Test Locally:**
   - Run `npm run build` locally
   - Test build output
   - Compare with Netlify build

---

**Your site is live at:** https://fleetsmart.netlify.app/

*Make sure to set environment variables in Netlify Dashboard for the site to work properly!*

