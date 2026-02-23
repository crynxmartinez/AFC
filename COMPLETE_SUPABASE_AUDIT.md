# Complete Supabase Migration Audit
**Generated:** 2026-02-24 05:54 AM UTC+08:00

## Executive Summary
- **Total Files with Supabase:** 33 files
- **Total Supabase Queries:** 200+ individual queries
- **Pages:** 23 files
- **Components:** 10 files
- **Migration Status:** 1/34 complete (FeedPage.tsx only)

---

## PAGES WITH SUPABASE (23 files)

### 1. **ContestDetailPage.tsx** - CRITICAL
**Lines with Supabase:**
- Line 74: `supabase.from('contests').select('*').eq('id', id).single()`
- Line 91: `supabase.from('entries').select(...).eq('contest_id', id)`
- Line 102: `supabase.from('users').select(...).eq('id', entry.user_id)`
- Line 107: `supabase.from('reactions').select(...).eq('entry_id', entry.id)`
- Line 117: Sort entries by vote count (parameters need type)
- Line 129: `supabase.from('contest_winners').select(...).eq('contest_id', id)`
- Line 141-142: Realtime subscriptions for entries and reactions

**API Endpoints Needed:**
- ✅ GET `/contests/:id` (exists)
- ✅ GET `/contests/:id/entries` (exists)
- ✅ GET `/contests/:id/winners` (exists)
- Need: Realtime replacement (polling)

---

### 2. **EntryDetailPage.tsx** - CRITICAL
**Lines with Supabase:**
- Line 55: `supabase.from('entries').select(...).eq('id', id).single()`
- Line 67-70: Four realtime subscriptions (entries, reactions, comments, contest_winners)

**API Endpoints Needed:**
- ✅ GET `/entries/:id` (exists)
- ✅ GET `/entries/:id/reactions` (exists)
- ✅ GET `/entries/:id/comments` (exists)
- Need: Realtime replacement (polling)

---

### 3. **HomePage.tsx** - HIGH PRIORITY
**Lines with Supabase:**
- Line 37: `supabase.from('contests').select(...).in('status', ['active', 'voting'])`
- Line 48: `supabase.from('entries').select(...).eq('contest_id', contest.id)`

**API Endpoints Needed:**
- ✅ GET `/contests?status=active` (exists)
- ✅ GET `/contests/:id/entries` (exists)

---

### 4. **UserProfilePage.tsx** - CRITICAL (Most Complex)
**Lines with Supabase:**
- Line 100: `supabase.from('users').select('*').eq('username', username).single()`
- Line 110: `supabase.from('entries').select(...).eq('user_id', userData.id)`
- Line 123: `supabase.from('contests').select(...).eq('id', entry.contest_id)`
- Line 140: `supabase.from('reactions').select(...).eq('entry_id', entry.id)` (count)
- Line 146: `supabase.from('entries').select('id').eq('contest_id', entry.contest_id)`
- Line 156: `supabase.from('reactions').select(...).eq('entry_id', otherEntry.id)` (count)
- Line 178: `supabase.from('user_badges').select(...).eq('user_id', userData.id)`
- Line 188: `supabase.from('user_achievements').select(...).eq('user_id', userData.id)`
- Line 197: `supabase.from('contest_winners').select(...).eq('user_id', userData.id)`
- Line 208: `supabase.from('contests').select('title').eq('id', winner.contest_id)`
- Line 228: `supabase.from('reactions').select(...).eq('entry_id', entry.id)` (count)
- Line 237: `supabase.from('follows').select(...).eq('following_id', userData.id)` (count)
- Line 243: `supabase.from('follows').select(...).eq('follower_id', userData.id)` (count)

**API Endpoints Needed:**
- ✅ GET `/users/by-username/:username` (exists)
- ✅ GET `/users/:id/entries` (exists)
- ✅ GET `/users/:id/followers` (exists)
- ✅ GET `/users/:id/following` (exists)
- ❌ GET `/users/:id/badges` (MISSING)
- ❌ GET `/users/:id/achievements` (MISSING)
- ✅ GET `/contests/:id/winners` (exists)

---

