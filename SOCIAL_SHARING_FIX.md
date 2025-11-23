# 🔧 Social Sharing Fix for SPA

## Problem
Facebook and other social media crawlers can't read React's dynamically generated meta tags because they don't execute JavaScript.

## Solutions (in order of complexity)

### ✅ Solution 1: Use Prerender.io (Recommended - Easiest)
**Free tier available, works immediately**

1. Sign up at https://prerender.io
2. Add to Vercel:
   ```json
   // vercel.json
   {
     "rewrites": [
       {
         "source": "/entries/:id",
         "has": [
           {
             "type": "header",
             "key": "user-agent",
             "value": ".*(bot|crawler|spider|facebookexternalhit|twitterbot).*"
           }
         ],
         "destination": "https://service.prerender.io/https://afc-kappa.vercel.app/entries/:id"
       }
     ]
   }
   ```

### ✅ Solution 2: Vercel Edge Middleware (Medium)
Create middleware to detect crawlers and serve pre-rendered HTML.

Requires:
- Creating edge functions
- Fetching entry data
- Generating HTML with meta tags

### ✅ Solution 3: Static Site Generation (Complex)
Convert to Next.js or use Vite SSR plugin.

Requires:
- Major refactoring
- Server-side rendering setup
- Build process changes

### ✅ Solution 4: Quick Hack (Current - Partial Fix)
Use default meta tags in index.html.

**Pros:**
- Works immediately
- No external services

**Cons:**
- Shows generic "Arena for Creatives" for all shares
- No entry-specific images/titles

## Current Status
We've added default meta tags to `index.html`. This means:
- ✅ Shares will show "Arena for Creatives" branding
- ✅ Shows site description
- ❌ Won't show specific entry image/title
- ❌ All entries look the same when shared

## Recommendation
For soft launch, **keep current solution** (default meta tags).

After launch, if social sharing is important, implement **Solution 1 (Prerender.io)** - it's free, easy, and works perfectly.

## Testing
To test current setup:
1. Share any entry URL
2. Should show: "Arena for Creatives - Art Contests & Community"
3. Should show: Default OG image (if you add one to `/public/og-default.jpg`)

## Next Steps
1. Create a default OG image (`og-default.jpg` - 1200x630px)
2. Test sharing
3. After launch, consider Prerender.io for entry-specific previews
