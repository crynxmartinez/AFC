# Prerender.io Setup Instructions

## The Problem
Vercel's conditional rewrites (`has` with user-agent) are not reliable for bot detection.

## Solution: Use Prerender.io's Dashboard Configuration

### Step 1: Configure in Prerender.io Dashboard

1. Go to: https://dashboard.prerender.io/
2. Click "Settings" or "Domains"
3. Add your domain: `afc-kappa.vercel.app`
4. Enable "Auto-detect and cache"

### Step 2: Use Prerender.io's CDN URL

Instead of trying to detect bots in Vercel, use Prerender.io's CDN directly:

**Option A: Update DNS (Best)**
- Point your domain's DNS to Prerender.io's CDN
- They handle bot detection
- Forward regular traffic to Vercel

**Option B: Use Prerender.io's Proxy**
- Configure Prerender.io to proxy your site
- All traffic goes through them
- They serve cached versions to bots

### Step 3: Manual Caching

For now, manually cache important URLs:

1. Go to: https://dashboard.prerender.io/cache
2. Click "Add URLs"
3. Add entry URLs:
   ```
   https://afc-kappa.vercel.app/entries/c6bb6143-fc9f-4ab5-a2e3-8fa590910ffd
   https://afc-kappa.vercel.app/entries/[other-entry-ids]
   ```
4. Click "Cache Now"

### Step 4: Test

After caching:
1. Go to Facebook Debugger
2. Scrape the entry URL
3. Should show correct meta tags!

## Why Vercel Rewrites Don't Work

Vercel's `has` condition with user-agent matching is:
- Not reliable
- Doesn't work with all bot user-agents
- Can't pass headers properly to rewrites
- Causes redirect loops

## Alternative: Accept Default Meta Tags for Now

For soft launch, it's acceptable to show:
- Generic "Arena for Creatives" title
- Default description
- Default image

After launch, implement proper SSR or use a different hosting solution.