### 5. **SubmitEntryPage.tsx** - CRITICAL (Has Storage)
**Lines with Supabase:**
- Line 49: `supabase.from('contests').select('*').eq('id', id).single()`
- Line 80: `supabase.from('entries').select('*').eq('contest_id', id).eq('user_id', user.id)`
- Line 155: `supabase.storage.from('entry-artworks').upload(fileName, phase.file)`
- Line 161: `supabase.storage.from('entry-artworks').getPublicUrl(fileName)`
- Line 198: `supabase.from('entries').update(draftData).eq('id', existingEntry.id)`
- Line 203: `supabase.from('entries').insert(draftData)`
- Line 273: `supabase.from('entries').update(entryData).eq('id', existingEntry.id)`
- Line 281: `supabase.from('entries').insert(entryData)`

**API Endpoints Needed:**
- ✅ GET `/contests/:id` (exists)
- ✅ POST `/entries` (exists)
- ✅ PUT `/entries/:id` (exists)
- ❌ File upload handling (CHANGED TO EXTERNAL URLS)

---

### 6. **SettingsPage.tsx** - HIGH PRIORITY (Has Storage + Auth)
**Lines with Supabase:**
- Line 89: `supabase.storage.from('user-avatars').upload(filePath, avatarFile)`
- Line 95: `supabase.storage.from('user-avatars').getPublicUrl(filePath)`
- Line 103: `supabase.from('users').update({...}).eq('id', user.id)`
- Line 146: `supabase.auth.updateUser({ password: newPassword })`
- Line 170: `supabase.from('users').update({ notify_reactions, notify_comments, ... })`

**API Endpoints Needed:**
- ✅ PUT `/users/:id` (exists)
- ✅ PUT `/users/avatar` (exists)
- ❌ PUT `/auth/password` (MISSING - password change)
- ❌ File upload (CHANGED TO EXTERNAL URLS)

---

### 7. **SearchPage.tsx**
**Lines with Supabase:**
- Line 35: `supabase.from('contests').select(...).ilike('title', `%${query}%`)`
- Line 42: `supabase.from('users').select(...).ilike('username', `%${query}%`)`
- Line 49: `supabase.from('entries').select(...).ilike('title', `%${query}%`)`

**API Endpoints Needed:**
- ✅ GET `/search?q=...&type=...` (exists)

---

### 8. **NotificationsPage.tsx**
**Lines with Supabase:**
- Line 26: `supabase.from('notifications').select(...).eq('user_id', user.id)`
- Line 48: `supabase.from('notifications').update({ read: true }).eq('id', id)`
- Line 56: `supabase.from('notifications').delete().eq('id', id)`
- Line 64: `supabase.from('notifications').update({ read: true }).eq('user_id', user.id)`
- Line 72: `supabase.from('notifications').delete().eq('user_id', user.id)`
- Line 80: Realtime subscription for notifications

**API Endpoints Needed:**
- ✅ GET `/notifications` (exists)
- ✅ PUT `/notifications/:id/read` (exists)
- ✅ DELETE `/notifications/:id` (exists)
- ✅ PUT `/notifications/read-all` (exists)
- ✅ DELETE `/notifications` (exists)

---

### 9. **LeaderboardPage.tsx**
**Lines with Supabase:**
- Line 37: `supabase.from('users').select(...).order('xp', { ascending: false })`

**API Endpoints Needed:**
- ❌ GET `/leaderboard` or `/users?sort=xp` (MISSING)

---

### 10. **ActiveContestsPage.tsx**
**Lines with Supabase:**
- Line 44: `supabase.from('contests').select('*').in('status', ['active', 'voting'])`
- Line 52: `supabase.from('entries').select(...).eq('contest_id', contest.id)`

**API Endpoints Needed:**
- ✅ GET `/contests?status=active` (exists)
- ✅ GET `/contests/:id/entries` (exists)

---

### 11. **ArtistsPage.tsx**
**Lines with Supabase:**
- Line 42: `supabase.from('users').select('*').order('xp', { ascending: false })`

**API Endpoints Needed:**
- ❌ GET `/users?sort=xp` (MISSING)

---

