# AFC: Supabase → Prisma Migration Plan (UPDATED)

## 🎯 Major Simplification: External Image URLs

**DECISION:** Instead of migrating Supabase Storage to Cloudinary/S3, users will provide **image URLs from any source**:
- Google Drive
- Imgur
- Dropbox
- Any CDN or image hosting service
- Direct image URLs

This eliminates:
- ❌ File upload API endpoints
- ❌ Cloudinary/S3 integration
- ❌ Storage bucket migration
- ❌ File size validation
- ❌ Image processing

## Updated Architecture

```
Frontend (Vite + React + TypeScript)
    ↓ HTTP API calls (fetch/axios)
Backend API Layer (Vercel Serverless Functions)
    ↓
Prisma ORM → PostgreSQL (Prisma Accelerate)
NextAuth.js → Session/JWT management
External URLs → User-provided image links
```

## Database Schema Changes

All image URL fields remain as `String?` - no changes needed:
- `users.avatar_url` - User avatar (any image URL)
- `users.cover_photo_url` - Profile cover (any image URL)
- `entries.phase_1_url` through `phase_4_url` - Contest entry phases (any image URLs)
- `contests.thumbnail_url` - Contest thumbnail (any image URL)
- `contests.sponsor_logo_url` - Sponsor logo (any image URL)

## Updated Migration Phases

### Phase 1: Infrastructure Setup ✅ COMPLETED
- ✅ PostgreSQL database (Prisma Accelerate)
- ✅ Prisma 7 installed
- ✅ Schema created
- ✅ Vercel environment variables configured

### Phase 2: Auth Migration (Next)
1. Create auth API routes (signup, login, logout, session)
2. Replace `authStore.ts` Supabase calls with API calls
3. Update login/signup pages
4. Email verification (optional for MVP)

### Phase 3: Database Query Migration
Create ~40 API endpoints to replace `supabase.from()` calls:
- User CRUD
- Contest CRUD
- Entry CRUD (with URL validation)
- Reactions, Comments, Follows
- Notifications
- Feed, Search, Leaderboard

### Phase 4: Business Logic Migration
Reimplement RPC functions as API logic:
- `award_xp` → Prisma transaction
- `get_level_progress` → Prisma query
- `finalize_contest_and_select_winners` → Prisma transaction
- Trigger replacements (vote_count, comment_count updates)

### Phase 5: Realtime Migration
Replace Supabase Realtime with polling (simplest):
- Notifications: Poll every 30 seconds
- Admin reviews: Poll every 60 seconds
- Contact messages: Poll every 60 seconds

### Phase 6: Testing & Cleanup
- Test all features
- Remove Supabase dependencies
- Update documentation

## Updated API Endpoints

### Image URL Endpoints (Simplified)

Instead of upload endpoints, we just validate and save URLs:

```typescript
// POST /api/users/avatar
{
  "avatarUrl": "https://drive.google.com/uc?id=xxx"
}

// POST /api/users/cover-photo
{
  "coverPhotoUrl": "https://i.imgur.com/xxx.jpg"
}

// POST /api/entries (create/update)
{
  "phase1Url": "https://example.com/image1.jpg",
  "phase2Url": "https://example.com/image2.jpg",
  "phase3Url": "https://example.com/image3.jpg",
  "phase4Url": "https://example.com/image4.jpg"
}
```

### URL Validation

Simple validation in API:
```typescript
function isValidImageUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'http:' || parsed.protocol === 'https:'
  } catch {
    return false
  }
}
```

## Frontend Changes

### Settings Page (Avatar/Cover Photo)
**Before:**
```typescript
// Upload file to Supabase Storage
const { data, error } = await supabase.storage
  .from('user-avatars')
  .upload(filePath, file)
```

**After:**
```typescript
// User provides URL
<input 
  type="url" 
  placeholder="https://your-image-url.com/avatar.jpg"
  onChange={(e) => setAvatarUrl(e.target.value)}
/>

// Save URL via API
await fetch('/api/users/avatar', {
  method: 'POST',
  body: JSON.stringify({ avatarUrl })
})
```

### Submit Entry Page
**Before:**
```typescript
// Upload 4 phase images to Supabase Storage
for (let i = 1; i <= 4; i++) {
  const { data } = await supabase.storage
    .from('entry-artworks')
    .upload(path, file)
}
```

**After:**
```typescript
// User provides 4 image URLs
<input type="url" placeholder="Phase 1 image URL" />
<input type="url" placeholder="Phase 2 image URL" />
<input type="url" placeholder="Phase 3 image URL" />
<input type="url" placeholder="Phase 4 image URL" />

// Save URLs via API
await fetch('/api/entries', {
  method: 'POST',
  body: JSON.stringify({
    phase1Url,
    phase2Url,
    phase3Url,
    phase4Url
  })
})
```

## Removed from Migration

### ❌ No Longer Needed:
- Cloudinary integration
- AWS S3 setup
- File upload endpoints
- Image processing/resizing
- Storage bucket migration
- File size limits
- MIME type validation
- Upload progress tracking

### ✅ Benefits:
- **Simpler migration** - 30% less work
- **No storage costs** - Users host their own images
- **Faster development** - Skip entire storage layer
- **More flexible** - Users can use any image host they prefer
- **No file size limits** - Not our problem anymore

## Updated Environment Variables

### Removed:
- ~~`CLOUDINARY_CLOUD_NAME`~~
- ~~`CLOUDINARY_API_KEY`~~
- ~~`CLOUDINARY_API_SECRET`~~

### Still Needed:
- ✅ `DATABASE_URL` (Prisma Accelerate)
- ✅ `DIRECT_DATABASE_URL` (Direct Postgres)
- ✅ `NEXTAUTH_SECRET`
- ✅ `NEXTAUTH_URL`
- ✅ `VITE_API_URL`
- `EMAIL_SERVER` (optional)
- `EMAIL_FROM` (optional)

## User Experience Changes

### For Artists:
1. Upload image to their preferred service (Google Drive, Imgur, etc.)
2. Get shareable link
3. Paste link into AFC
4. Done!

### Supported Image Sources:
- Google Drive (public links)
- Imgur
- Dropbox (public links)
- GitHub (raw URLs)
- Any CDN
- Direct image URLs

### Image URL Requirements:
- Must be publicly accessible
- Must be direct image link (ends in .jpg, .png, .gif, .webp, etc.)
- HTTPS preferred (but HTTP allowed)

## Migration Effort Reduction

**Original Estimate:** 5-7 days
**Updated Estimate:** 3-5 days

**Time Saved:**
- Storage setup: -4 hours
- Upload endpoints: -6 hours
- File validation: -2 hours
- Storage migration: -4 hours
- Testing uploads: -2 hours

**Total Saved:** ~18 hours (1 full day of work)

## Next Immediate Steps

1. ✅ Prisma environment configured
2. ⏳ Create first API endpoint (auth/signup)
3. ⏳ Test Prisma connection
4. ⏳ Update one page to use new API
5. ⏳ Gradually migrate remaining pages

## Risk Assessment Update

### Reduced Risks:
- ~~Storage URL migration~~ - Not needed
- ~~Image upload failures~~ - Not our problem
- ~~Storage costs~~ - Zero

### New Considerations:
- **Broken image links** - Users responsible for keeping links alive
- **CORS issues** - Some image hosts may block embedding
- **Privacy** - Users need to understand images are public

### Mitigation:
- Add image URL preview before saving
- Validate URLs are accessible
- Show warning about public image requirements
- Provide recommended image hosting services in UI
