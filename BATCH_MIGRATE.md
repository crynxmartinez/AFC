# Batch Migration Plan - All 26 Remaining Files

## Strategy
Convert all Supabase queries to API calls systematically, file by file.

## Files to Migrate (26 total)

### High Priority Pages (4)
1. ContestDetailPage.tsx - Uses: contests, entries, contest_winners
2. EntryDetailPage.tsx - Uses: entries, reactions, comments, users
3. UserProfilePage.tsx - Uses: users, entries, follows, contest_winners
4. SubmitEntryPage.tsx - Uses: contests, entries

### Discovery Pages (6)
5. SearchPage.tsx - Uses: search queries
6. LeaderboardPage.tsx - Uses: users, xp rankings
7. ActiveContestsPage.tsx - Uses: contests
8. HomePage.tsx - Uses: contests, entries
9. ArtistsPage.tsx - Uses: users
10. WinnersPage.tsx - Uses: contest_winners

### User Settings (4)
11. SettingsPage.tsx - Uses: users
12. NotificationsPage.tsx - Uses: notifications
13. ContactPage.tsx - Uses: contact_submissions
14. ConfirmEmail.tsx - Uses: auth

### Admin Pages (9)
15. AdminDashboard.tsx - Uses: stats queries
16. AdminReviews.tsx - Uses: entries
17. AdminMessages.tsx - Uses: contact_submissions
18. AdminContests.tsx - Uses: contests
19. AdminUsers.tsx - Uses: users
20. AdminCreateContest.tsx - Uses: contests
21. AdminEditContest.tsx - Uses: contests
22. AdminFinalizeContest.tsx - Uses: contests, entries
23. AdminXPSystem.tsx - Uses: xp_rewards, level_config

### Components (9)
24. Comments.tsx - Uses: entry_comments
25. ReactionPicker.tsx - Uses: reactions
26. FollowButton.tsx - Uses: follows
27. NotificationBell.tsx - Uses: notifications
28. MentionInput.tsx - Uses: users
29. ShareButton.tsx - No Supabase
30. WhoReactedModal.tsx - Uses: reactions
31. CommentReactionPicker.tsx - Uses: comment_reactions
32. ProfileBanner.tsx - Uses: users

## Migration Pattern

For each file:
1. Replace `import { supabase } from '@/lib/supabase'` with API imports
2. Convert snake_case types to camelCase
3. Replace Supabase queries with API calls
4. Update property access from snake_case to camelCase
5. Test functionality

## API Endpoints Available
All 44 endpoints are ready and operational.