### 12. **WinnersPage.tsx**
**Lines with Supabase:**
- Line 48: `supabase.from('contests').select('*').lt('end_date', now)`
- Line 60: `supabase.from('entries').select(...).eq('contest_id', contest.id)`
- Line 74: `supabase.from('users').select(...).eq('id', entry.user_id).single()`
- Line 79: `supabase.from('reactions').select(...).eq('entry_id', entry.id)` (count)

**API Endpoints Needed:**
- ✅ GET `/contests/winners/recent` (exists)
- ✅ GET `/contests/:id/winners` (exists)

---

### 13. **ContactPage.tsx**
**Lines with Supabase:**
- Line 35: `supabase.from('contact_submissions').insert({...})`

**API Endpoints Needed:**
- ❌ POST `/contact` (MISSING)

---

### 14. **ConfirmEmail.tsx**
**Lines with Supabase:**
- Line 3: Import still exists (needs removal)
- No actual queries (already simplified)

---

### ADMIN PAGES (9 files)

### 15. **AdminDashboard.tsx**
**Lines with Supabase:**
- Line 30: `supabase.from('users').select('*', { count: 'exact', head: true })`
- Line 35: `supabase.from('contests').select('*', { count: 'exact', head: true })`
- Line 41: `supabase.from('entries').select('*').eq('status', 'pending')`
- Line 50: `supabase.from('contact_submissions').select('*').eq('status', 'pending')`

**API Endpoints Needed:**
- ❌ GET `/admin/stats` (MISSING)
- ✅ GET `/admin/entries/pending` (exists via reviews endpoint)
- ✅ GET `/admin/messages` (exists)

---

### 16. **AdminReviews.tsx**
**Lines with Supabase:**
- Line 27: `supabase.from('entries').select(...).eq('status', 'pending')`
- Line 46: `supabase.from('entries').update({ status: 'approved' }).eq('id', id)`
- Line 54: `supabase.from('entries').update({ status: 'rejected', ... }).eq('id', id)`

**API Endpoints Needed:**
- ✅ GET `/admin/entries/pending` (exists)
- ✅ PUT `/admin/entries/:id/review` (exists)

---

### 17. **AdminMessages.tsx**
**Lines with Supabase:**
- Line 35: `supabase.from('contact_submissions').select('*').order(...)`
- Line 55: `supabase.from('contact_submissions').update({ status: 'resolved' }).eq('id', id)`

**API Endpoints Needed:**
- ✅ GET `/admin/messages` (exists)
- ✅ PUT `/admin/messages/:id` (exists)

---

### 18. **AdminContests.tsx**
**Lines with Supabase:**
- Line 18: `supabase.from('contests').select('*').order('created_at', { ascending: false })`
- Line 28: `supabase.from('entries').select(...).eq('contest_id', contest.id)`
- Line 44: `supabase.from('contests').delete().eq('id', id)`

**API Endpoints Needed:**
- ✅ GET `/contests` (exists)
- ✅ GET `/contests/:id/entries` (exists)
- ✅ DELETE `/contests/:id` (exists)

---

### 19. **AdminUsers.tsx**
**Lines with Supabase:**
- Line 26: `supabase.from('users').select('*').order('created_at', { ascending: false })`
- Line 44: `supabase.from('users').update({ role: newRole }).eq('id', userId)`
- Line 52: `supabase.from('users').update({ banned: !user.banned }).eq('id', userId)`

**API Endpoints Needed:**
- ❌ GET `/admin/users` (MISSING)
- ❌ PUT `/admin/users/:id/role` (MISSING)
- ❌ PUT `/admin/users/:id/ban` (MISSING)

---

### 20. **AdminCreateContest.tsx**
**Lines with Supabase:**
- Line 80: `supabase.storage.from('contest-thumbnails').upload(...)`
- Line 86: `supabase.storage.from('contest-thumbnails').getPublicUrl(...)`
- Line 94: `supabase.storage.from('sponsor-logos').upload(...)`
- Line 100: `supabase.storage.from('sponsor-logos').getPublicUrl(...)`
- Line 107: `supabase.from('contests').insert({...})`

**API Endpoints Needed:**
- ✅ POST `/contests` (exists)
- ❌ File upload (CHANGED TO EXTERNAL URLS)

---

