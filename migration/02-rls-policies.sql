-- =====================================================
-- ARENA FOR CREATIVES - RLS POLICIES
-- Row Level Security policies for all tables
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- USERS TABLE POLICIES
-- =====================================================

-- Everyone can view user profiles
CREATE POLICY "Users are viewable by everyone"
  ON public.users FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

-- =====================================================
-- CONTESTS TABLE POLICIES
-- =====================================================

-- Everyone can view contests
CREATE POLICY "Contests are viewable by everyone"
  ON public.contests FOR SELECT
  USING (true);

-- Only admins can create contests (add admin check later)
CREATE POLICY "Authenticated users can create contests"
  ON public.contests FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Contest creators can update their contests
CREATE POLICY "Contest creators can update"
  ON public.contests FOR UPDATE
  USING (auth.uid() = created_by);

-- =====================================================
-- ENTRIES TABLE POLICIES
-- =====================================================

-- Everyone can view approved entries
CREATE POLICY "Approved entries are viewable by everyone"
  ON public.entries FOR SELECT
  USING (status = 'approved' OR auth.uid() = user_id);

-- Users can create their own entries
CREATE POLICY "Users can create own entries"
  ON public.entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own entries
CREATE POLICY "Users can update own entries"
  ON public.entries FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own entries
CREATE POLICY "Users can delete own entries"
  ON public.entries FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- VOTES TABLE POLICIES
-- =====================================================

-- Users can view all votes
CREATE POLICY "Votes are viewable by everyone"
  ON public.votes FOR SELECT
  USING (true);

-- Users can create their own votes
CREATE POLICY "Users can create own votes"
  ON public.votes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own votes
CREATE POLICY "Users can delete own votes"
  ON public.votes FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- COMMENTS TABLE POLICIES
-- =====================================================

-- Everyone can view comments
CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT
  USING (true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own comments
CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete own comments"
  ON public.comments FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- REACTIONS TABLE POLICIES
-- =====================================================

-- Everyone can view reactions
CREATE POLICY "Reactions are viewable by everyone"
  ON public.reactions FOR SELECT
  USING (true);

-- Users can create their own reactions
CREATE POLICY "Users can create own reactions"
  ON public.reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reactions
CREATE POLICY "Users can update own reactions"
  ON public.reactions FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own reactions
CREATE POLICY "Users can delete own reactions"
  ON public.reactions FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- SHARES TABLE POLICIES
-- =====================================================

-- Users can view all shares
CREATE POLICY "Shares are viewable by everyone"
  ON public.shares FOR SELECT
  USING (true);

-- Users can create their own shares
CREATE POLICY "Users can create own shares"
  ON public.shares FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- XP TRANSACTIONS TABLE POLICIES
-- =====================================================

-- Users can view their own XP transactions
CREATE POLICY "Users can view own XP transactions"
  ON public.xp_transactions FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert XP transactions (via service role)
CREATE POLICY "Service role can insert XP transactions"
  ON public.xp_transactions FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- ACHIEVEMENTS TABLE POLICIES
-- =====================================================

-- Everyone can view achievements
CREATE POLICY "Achievements are viewable by everyone"
  ON public.achievements FOR SELECT
  USING (true);

-- =====================================================
-- USER ACHIEVEMENTS TABLE POLICIES
-- =====================================================

-- Users can view all user achievements
CREATE POLICY "User achievements are viewable by everyone"
  ON public.user_achievements FOR SELECT
  USING (true);

-- System can insert user achievements (via service role)
CREATE POLICY "Service role can insert user achievements"
  ON public.user_achievements FOR INSERT
  WITH CHECK (true);

-- =====================================================
-- NOTIFICATIONS TABLE POLICIES
-- =====================================================

-- Users can view their own notifications
CREATE POLICY "Users can view own notifications"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert notifications (via service role)
CREATE POLICY "Service role can insert notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- USER STATS TABLE POLICIES
-- =====================================================

-- Users can view their own stats
CREATE POLICY "Users can view own stats"
  ON public.user_stats FOR SELECT
  USING (auth.uid() = user_id);

-- System can insert/update user stats (via service role)
CREATE POLICY "Service role can manage user stats"
  ON public.user_stats FOR ALL
  USING (true)
  WITH CHECK (true);

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- Note: Run these in Supabase Dashboard → Storage → Policies

-- Avatars bucket: Anyone can view, users can upload their own
-- CREATE POLICY "Avatar images are publicly accessible"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'avatars');

-- CREATE POLICY "Users can upload their own avatar"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Entries bucket: Anyone can view, users can upload their own
-- CREATE POLICY "Entry images are publicly accessible"
--   ON storage.objects FOR SELECT
--   USING (bucket_id = 'entries');

-- CREATE POLICY "Users can upload their own entries"
--   ON storage.objects FOR INSERT
--   WITH CHECK (bucket_id = 'entries' AND auth.uid()::text = (storage.foldername(name))[1]);

-- =====================================================
-- COMPLETED
-- =====================================================
-- Next: Run 03-functions.sql
