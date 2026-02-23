# Migration Status - AFC Supabase → Prisma

## ✅ Phase 1: Infrastructure Setup (COMPLETED)

- ✅ Installed Prisma 7.4.1 with Accelerate extension
- ✅ Created complete Prisma schema (21 tables)
- ✅ Configured Vercel environment variables:
  - `DATABASE_URL` (Prisma Accelerate)
  - `DIRECT_DATABASE_URL` (Direct Postgres)
  - `NEXTAUTH_SECRET`
  - `NEXTAUTH_URL`
  - `VITE_API_URL`
- ✅ Created seed file for levels and XP rewards
- ✅ Added Prisma scripts to package.json

## ✅ Phase 2: Auth Migration (IN PROGRESS - 70% Complete)

### Completed:
- ✅ Installed auth dependencies (bcryptjs, jsonwebtoken, cookie)
- ✅ Created auth utility library (`api/lib/auth.ts`)
  - Password hashing/verification
  - JWT token generation/verification
  - Session cookie management
  - Auth middleware (requireAuth, requireAdmin)
- ✅ Created auth API endpoints:
  - `POST /api/auth/signup` - User registration with auto-login
  - `POST /api/auth/login` - Login with email or username
  - `POST /api/auth/logout` - Clear session
  - `GET /api/auth/session` - Get current user
- ✅ Created frontend API client (`src/lib/api.ts`)
  - Complete API wrapper for all endpoints
  - Automatic cookie handling
  - Error handling
- ✅ Updated `authStore.ts` to use new API instead of Supabase

### Remaining:
- ⏳ Test auth endpoints (need to generate Prisma Client first)
- ⏳ Update LoginPage.tsx (remove username→email lookup)
- ⏳ Update SignupPage.tsx (remove email verification resend)
- ⏳ Update SettingsPage.tsx (password change via API)

## ⏳ Phase 3: Database API Endpoints (0% Complete)

Need to create ~40 API endpoints:

### Users API (0/6)
- [ ] GET /api/users/:username - Get user profile
- [ ] PUT /api/users/:id - Update profile
- [ ] POST /api/users/avatar - Update avatar URL
- [ ] POST /api/users/cover-photo - Update cover photo URL
- [ ] GET /api/users/:id/entries - Get user entries
- [ ] GET /api/users/:id/stats - Get user stats

### Contests API (0/6)
- [ ] GET /api/contests - List contests
- [ ] GET /api/contests/:id - Get contest detail
- [ ] POST /api/contests - Create contest (admin)
- [ ] PUT /api/contests/:id - Update contest (admin)
- [ ] DELETE /api/contests/:id - Delete contest (admin)
- [ ] POST /api/contests/:id/finalize - Finalize contest (admin)

### Entries API (0/4)
- [ ] GET /api/entries/:id - Get entry detail
- [ ] POST /api/entries - Create/submit entry
- [ ] PUT /api/entries/:id - Update entry
- [ ] GET /api/contests/:id/entries - List contest entries

### Reactions API (0/3)
- [ ] GET /api/entries/:id/reactions - List reactions
- [ ] POST /api/entries/:id/reactions - Add reaction
- [ ] DELETE /api/entries/:id/reactions - Remove reaction

### Comments API (0/5)
- [ ] GET /api/entries/:id/comments - List comments
- [ ] POST /api/entries/:id/comments - Create comment
- [ ] PUT /api/comments/:id - Update comment
- [ ] DELETE /api/comments/:id - Delete comment
- [ ] PUT /api/comments/:id/pin - Pin/unpin comment

### Follows API (0/4)
- [ ] POST /api/follows - Follow user
- [ ] DELETE /api/follows/:id - Unfollow user
- [ ] GET /api/users/:id/followers - Get followers
- [ ] GET /api/users/:id/following - Get following

### Notifications API (0/5)
- [ ] GET /api/notifications - List notifications
- [ ] PUT /api/notifications/:id/read - Mark as read
- [ ] PUT /api/notifications/read-all - Mark all as read
- [ ] DELETE /api/notifications/:id - Delete notification
- [ ] DELETE /api/notifications - Clear all

### Feed & Search API (0/2)
- [ ] GET /api/feed - Get personalized feed
- [ ] GET /api/search - Search contests/users/entries

### XP API (0/1)
- [ ] GET /api/xp/progress/:userId - Get level progress

### Admin API (0/5)
- [ ] GET /api/admin/dashboard - Dashboard stats
- [ ] PUT /api/admin/entries/:id/review - Approve/reject entry
- [ ] GET /api/admin/messages - Contact messages
- [ ] PUT /api/admin/messages/:id - Update message status
- [ ] GET /api/admin/xp/* - XP system management

## ⏳ Phase 4: Business Logic Migration (0% Complete)

Need to reimplement RPC functions:
- [ ] `award_xp` → Prisma transaction
- [ ] `get_level_progress` → Prisma query
- [ ] `finalize_contest_and_select_winners` → Prisma transaction
- [ ] `update_user_share_stats` → Prisma update
- [ ] Trigger replacements (vote_count, comment_count, share_count)

## ⏳ Phase 5: Frontend Migration (0% Complete)

Replace all `supabase.from()` calls in:
- [ ] 25 pages
- [ ] 10 components
- [ ] 2 hooks
- [ ] 1 lib file (xp.ts)

## ⏳ Phase 6: Realtime Migration (0% Complete)

Replace Supabase Realtime with polling:
- [ ] NotificationBell.tsx - Poll every 30s
- [ ] useContactMessages.ts - Poll every 60s
- [ ] usePendingReviews.ts - Poll every 60s

## ⏳ Phase 7: Testing & Cleanup (0% Complete)

- [ ] Test all auth flows
- [ ] Test all CRUD operations
- [ ] Test XP system
- [ ] Test contest finalization
- [ ] Remove `@supabase/supabase-js` dependency
- [ ] Delete `src/lib/supabase.ts`
- [ ] Delete `src/types/database.ts`
- [ ] Update README.md

## 🚨 Critical Next Steps

1. **Generate Prisma Client** (fixes all lint errors):
   ```bash
   npm run prisma:generate
   ```

2. **Push schema to database**:
   ```bash
   npm run prisma:push
   ```

3. **Seed initial data**:
   ```bash
   npm run prisma:seed
   ```

4. **Test auth endpoints** - Create a simple test or use Prisma Studio

5. **Continue creating API endpoints** - Start with most-used endpoints (users, contests, entries)

## 📊 Overall Progress

- **Phase 1:** 100% ✅
- **Phase 2:** 70% 🟡
- **Phase 3:** 0% ⏳
- **Phase 4:** 0% ⏳
- **Phase 5:** 0% ⏳
- **Phase 6:** 0% ⏳
- **Phase 7:** 0% ⏳

**Total Migration:** ~15% Complete

## 🎯 Estimated Time Remaining

- Phase 2 completion: 2 hours
- Phase 3 (API endpoints): 8-12 hours
- Phase 4 (Business logic): 4-6 hours
- Phase 5 (Frontend): 6-8 hours
- Phase 6 (Realtime): 2 hours
- Phase 7 (Testing): 4 hours

**Total:** 26-34 hours remaining (~3-4 days)

## 📝 Important Notes

- **Lint errors are expected** until Prisma Client is generated
- **No Cloudinary needed** - Using external image URLs
- **Vercel environment is ready** - Can deploy anytime after Phase 2
- **Database is ready** - Just needs schema push and seed