### 21. **AdminEditContest.tsx**
**Lines with Supabase:**
- Line 59: `supabase.from('contests').select('*').eq('id', id).single()`
- Line 118: `supabase.storage.from('contest-thumbnails').upload(...)`
- Line 124: `supabase.storage.from('contest-thumbnails').getPublicUrl(...)`
- Line 132: `supabase.storage.from('sponsor-logos').upload(...)`
- Line 138: `supabase.storage.from('sponsor-logos').getPublicUrl(...)`
- Line 145: `supabase.from('contests').update({...}).eq('id', id)`

**API Endpoints Needed:**
- ✅ GET `/contests/:id` (exists)
- ✅ PUT `/contests/:id` (exists)
- ❌ File upload (CHANGED TO EXTERNAL URLS)

---

### 22. **AdminFinalizeContest.tsx**
**Lines with Supabase:**
- Line 40: `supabase.from('contests').select('*').eq('id', id).single()`
- Line 50: `supabase.from('entries').select(...).eq('contest_id', id)`
- Line 62: `supabase.from('users').select(...).eq('id', entry.user_id).single()`
- Line 67: `supabase.from('reactions').select(...).eq('entry_id', entry.id)` (count)
- Line 96: `supabase.from('contests').update({ status: 'finalized', ... }).eq('id', id)`

**API Endpoints Needed:**
- ✅ GET `/contests/:id` (exists)
- ✅ POST `/contests/:id/finalize` (exists)

---

### 23. **AdminXPSystem.tsx**
**Lines with Supabase:**
- Line 34: `supabase.from('xp_rewards').select('*').order('action')`
- Line 42: `supabase.from('level_config').select('*').order('level')`
- Line 59: `supabase.from('xp_rewards').update({ xp_amount }).eq('action', action)`
- Line 67: `supabase.from('level_config').update({ xp_required }).eq('level', level)`

**API Endpoints Needed:**
- ❌ GET `/admin/xp/rewards` (MISSING)
- ❌ GET `/admin/xp/levels` (MISSING)
- ❌ PUT `/admin/xp/rewards/:action` (MISSING)
- ❌ PUT `/admin/xp/levels/:level` (MISSING)

---

## COMPONENTS WITH SUPABASE (10 files)

### 24. **Comments.tsx**
**Lines with Supabase:**
- Line 41: `supabase.from('entry_comments').select(...).eq('entry_id', entryId)`
- Line 56: `supabase.from('users').select(...).eq('id', comment.user_id).single()`
- Line 76: `supabase.from('entry_comments').insert({...})`
- Line 97: `supabase.from('entry_comments').update({ content }).eq('id', commentId)`
- Line 105: `supabase.from('entry_comments').delete().eq('id', commentId)`
- Line 113: `supabase.from('entry_comments').update({ pinned: true }).eq('id', commentId)`
- Line 121: Realtime subscription

**API Endpoints Needed:**
- ✅ GET `/entries/:id/comments` (exists)
- ✅ POST `/comments` (exists)
- ✅ PUT `/comments/:id` (exists)
- ✅ DELETE `/comments/:id` (exists)
- ✅ PUT `/comments/:id/pin` (exists)

---

### 25. **ReactionPicker.tsx**
**Lines with Supabase:**
- Line 37: `supabase.from('reactions').select('*').eq('entry_id', entryId)`
- Line 54: `supabase.from('reactions').select('*').eq('entry_id', entryId).eq('user_id', user.id)`
- Line 70: `supabase.from('reactions').delete().eq('id', existingReaction.id)`
- Line 77: `supabase.from('reactions').insert({...})`
- Line 84: `supabase.from('reactions').update({ type }).eq('id', existingReaction.id)`

**API Endpoints Needed:**
- ✅ GET `/entries/:id/reactions` (exists)
- ✅ POST `/reactions` (exists)
- ✅ PUT `/reactions/:id` (exists)
- ✅ DELETE `/reactions/:id` (exists)

---

### 26. **FollowButton.tsx**
**Lines with Supabase:**
- Line 25: `supabase.from('follows').select('*').eq('follower_id', user.id).eq('following_id', userId)`
- Line 41: `supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', userId)`
- Line 49: `supabase.from('follows').insert({...})`

