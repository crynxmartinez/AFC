# Complete Supabase Usage Audit

## Files Still Using Supabase (27 total)

### Pages (24 files)
1. `src/pages/FeedPage.tsx`
2. `src/pages/ContestDetailPage.tsx`
3. `src/pages/EntryDetailPage.tsx`
4. `src/pages/UserProfilePage.tsx`
5. `src/pages/SubmitEntryPage.tsx`
6. `src/pages/SettingsPage.tsx`
7. `src/pages/NotificationsPage.tsx`
8. `src/pages/SearchPage.tsx`
9. `src/pages/LeaderboardPage.tsx`
10. `src/pages/ActiveContestsPage.tsx`
11. `src/pages/HomePage.tsx`
12. `src/pages/ArtistsPage.tsx`
13. `src/pages/WinnersPage.tsx`
14. `src/pages/ContactPage.tsx`
15. `src/pages/auth/ConfirmEmail.tsx`
16. `src/pages/admin/AdminDashboard.tsx`
17. `src/pages/admin/AdminReviews.tsx`
18. `src/pages/admin/AdminMessages.tsx`
19. `src/pages/admin/AdminContests.tsx`
20. `src/pages/admin/AdminUsers.tsx`
21. `src/pages/admin/AdminCreateContest.tsx`
22. `src/pages/admin/AdminEditContest.tsx`
23. `src/pages/admin/AdminFinalizeContest.tsx`
24. `src/pages/admin/AdminXPSystem.tsx`

### Components (3 files)
1. `src/components/notifications/NotificationBell.tsx`
2. `src/components/profile/ProfileBanner.tsx`
3. `src/components/social/Comments.tsx`
4. `src/components/social/FollowButton.tsx`
5. `src/components/social/MentionInput.tsx`
6. `src/components/social/ReactionPicker.tsx`
7. `src/components/social/ShareButton.tsx`
8. `src/components/social/WhoReactedModal.tsx`
9. `src/components/social/CommentReactionPicker.tsx`

## Migration Strategy

### Batch 1: Core User-Facing Pages (Priority: HIGH)
- FeedPage.tsx
- ContestDetailPage.tsx
- EntryDetailPage.tsx
- UserProfilePage.tsx
- SubmitEntryPage.tsx

### Batch 2: Discovery & Navigation Pages (Priority: MEDIUM)
- SearchPage.tsx
- LeaderboardPage.tsx
- ActiveContestsPage.tsx
- HomePage.tsx
- ArtistsPage.tsx
- WinnersPage.tsx

### Batch 3: User Settings & Notifications (Priority: MEDIUM)
- SettingsPage.tsx
- NotificationsPage.tsx
- ContactPage.tsx
- ConfirmEmail.tsx

### Batch 4: Admin Pages (Priority: MEDIUM)
- AdminDashboard.tsx
- AdminReviews.tsx
- AdminMessages.tsx
- AdminContests.tsx
- AdminUsers.tsx
- AdminCreateContest.tsx
- AdminEditContest.tsx
- AdminFinalizeContest.tsx
- AdminXPSystem.tsx

### Batch 5: Social Components (Priority: HIGH - used across pages)
- Comments.tsx
- ReactionPicker.tsx
- FollowButton.tsx
- NotificationBell.tsx
- MentionInput.tsx
- ShareButton.tsx
- WhoReactedModal.tsx
- CommentReactionPicker.tsx
- ProfileBanner.tsx

## Next Steps
1. Analyze each file's Supabase usage patterns
2. Map Supabase queries to existing API endpoints
3. Migrate systematically batch by batch
4. Test each batch before moving to next
5. Remove Supabase package when all migrations complete
