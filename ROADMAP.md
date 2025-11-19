# 🗺️ AFC Development Roadmap

## 📅 5-Day Implementation Plan

---

## **PHASE 1: Followed Artists Feed** 🎨
**Timeline:** Day 1 (3-4 hours)  
**Priority:** HIGH ⭐

### Features:
- [ ] Create `/feed` page showing entries from followed artists
- [ ] Filter options: Latest, Most Popular, This Week
- [ ] Infinite scroll or pagination
- [ ] Empty state when not following anyone
- [ ] Quick follow/unfollow from feed

### Technical Tasks:
1. **Database Query:**
   - Join `follows` + `entries` tables
   - Filter by `following_id` where `follower_id = current_user`
   - Order by date or vote count

2. **Frontend:**
   - Create `FeedPage.tsx`
   - Add filter dropdown (Latest/Popular/Week)
   - Entry cards with artist info
   - Link to entry detail page

3. **Navigation:**
   - Add "Feed" to sidebar
   - Add icon badge if new entries available

**Files to Create:**
- `src/pages/FeedPage.tsx`

**Files to Modify:**
- `src/components/layout/Sidebar.tsx` (add Feed link)
- `src/App.tsx` (add route)

---

## **PHASE 2: Notification System Improvements** 🔔
**Timeline:** Day 1-2 (4-5 hours)  
**Priority:** HIGH

### Features:
- [ ] Mark individual notifications as read
- [ ] Mark all as read button
- [ ] Clear all notifications
- [ ] Filter by type (reactions, comments, follows)
- [ ] Follow notifications (when someone follows you)
- [ ] Notification settings per type

### Technical Tasks:
1. **Database:**
   - Add `read` column to notifications (already exists)
   - Create trigger for follow notifications
   - Add notification preferences to users table

2. **SQL Migration:**
   ```sql
   -- Add follow notification trigger
   CREATE OR REPLACE FUNCTION notify_on_follow()
   -- Add notification preferences columns
   ALTER TABLE users ADD COLUMN notify_follows BOOLEAN DEFAULT true
   ```

3. **Frontend:**
   - Update `NotificationBell.tsx`
   - Add filter tabs
   - Add mark as read functionality
   - Add clear all button
   - Create notification settings in SettingsPage

**Files to Create:**
- `add-follow-notifications.sql`

**Files to Modify:**
- `src/components/notifications/NotificationBell.tsx`
- `src/pages/SettingsPage.tsx`

---

## **PHASE 3: Leaderboard Enhancements** 🏆
**Timeline:** Day 2 (3-4 hours)  
**Priority:** HIGH

### Features:
- [ ] Time filters: All-Time, This Month, This Week
- [ ] Category tabs: Top Artists, Top Earners, Most Wins
- [ ] Show win rate percentage
- [ ] Show average votes per entry
- [ ] Show total prize money earned
- [ ] Podium display for top 3

### Technical Tasks:
1. **Database Queries:**
   - Aggregate prize_history by user
   - Calculate win rates (wins / total entries)
   - Calculate average reactions per entry
   - Filter by date ranges

2. **Frontend:**
   - Update `LeaderboardPage.tsx`
   - Add filter tabs
   - Add category switching
   - Enhanced stat cards
   - Podium component for top 3

**Files to Modify:**
- `src/pages/LeaderboardPage.tsx`

---

## **PHASE 4: Entry Submission Improvements** 📝
**Timeline:** Day 3 (4-5 hours)  
**Priority:** MEDIUM

### Features:
- [ ] Preview all 4 phases before submitting
- [ ] Edit/update entries (pending_review only)
- [ ] Save as draft functionality
- [ ] Progress indicator (1/4, 2/4, etc.)
- [ ] Validation messages
- [ ] Confirm before submit modal

### Technical Tasks:
1. **Database:**
   - Add `status = 'draft'` option
   - Allow updates to pending_review entries

2. **Frontend:**
   - Update `SubmitEntryPage.tsx`
   - Add preview modal
   - Add progress stepper
   - Add draft save button
   - Add edit functionality

**Files to Modify:**
- `src/pages/SubmitEntryPage.tsx`