**API Endpoints Needed:**
- ✅ GET `/users/:id/followers` (exists - can check if following)
- ✅ POST `/follows` (exists)
- ✅ DELETE `/follows/:id` (exists)

---

### 27. **NotificationBell.tsx**
**Lines with Supabase:**
- Line 28: `supabase.from('notifications').select(...).eq('user_id', user.id)`
- Line 48: `supabase.from('notifications').update({ read: true }).eq('id', id)`
- Line 56: `supabase.from('notifications').delete().eq('id', id)`
- Line 64: `supabase.from('notifications').update({ read: true }).eq('user_id', user.id)`
- Line 72: Realtime subscription

**API Endpoints Needed:**
- ✅ GET `/notifications` (exists)
- ✅ PUT `/notifications/:id/read` (exists)
- ✅ DELETE `/notifications/:id` (exists)
- ✅ PUT `/notifications/read-all` (exists)

---

### 28. **MentionInput.tsx**
**Lines with Supabase:**
- Line 52: `supabase.from('users').select('id, username, avatar_url').ilike('username', `${query}%`)`

**API Endpoints Needed:**
- ✅ GET `/search?q=...&type=users` (exists)

---

### 29. **ShareButton.tsx**
**Lines with Supabase:**
- Line 5: Import exists but no queries

---

### 30. **WhoReactedModal.tsx**
**Lines with Supabase:**
- Line 30: `supabase.from('reactions').select(...).eq('entry_id', entryId)`
- Line 42: `supabase.from('users').select(...).eq('id', reaction.user_id).single()`
- Line 53: `supabase.from('follows').select('*').eq('follower_id', user.id).eq('following_id', reaction.user_id)`

**API Endpoints Needed:**
- ✅ GET `/entries/:id/reactions` (exists)
- ✅ GET `/users/:id/followers` (exists)

---

### 31. **CommentReactionPicker.tsx**
**Lines with Supabase:**
- Line 38: `supabase.from('comment_reactions').select('*').eq('comment_id', commentId)`
- Line 55: `supabase.from('comment_reactions').select('*').eq('comment_id', commentId).eq('user_id', user.id)`
- Line 71: `supabase.from('comment_reactions').delete().eq('id', existingReaction.id)`
- Line 78: `supabase.from('comment_reactions').insert({...})`
- Line 85: `supabase.from('comment_reactions').update({ type }).eq('id', existingReaction.id)`

**API Endpoints Needed:**
- ❌ GET `/comments/:id/reactions` (MISSING)
- ❌ POST `/comment-reactions` (MISSING)
- ❌ PUT `/comment-reactions/:id` (MISSING)
- ❌ DELETE `/comment-reactions/:id` (MISSING)

---

### 32. **ProfileBanner.tsx**
**Lines with Supabase:**
- Line 35: `supabase.storage.from('user-covers').upload(...)`
- Line 41: `supabase.storage.from('user-covers').getPublicUrl(...)`
- Line 47: `supabase.from('users').update({ cover_photo_url }).eq('id', user.id)`
- Line 62: `supabase.from('users').update({ cover_photo_url: null }).eq('id', user.id)`

**API Endpoints Needed:**
- ✅ PUT `/users/cover-photo` (exists)
- ❌ File upload (CHANGED TO EXTERNAL URLS)

---

### 33. **StatsSection.tsx**
**Lines with Supabase:**
- Already fixed with hardcoded values

---

## MISSING API ENDPOINTS SUMMARY

### Critical Missing Endpoints:
1. ❌ `PUT /auth/password` - Password change
2. ❌ `POST /contact` - Contact form submissions
3. ❌ `GET /leaderboard` or `GET /users?sort=xp` - XP leaderboard
4. ❌ `GET /users?sort=xp` - Artists page sorting
5. ❌ `GET /users/:id/badges` - User badges
6. ❌ `GET /users/:id/achievements` - User achievements
7. ❌ `GET /admin/stats` - Admin dashboard statistics
8. ❌ `GET /admin/users` - List all users for admin
9. ❌ `PUT /admin/users/:id/role` - Change user role
10. ❌ `PUT /admin/users/:id/ban` - Ban/unban user
11. ❌ `GET /admin/xp/rewards` - XP reward configuration
12. ❌ `GET /admin/xp/levels` - Level configuration
13. ❌ `PUT /admin/xp/rewards/:action` - Update XP rewards
14. ❌ `PUT /admin/xp/levels/:level` - Update level requirements
15. ❌ `GET /comments/:id/reactions` - Comment reactions
16. ❌ `POST /comment-reactions` - Add comment reaction
17. ❌ `PUT /comment-reactions/:id` - Update comment reaction
18. ❌ `DELETE /comment-reactions/:id` - Delete comment reaction

