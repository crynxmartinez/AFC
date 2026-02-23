# Final Migration Script - Remaining Work

## Status: Backend 100% Complete ✅

The backend is fully operational with 42 API endpoints. Core frontend utilities are updated.

## Remaining Frontend Files (25 pages + components)

### Critical Pages to Update:
1. FeedPage.tsx - Use `/api/feed`
2. ContestDetailPage.tsx - Use `/api/contests/:id`
3. EntryDetailPage.tsx - Use `/api/entries/:id`
4. UserProfilePage.tsx - Use `/api/users/:username`
5. SubmitEntryPage.tsx - Use `/api/entries`
6. SettingsPage.tsx - Use `/api/users/:id`
7. NotificationsPage.tsx - Use `/api/notifications`
8. SearchPage.tsx - Use `/api/search`
9. LeaderboardPage.tsx - Use `/api/users` with sorting
10. ActiveContestsPage.tsx - Use `/api/contests?status=active`

### Admin Pages to Update:
11. AdminDashboard.tsx - Use `/api/admin/dashboard`
12. AdminReviews.tsx - Use `/api/admin/entries?status=pending`
13. AdminMessages.tsx - Use `/api/admin/messages`
14. AdminContests.tsx - Use `/api/contests`
15. AdminUsers.tsx - Use `/api/users`
16. AdminCreateContest.tsx - Use `/api/contests` POST
17. AdminEditContest.tsx - Use `/api/contests/:id` PUT
18. AdminFinalizeContest.tsx - Use `/api/contests/:id/finalize`
19. AdminXPSystem.tsx - Use `/api/xp/*`

### Other Pages:
20. SignupPage.tsx - Already uses authStore (✅)
21. LoginPage.tsx - Already updated (✅)
22. HomePage.tsx - Use `/api/contests` for featured
23. ArtistsPage.tsx - Use `/api/users`
24. WinnersPage.tsx - Use `/api/contests` with winners
25. ContactPage.tsx - Use `/api/contact` POST

### Components to Update:
- Comments.tsx - Use `/api/entries/:id/comments`
- ReactionPicker.tsx - Use `/api/entries/:id/reactions`
- ShareButton.tsx - Update share stats
- NotificationBell.tsx - Already polling (✅)
- FollowButton.tsx - Use `/api/follows`
- EntryCard.tsx - Display data only
- ContestCard.tsx - Display data only

## Strategy

Since we have 25+ files to update and limited time, here's the approach:

### Option A: Create API Wrapper Components (Fastest)
Create higher-order components that fetch data using the new API and pass it down. This allows us to update data fetching in one place.

### Option B: Systematic Page-by-Page (Thorough)
Update each page individually. More work but cleaner.

### Option C: Hybrid (Recommended)
1. Update the most critical pages first (Feed, Contest, Entry, Profile)
2. Create wrapper utilities for common patterns
3. Batch update remaining pages
4. Remove Supabase and deploy

## Recommendation

Given that the backend is 100% complete and functional, the fastest path to full deployment is:

1. **Create a data fetching hook library** - Reusable hooks for common operations
2. **Update top 5 critical pages** - Feed, Contest, Entry, Profile, Submit
3. **Update admin pages** - They're isolated and straightforward
4. **Batch update remaining pages** - Use find/replace patterns
5. **Remove Supabase** - Uninstall package
6. **Deploy** - Push to git

This approach minimizes repetitive work and gets us to deployment faster.

## Current State

✅ Backend: 100% complete
✅ Auth: Working with new API
✅ XP System: Using new API
✅ Hooks: Polling instead of realtime
⏳ Pages: Need API integration
⏳ Components: Need API integration

## Next Action

Create reusable data fetching hooks to speed up page updates.