**Files to Create:**
- `src/components/entry/EntryPreviewModal.tsx`
- `src/components/entry/ProgressStepper.tsx`

---

## **PHASE 5: Comment Enhancements** 💬
**Timeline:** Day 3-4 (4-5 hours)  
**Priority:** MEDIUM

### Features:
- [ ] Edit comments (within 5 minutes)
- [ ] Like/react to comments
- [ ] Sort comments (Newest, Oldest, Most Liked)
- [ ] Mention users (@username) with autocomplete
- [ ] Show edited indicator
- [ ] Pin comments (entry owner only)

### Technical Tasks:
1. **Database:**
   ```sql
   -- Add to entry_comments table
   ALTER TABLE entry_comments ADD COLUMN edited_at TIMESTAMPTZ;
   ALTER TABLE entry_comments ADD COLUMN likes_count INT DEFAULT 0;
   ALTER TABLE entry_comments ADD COLUMN is_pinned BOOLEAN DEFAULT false;
   
   -- Create comment_likes table
   CREATE TABLE comment_likes (
     user_id UUID REFERENCES users(id),
     comment_id UUID REFERENCES entry_comments(id),
     created_at TIMESTAMPTZ DEFAULT NOW(),
     PRIMARY KEY (user_id, comment_id)
   );
   ```

2. **Frontend:**
   - Update `Comments.tsx`
   - Add edit functionality
   - Add like button
   - Add sort dropdown
   - Add @mention autocomplete
   - Show "edited" badge

**Files to Create:**
- `add-comment-enhancements.sql`
- `src/components/social/MentionInput.tsx`

**Files to Modify:**
- `src/components/social/Comments.tsx`

---

## **PHASE 6: Profile Enhancements** 👤
**Timeline:** Day 4-5 (5-6 hours)  
**Priority:** MEDIUM

### Features:
- [ ] Cover photo upload
- [ ] Social links (Twitter, Instagram, Portfolio, etc.)
- [ ] Portfolio categories/tags
- [ ] Bio with rich text (bold, italic, links)
- [ ] Private profile toggle
- [ ] Show contests joined toggle

### Technical Tasks:
1. **Database:**
   ```sql
   -- Add to users table
   ALTER TABLE users ADD COLUMN cover_photo_url TEXT;
   ALTER TABLE users ADD COLUMN social_links JSONB DEFAULT '{}';
   ALTER TABLE users ADD COLUMN portfolio_tags TEXT[];
   ALTER TABLE users ADD COLUMN bio_html TEXT;
   ```

2. **Storage:**
   - Create `user-covers` bucket in Supabase
   - Set up upload policies

3. **Frontend:**
   - Update `UserProfilePage.tsx`
   - Update `SettingsPage.tsx`
   - Add cover photo upload
   - Add social links form
   - Add tag selector
   - Add rich text editor for bio

**Files to Create:**
   - `add-profile-enhancements.sql`
   - `src/components/profile/CoverPhotoUpload.tsx`
   - `src/components/profile/SocialLinksForm.tsx`
   - `src/components/profile/TagSelector.tsx`

**Files to Modify:**
- `src/pages/UserProfilePage.tsx`
- `src/pages/SettingsPage.tsx`

---

## 📊 Summary

### Time Estimates:
- **Phase 1:** 3-4 hours
- **Phase 2:** 4-5 hours  
- **Phase 3:** 3-4 hours
- **Phase 4:** 4-5 hours
- **Phase 5:** 4-5 hours
- **Phase 6:** 5-6 hours

**Total:** ~23-29 hours (5 working days)

### Database Changes Required:
- 3 new SQL migration files
- 2 new tables (comment_likes, drafts)
- 8 new columns across existing tables
- 2 new triggers
- 1 new storage bucket

### New Components:
- 8 new components
- 6 modified pages

---

## 🚀 Quick Start

To begin Phase 1:
```bash
# Start with Followed Artists Feed
npm run dev
```

Then work through each phase sequentially!

---

## 📝 Notes

- Each phase is independent and can be tested separately
- Database migrations should be run in order
- All features include proper error handling
- Mobile responsive design for all new components
- Follow existing code patterns and styling

---

**Ready to start Phase 1? Let me know!** 🎨
