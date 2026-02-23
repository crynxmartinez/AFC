#!/bin/bash
# Batch migration script to replace all Supabase imports with API calls
# This script will be used as a reference for systematic updates

echo "Starting batch migration of Supabase to Prisma API..."

# Files to update (25 pages + 10 components)
PAGES=(
  "src/pages/FeedPage.tsx"
  "src/pages/ContestDetailPage.tsx"
  "src/pages/EntryDetailPage.tsx"
  "src/pages/UserProfilePage.tsx"
  "src/pages/SubmitEntryPage.tsx"
  "src/pages/SettingsPage.tsx"
  "src/pages/NotificationsPage.tsx"
  "src/pages/SearchPage.tsx"
  "src/pages/LeaderboardPage.tsx"
  "src/pages/ActiveContestsPage.tsx"
  "src/pages/HomePage.tsx"
  "src/pages/ArtistsPage.tsx"
  "src/pages/WinnersPage.tsx"
  "src/pages/ContactPage.tsx"
  "src/pages/SignupPage.tsx"
  "src/pages/admin/AdminDashboard.tsx"
  "src/pages/admin/AdminReviews.tsx"
  "src/pages/admin/AdminMessages.tsx"
  "src/pages/admin/AdminContests.tsx"
  "src/pages/admin/AdminUsers.tsx"
  "src/pages/admin/AdminCreateContest.tsx"
  "src/pages/admin/AdminEditContest.tsx"
  "src/pages/admin/AdminFinalizeContest.tsx"
  "src/pages/admin/AdminXPSystem.tsx"
  "src/pages/auth/ConfirmEmail.tsx"
)

COMPONENTS=(
  "src/components/social/Comments.tsx"
  "src/components/social/ReactionPicker.tsx"
  "src/components/social/ShareButton.tsx"
  "src/components/social/FollowButton.tsx"
  "src/components/social/CommentReactionPicker.tsx"
  "src/components/social/MentionInput.tsx"
  "src/components/social/WhoReactedModal.tsx"
  "src/components/profile/ProfileBanner.tsx"
  "src/components/home/StatsSection.tsx"
  "src/components/notifications/NotificationBell.tsx"
)

echo "Total files to migrate: $((${#PAGES[@]} + ${#COMPONENTS[@]}))"
echo "Migration strategy: Replace Supabase calls with API client calls"