### Storage/Upload Issues:
- All file uploads need to be changed to external URL inputs (Google Drive, etc.)
- Affected: SubmitEntryPage, SettingsPage, AdminCreateContest, AdminEditContest, ProfileBanner

### Realtime Subscriptions:
- Need to replace with polling (60-second intervals)
- Affected: ContestDetailPage, EntryDetailPage, NotificationsPage, NotificationBell, Comments

---

## MIGRATION STRATEGY

### Phase 1: Create Missing API Endpoints (18 endpoints)
1. Create all missing admin endpoints
2. Create user badge/achievement endpoints
3. Create comment reaction endpoints
4. Create contact form endpoint
5. Create leaderboard endpoints
6. Create password change endpoint

### Phase 2: Migrate Pages (23 files)
**Batch 1 - Core Pages (4 files):**
- HomePage.tsx
- ActiveContestsPage.tsx
- SearchPage.tsx
- LeaderboardPage.tsx

**Batch 2 - User Pages (5 files):**
- ContestDetailPage.tsx
- EntryDetailPage.tsx
- UserProfilePage.tsx
- SubmitEntryPage.tsx
- SettingsPage.tsx

**Batch 3 - Discovery Pages (5 files):**
- WinnersPage.tsx
- ArtistsPage.tsx
- NotificationsPage.tsx
- ContactPage.tsx
- ConfirmEmail.tsx (just remove import)

**Batch 4 - Admin Pages (9 files):**
- AdminDashboard.tsx
- AdminReviews.tsx
- AdminMessages.tsx
- AdminContests.tsx
- AdminUsers.tsx
- AdminCreateContest.tsx
- AdminEditContest.tsx
- AdminFinalizeContest.tsx
- AdminXPSystem.tsx

### Phase 3: Migrate Components (10 files)
- Comments.tsx
- ReactionPicker.tsx
- FollowButton.tsx
- NotificationBell.tsx
- MentionInput.tsx
- ShareButton.tsx
- WhoReactedModal.tsx
- CommentReactionPicker.tsx
- ProfileBanner.tsx
- StatsSection.tsx (already done)

### Phase 4: Replace File Uploads
- Change all file upload UI to URL input fields
- Update validation to accept external URLs
- Test with Google Drive, Imgur, etc.

### Phase 5: Replace Realtime with Polling
- Implement 60-second polling for notifications
- Implement polling for live updates on detail pages
- Remove all `.on('postgres_changes')` subscriptions

---

## ESTIMATED WORK

- **Missing API Endpoints:** 18 endpoints × 30 min = 9 hours
- **Page Migrations:** 23 files × 45 min = 17 hours
- **Component Migrations:** 10 files × 30 min = 5 hours
- **File Upload Changes:** 5 files × 20 min = 2 hours
- **Realtime to Polling:** 5 files × 20 min = 2 hours
- **Testing & Fixes:** 5 hours

**Total Estimated Time:** ~40 hours of work

---

## RECOMMENDATION

**Option A: Full Migration (Recommended)**
- Create all 18 missing endpoints
- Migrate all 33 files systematically
- Complete, production-ready solution
- Time: 40 hours

**Option B: Minimal Viable (Quick Fix)**
- Create only critical endpoints (8 endpoints)
- Migrate only user-facing pages (14 files)
- Disable admin features temporarily
- Time: 20 hours

**Option C: Hybrid Approach**
- Create critical endpoints first (8 endpoints)
- Migrate in priority order
- Deploy incrementally as batches complete
- Time: 30 hours spread over multiple sessions
