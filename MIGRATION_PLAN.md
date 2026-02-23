# AFC: Supabase → Prisma Full Migration Plan

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [Current Architecture](#2-current-architecture)
3. [Target Architecture](#3-target-architecture)
4. [Complete Supabase Dependency Audit](#4-complete-supabase-dependency-audit)
5. [Prisma Schema Design](#5-prisma-schema-design)
6. [Migration Phases](#6-migration-phases)
7. [File-by-File Migration Map](#7-file-by-file-migration-map)
8. [Risk Assessment & Mitigation](#8-risk-assessment--mitigation)

---

## 1. Executive Summary

**Goal:** Replace Supabase entirely (Database, Auth, Storage, Realtime) with Prisma ORM + NextAuth.js + Cloudinary/S3 + WebSockets.

**Prisma Version:** Prisma 7 (latest stable as of 2025)

**Scope:** 33 pages, ~15 components with Supabase, 2 stores, 2 hooks, 2 lib files, 7 SQL migration files, 1 types file.

**Estimated Effort:** 5-7 days for experienced developer

**Critical Decision Required:**
- This is a **Vite + React SPA** (no Next.js). To use Prisma, you need a **backend API layer** since Prisma cannot run in the browser.
- **Option A:** Add a backend (Express/Fastify API routes) — deploy separately or as serverless functions on Vercel
- **Option B:** Migrate to Next.js (App Router) — Prisma runs in Server Components/API routes natively
- **Option C:** Use Vercel Serverless Functions (`/api` directory) with the current Vite setup

---

## 2. Current Architecture

```
Frontend (Vite + React + TypeScript)
    ↓ Direct client-side calls
Supabase (PostgreSQL + Auth + Storage + Realtime)
```

### Current Tech Stack
- **Frontend:** React 18, Vite, TypeScript, TailwindCSS, Zustand
- **Database:** Supabase PostgreSQL (via `@supabase/supabase-js`)
- **Auth:** Supabase Auth (email/password, email verification, password reset)
- **Storage:** Supabase Storage (avatars, entries, contests, cover-photos, sponsor-logos)
- **Realtime:** Supabase Realtime (postgres_changes on notifications, entries, contact_submissions)
- **RPC Functions:** 5+ PostgreSQL functions called via `supabase.rpc()`
- **RLS:** Extensive Row Level Security policies
- **Deployment:** Vercel

---

## 3. Target Architecture

```
Frontend (Vite + React + TypeScript)
    ↓ HTTP API calls (fetch/axios)
Backend API Layer (Vercel Serverless Functions or Express)
    ↓
Prisma ORM → PostgreSQL (Neon/Supabase DB/Railway)
NextAuth.js or Lucia Auth → Session/JWT management
Cloudinary/S3 → File storage
Socket.io or Pusher → Realtime (optional)
```

### Target Tech Stack
- **ORM:** Prisma 7
- **Database:** PostgreSQL (Neon, Railway, or keep Supabase DB)
- **Auth:** NextAuth.js v5 (Auth.js) with Credentials provider, or Lucia Auth
- **Storage:** Cloudinary (recommended for images) or AWS S3
- **Realtime:** Pusher, Ably, or Socket.io (or polling as simpler alternative)
- **API Layer:** Vercel Serverless Functions (`/api` directory)

---

## 4. Complete Supabase Dependency Audit

### 4.1 Supabase Client Initialization
| File | Usage |
|------|-------|
| `src/lib/supabase.ts` | Creates Supabase client with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` |

### 4.2 Supabase Auth Usage (8 locations)
| File | Auth Methods Used |
|------|-------------------|
| `src/stores/authStore.ts` | `supabase.auth.signUp()`, `supabase.auth.signInWithPassword()`, `supabase.auth.signOut()`, `supabase.auth.getSession()`, `supabase.auth.onAuthStateChange()` |
| `src/pages/SignupPage.tsx` | `supabase.auth.resend()` (email verification resend) |
| `src/pages/LoginPage.tsx` | `supabase.from('users').select('email').eq('username', ...)` (username→email lookup for login) |
| `src/pages/SettingsPage.tsx` | `supabase.auth.updateUser({ password })` (password change) |
| `src/pages/auth/ConfirmEmail.tsx` | `supabase.auth.verifyOtp()` (email verification) |

### 4.3 Supabase RPC Calls (6 functions)
| RPC Function | Called From | Purpose |
|-------------|-------------|---------|
| `create_user_profile` | `authStore.ts` | Creates user profile on signup |
| `award_xp` | `src/lib/xp.ts`, `ShareButton.tsx`, `SubmitEntryPage.tsx` | Awards XP for actions |
| `get_level_progress` | `src/lib/xp.ts` | Gets user level/XP progress |
| `update_user_share_stats` | `ShareButton.tsx` | Updates share statistics |
| `finalize_contest_and_select_winners` | `AdminFinalizeContest.tsx` | Finalizes contest, distributes prizes |
| `get_level_distribution` | `AdminXPSystem.tsx` | Gets level distribution stats |

### 4.4 Supabase Storage Usage (6 buckets)
| Bucket | Used In | Purpose |
|--------|---------|---------|
| `user-avatars` | `SettingsPage.tsx` | User profile pictures |
| `cover-photos` | `ProfileBanner.tsx` | User cover photos |
| `entry-artworks` | `SubmitEntryPage.tsx` | Contest entry images (4 phases) |
| `contest-thumbnails` | `AdminCreateContest.tsx`, `AdminEditContest.tsx` | Contest thumbnail images |
| `sponsor-logos` | `AdminCreateContest.tsx`, `AdminEditContest.tsx` | Sponsor logo images |
| `avatars`, `entries`, `contests`, `cover-photos` | `01-schema.sql` | Defined in migration (some overlap) |

### 4.5 Supabase Realtime Usage (3 channels)
| Channel | File | Table Watched | Events |
|---------|------|---------------|--------|
| `notifications` | `NotificationBell.tsx` | `notifications` | INSERT (filtered by user_id) |
| `pending-reviews` | `usePendingReviews.ts` | `entries` | * (all events) |
| `contact-messages` | `useContactMessages.ts` | `contact_submissions` | * (all events) |

### 4.6 Supabase Database Queries — Complete File List

#### **Pages with Supabase queries (25 of 33 pages):**
| Page | Tables Queried | Operations |
|------|---------------|------------|
| `LoginPage.tsx` | `users` | SELECT (username→email lookup) |
| `SignupPage.tsx` | — | Auth only (resend verification) |
| `FeedPage.tsx` | `follows`, `contests`, `entries`, `users`, `reactions`, `entry_comments`, `contest_winners` | SELECT, complex joins |
| `SubmitEntryPage.tsx` | `contests`, `entries` | SELECT, INSERT, UPDATE + Storage upload |
| `EntryDetailPage.tsx` | `entries`, `users`, `contests`, `reactions`, `comments` | SELECT with counts |
| `ContestDetailPage.tsx` | `contests`, `entries`, `users`, `reactions`, `contest_winners` | SELECT with counts |
| `UserProfilePage.tsx` | `users`, `entries`, `contests`, `reactions`, `user_badges`, `user_achievements`, `contest_winners`, `follows` | SELECT (heaviest page — N+1 queries) |
| `SettingsPage.tsx` | `users` | SELECT, UPDATE + Storage upload + Auth password change |
| `ActiveContestsPage.tsx` | `contests`, `entries` | SELECT with counts |
| `ArtistsPage.tsx` | `users`, `entries` | SELECT with counts |
| `ContactPage.tsx` | `contact_submissions` | INSERT |
| `LeaderboardPage.tsx` | `users`, `entries`, `reactions`, `contest_winners` | SELECT (heavy N+1) |
| `SearchPage.tsx` | `contests`, `users`, `entries` | SELECT with ilike search |
| `WinnersPage.tsx` | `contests`, `entries`, `users`, `reactions` | SELECT with counts |
| `NotificationsPage.tsx` | `notifications` | SELECT, UPDATE |
| `PointsPage.tsx` | — | No Supabase (static page) |
| `ProfilePage.tsx` | — | Redirect only |
| `HomePage.tsx` | — | Uses StatsSection component |
| **Admin Pages:** | | |
| `AdminDashboard.tsx` | `users`, `contests`, `entries` | SELECT with counts |
| `AdminContests.tsx` | `contests`, `entries` | SELECT, DELETE, UPDATE |
| `AdminCreateContest.tsx` | `contests` | INSERT + Storage upload |
| `AdminEditContest.tsx` | `contests` | SELECT, UPDATE + Storage upload |
| `AdminReviews.tsx` | `entries`, `users`, `contests` | SELECT, UPDATE |
| `AdminFinalizeContest.tsx` | `contests`, `entries`, `users`, `reactions` | SELECT + RPC call |
| `AdminUsers.tsx` | `users` | SELECT, UPDATE |
| `AdminMessages.tsx` | `contact_submissions` | SELECT, UPDATE |
| `AdminXPSystem.tsx` | `level_config`, `xp_rewards`, `level_rewards`, `users` | SELECT, UPDATE + RPC |
| `auth/ConfirmEmail.tsx` | — | Auth only (verifyOtp) |

#### **Components with Supabase queries (7 components):**
| Component | Tables Queried | Operations |
|-----------|---------------|------------|
| `social/Comments.tsx` | `entry_comments`, `users`, `comment_reactions` | SELECT, INSERT, UPDATE, DELETE |
| `social/ReactionPicker.tsx` | `reactions`, `entries`, `users`, `notifications` | SELECT, INSERT, UPDATE, DELETE |
| `social/ShareButton.tsx` | `shares`, `daily_xp_claims` | SELECT, INSERT + RPC calls |
| `social/FollowButton.tsx` | `follows` | SELECT, INSERT, DELETE |
| `social/WhoReactedModal.tsx` | `reactions`, `follows` | SELECT, INSERT, DELETE |
| `social/CommentReactionPicker.tsx` | `comment_reactions` | INSERT, DELETE |
| `social/MentionInput.tsx` | `users` | SELECT (username search) |
| `notifications/NotificationBell.tsx` | `notifications`, `users` | SELECT, UPDATE, DELETE + Realtime |
| `profile/ProfileBanner.tsx` | `users` | UPDATE + Storage upload/delete |
| `home/StatsSection.tsx` | `users`, `contests`, `entries`, `contest_winners` | SELECT with counts |

#### **Lib/Hooks with Supabase:**
| File | Usage |
|------|-------|
| `src/lib/xp.ts` | RPC calls (`award_xp`, `get_level_progress`), table queries (`user_badges`, `xp_history`) |
| `src/hooks/useContactMessages.ts` | SELECT + Realtime subscription |
| `src/hooks/usePendingReviews.ts` | SELECT + Realtime subscription |

#### **Files WITHOUT Supabase (no changes needed):**
- `src/lib/utils.ts` — Pure utility functions
- `src/stores/toastStore.ts` — Toast notification state only
- `src/pages/PointsPage.tsx` — Static page
- `src/pages/ProfilePage.tsx` — Redirect only
- `src/pages/AboutPage.tsx` — Static content
- `src/pages/PrivacyPolicyPage.tsx` — Static content
- `src/pages/TermsOfServicePage.tsx` — Static content
- `src/pages/CopyrightPolicyPage.tsx` — Static content
- `src/pages/DMCAPage.tsx` — Static content
- `src/types/contest.ts` — Type definitions
- `src/constants/phases.ts` — Phase configuration constants
- All layout components, UI components without data fetching

### 4.7 Database Tables (from SQL migrations)
| Table | Key Relationships |
|-------|-------------------|
| `users` | PK: id (UUID, references auth.users) |
| `contests` | PK: id, FK: created_by → users |
| `entries` | PK: id, FK: user_id → users, contest_id → contests |
| `votes` | FK: user_id → users, entry_id → entries |
| `entry_comments` | FK: user_id → users, entry_id → entries, parent_comment_id → self |
| `reactions` | FK: user_id → users, entry_id → entries |
| `comment_reactions` | FK: user_id → users, comment_id → entry_comments |
| `shares` | FK: user_id → users, entry_id → entries |
| `follows` | FK: follower_id → users, following_id → users |
| `notifications` | FK: user_id → users, actor_id → users |
| `xp_transactions` | FK: user_id → users |
| `achievements` | PK: id |
| `user_achievements` | FK: user_id → users, achievement_id → achievements |
| `user_stats` | FK: user_id → users |
| `user_badges` | FK: user_id → users |
| `level_config` | PK: level |
| `xp_rewards` | PK: id |
| `level_rewards` | PK: id |
| `contest_winners` | FK: contest_id → contests, user_id → users, entry_id → entries |
| `contact_submissions` | FK: user_id → users (nullable) |
| `daily_xp_claims` | FK: user_id → users |

### 4.8 Database Triggers (from 04-triggers.sql)
| Trigger | Event | Function Called |
|---------|-------|-----------------|
| `trigger_increment_vote_count` | AFTER INSERT ON votes | `increment_entry_vote_count()` |
| `trigger_decrement_vote_count` | AFTER DELETE ON votes | `decrement_entry_vote_count()` |
| `trigger_increment_comment_count` | AFTER INSERT ON entry_comments | `increment_entry_comment_count()` |
| `trigger_decrement_comment_count` | AFTER DELETE ON entry_comments | `decrement_entry_comment_count()` |
| `trigger_increment_share_count` | AFTER INSERT ON shares | `increment_entry_share_count()` |
| `trigger_update_user_activity` | AFTER INSERT ON entries | `update_user_activity()` |

### 4.9 Environment Variables to Change
| Current | New |
|---------|-----|
| `VITE_SUPABASE_URL` | `DATABASE_URL` (Prisma connection string) |
| `VITE_SUPABASE_ANON_KEY` | `NEXTAUTH_SECRET`, `NEXTAUTH_URL` |
| — | `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` |
| — | `VITE_API_URL` (your API base URL) |

---

## 5. Prisma Schema Design

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id                  String   @id @default(uuid())
  email               String   @unique
  username            String   @unique
  passwordHash        String   @map("password_hash")
  role                String   @default("user")
  displayName         String?  @map("display_name")
  avatarUrl           String?  @map("avatar_url")
  coverPhotoUrl       String?  @map("cover_photo_url")
  bio                 String?
  profileTitle        String?  @map("profile_title")
  pointsBalance       Int      @default(100) @map("points_balance")
  totalSpent          Int      @default(0) @map("total_spent")
  xp                  Int      @default(0)
  level               Int      @default(1)
  totalXp             Int      @default(0) @map("total_xp")
  instagramUrl        String?  @map("instagram_url")
  twitterUrl          String?  @map("twitter_url")
  portfolioUrl        String?  @map("portfolio_url")
  website             String?
  location            String?
  skills              String[] @default([])
  specialties         String[] @default([])
  yearsExperience     Int?     @map("years_experience")
  availableForWork    Boolean  @default(false) @map("available_for_work")
  profileVisibility   String   @default("public") @map("profile_visibility")
  notifyReactions     Boolean  @default(true) @map("notify_reactions")
  notifyComments      Boolean  @default(true) @map("notify_comments")
  notifyArtistContests Boolean @default(true) @map("notify_artist_contests")
  notifyFollows       Boolean  @default(true) @map("notify_follows")
  showContestsJoined  Boolean  @default(true) @map("show_contests_joined")
  showContestsWon     Boolean  @default(true) @map("show_contests_won")
  lastActiveAt        DateTime? @map("last_active_at")
  emailVerified       Boolean  @default(false) @map("email_verified")
  createdAt           DateTime @default(now()) @map("created_at")
  updatedAt           DateTime @updatedAt @map("updated_at")

  // Relations
  entries             Entry[]
  contestsCreated     Contest[]        @relation("ContestCreator")
  votes               Vote[]
  comments            EntryComment[]
  reactions           Reaction[]
  commentReactions    CommentReaction[]
  shares              Share[]
  followers           Follow[]         @relation("Following")
  following           Follow[]         @relation("Follower")
  notifications       Notification[]   @relation("NotificationRecipient")
  actorNotifications  Notification[]   @relation("NotificationActor")
  xpTransactions      XpTransaction[]
  userAchievements    UserAchievement[]
  userBadges          UserBadge[]
  userStats           UserStats?
  contestWins         ContestWinner[]
  contactSubmissions  ContactSubmission[]
  dailyXpClaims       DailyXpClaim[]

  @@map("users")
}

model Contest {
  id                   String   @id @default(uuid())
  title                String
  description          String
  category             String   @default("art")
  status               String   @default("draft")
  startDate            DateTime @map("start_date")
  endDate              DateTime @map("end_date")
  thumbnailUrl         String?  @map("thumbnail_url")
  createdById          String   @map("created_by")
  prizePool            Int      @default(0) @map("prize_pool")
  prizePoolDistributed Boolean  @default(false) @map("prize_pool_distributed")
  finalizedAt          DateTime? @map("finalized_at")
  hasSponsor           Boolean  @default(false) @map("has_sponsor")
  sponsorName          String?  @map("sponsor_name")
  sponsorLogoUrl       String?  @map("sponsor_logo_url")
  sponsorPrizeAmount   Float?   @map("sponsor_prize_amount")
  createdAt            DateTime @default(now()) @map("created_at")
  updatedAt            DateTime @updatedAt @map("updated_at")

  // Relations
  createdBy            User     @relation("ContestCreator", fields: [createdById], references: [id])
  entries              Entry[]
  winners              ContestWinner[]

  @@map("contests")
}

model Entry {
  id                String    @id @default(uuid())
  userId            String    @map("user_id")
  contestId         String    @map("contest_id")
  title             String?
  description       String?
  phase1Url         String?   @map("phase_1_url")
  phase2Url         String?   @map("phase_2_url")
  phase3Url         String?   @map("phase_3_url")
  phase4Url         String?   @map("phase_4_url")
  status            String    @default("draft")
  voteCount         Int       @default(0) @map("vote_count")
  commentCount      Int       @default(0) @map("comment_count")
  shareCount        Int       @default(0) @map("share_count")
  finalRank         Int?      @map("final_rank")
  submittedAt       DateTime? @map("submitted_at")
  approvedAt        DateTime? @map("approved_at")
  rejectionReason   String?   @map("rejection_reason")
  lastActivityAt    DateTime  @default(now()) @map("last_activity_at")
  createdAt         DateTime  @default(now()) @map("created_at")
  updatedAt         DateTime  @updatedAt @map("updated_at")

  // Relations
  user              User      @relation(fields: [userId], references: [id])
  contest           Contest   @relation(fields: [contestId], references: [id])
  votes             Vote[]
  comments          EntryComment[]
  reactions         Reaction[]
  shares            Share[]
  contestWin        ContestWinner?

  @@unique([userId, contestId])
  @@map("entries")
}

model Vote {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  entryId   String   @map("entry_id")
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id])
  entry     Entry    @relation(fields: [entryId], references: [id])

  @@unique([userId, entryId])
  @@map("votes")
}

model EntryComment {
  id              String    @id @default(uuid())
  entryId         String    @map("entry_id")
  userId          String    @map("user_id")
  parentCommentId String?   @map("parent_comment_id")
  content         String
  isPinned        Boolean   @default(false) @map("is_pinned")
  pinnedAt        DateTime? @map("pinned_at")
  mentionedUsers  String[]  @default([]) @map("mentioned_users")
  createdAt       DateTime  @default(now()) @map("created_at")
  updatedAt       DateTime  @updatedAt @map("updated_at")

  user            User           @relation(fields: [userId], references: [id])
  entry           Entry          @relation(fields: [entryId], references: [id])
  parentComment   EntryComment?  @relation("CommentReplies", fields: [parentCommentId], references: [id])
  replies         EntryComment[] @relation("CommentReplies")
  reactions       CommentReaction[]

  @@map("entry_comments")
}

model Reaction {
  id           String   @id @default(uuid())
  userId       String   @map("user_id")
  entryId      String   @map("entry_id")
  reactionType String   @map("reaction_type")
  createdAt    DateTime @default(now()) @map("created_at")

  user         User     @relation(fields: [userId], references: [id])
  entry        Entry    @relation(fields: [entryId], references: [id])

  @@unique([userId, entryId])
  @@map("reactions")
}

model CommentReaction {
  id           String   @id @default(uuid())
  commentId    String   @map("comment_id")
  userId       String   @map("user_id")
  reactionType String   @map("reaction_type")
  createdAt    DateTime @default(now()) @map("created_at")

  comment      EntryComment @relation(fields: [commentId], references: [id])
  user         User         @relation(fields: [userId], references: [id])

  @@unique([userId, commentId, reactionType])
  @@map("comment_reactions")
}

model Share {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  entryId   String   @map("entry_id")
  contestId String   @map("contest_id")
  platform  String
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation(fields: [userId], references: [id])
  entry     Entry    @relation(fields: [entryId], references: [id])

  @@map("shares")
}

model Follow {
  id          String   @id @default(uuid())
  followerId  String   @map("follower_id")
  followingId String   @map("following_id")
  createdAt   DateTime @default(now()) @map("created_at")

  follower    User     @relation("Follower", fields: [followerId], references: [id])
  following   User     @relation("Following", fields: [followingId], references: [id])

  @@unique([followerId, followingId])
  @@map("follows")
}

model Notification {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  actorId   String?  @map("actor_id")
  type      String
  content   String
  read      Boolean  @default(false)
  entryId   String?  @map("entry_id")
  contestId String?  @map("contest_id")
  link      String?
  createdAt DateTime @default(now()) @map("created_at")

  user      User     @relation("NotificationRecipient", fields: [userId], references: [id])
  actor     User?    @relation("NotificationActor", fields: [actorId], references: [id])

  @@map("notifications")
}

model XpTransaction {
  id          String   @id @default(uuid())
  userId      String   @map("user_id")
  actionType  String   @map("action_type")
  xpAmount    Int      @map("xp_amount")
  referenceId String?  @map("reference_id")
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  user        User     @relation(fields: [userId], references: [id])

  @@map("xp_transactions")
}

model Achievement {
  id          String   @id @default(uuid())
  name        String
  description String
  icon        String
  category    String
  requirement String
  createdAt   DateTime @default(now()) @map("created_at")

  userAchievements UserAchievement[]

  @@map("achievements")
}

model UserAchievement {
  id            String   @id @default(uuid())
  userId        String   @map("user_id")
  achievementId String   @map("achievement_id")
  earnedAt      DateTime @default(now()) @map("earned_at")

  user          User        @relation(fields: [userId], references: [id])
  achievement   Achievement @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
  @@map("user_achievements")
}

model UserBadge {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  badgeName String   @map("badge_name")
  badgeIcon String   @map("badge_icon")
  earnedAt  DateTime @default(now()) @map("earned_at")

  user      User     @relation(fields: [userId], references: [id])

  @@map("user_badges")
}

model UserStats {
  id     String @id @default(uuid())
  userId String @unique @map("user_id")

  user   User   @relation(fields: [userId], references: [id])

  @@map("user_stats")
}

model ContestWinner {
  id            String   @id @default(uuid())
  contestId     String   @map("contest_id")
  userId        String   @map("user_id")
  entryId       String   @unique @map("entry_id")
  placement     Int
  votesReceived Int      @default(0) @map("votes_received")
  prizeAmount   Int      @default(0) @map("prize_amount")
  awardedAt     DateTime @default(now()) @map("awarded_at")

  contest       Contest  @relation(fields: [contestId], references: [id])
  user          User     @relation(fields: [userId], references: [id])
  entry         Entry    @relation(fields: [entryId], references: [id])

  @@map("contest_winners")
}

model LevelConfig {
  level      Int    @id
  xpRequired Int    @map("xp_required")
  title      String

  @@map("level_config")
}

model XpReward {
  id          String  @id @default(uuid())
  actionType  String  @unique @map("action_type")
  xpAmount    Int     @map("xp_amount")
  description String
  enabled     Boolean @default(true)

  @@map("xp_rewards")
}

model LevelReward {
  id          String  @id @default(uuid())
  level       Int
  rewardType  String  @map("reward_type")
  rewardValue String  @map("reward_value")
  description String
  autoGrant   Boolean @default(false) @map("auto_grant")

  @@map("level_rewards")
}

model ContactSubmission {
  id         String    @id @default(uuid())
  userId     String?   @map("user_id")
  name       String
  email      String
  subject    String
  message    String
  status     String    @default("new")
  readAt     DateTime? @map("read_at")
  resolvedAt DateTime? @map("resolved_at")
  adminNotes String?   @map("admin_notes")
  createdAt  DateTime  @default(now()) @map("created_at")

  user       User?     @relation(fields: [userId], references: [id])

  @@map("contact_submissions")
}

model DailyXpClaim {
  id        String   @id @default(uuid())
  userId    String   @map("user_id")
  action    String
  claimedAt DateTime @default(now()) @map("claimed_at")

  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, action, claimedAt])
  @@map("daily_xp_claims")
}
```

---

## 6. Migration Phases

### Phase 1: Infrastructure Setup (Day 1)
1. **Set up PostgreSQL database** (Neon recommended for Vercel)
2. **Install Prisma 7:** `npm install prisma @prisma/client`
3. **Initialize Prisma:** `npx prisma init`
4. **Create the Prisma schema** (from Section 5 above)
5. **Run initial migration:** `npx prisma migrate dev --name init`
6. **Seed level_config and xp_rewards data** (from `05-xp-system.sql`)
7. **Set up API layer** — create `/api` directory for Vercel serverless functions
8. **Install auth library:** NextAuth.js v5 or Lucia Auth
9. **Install Cloudinary SDK:** `npm install cloudinary`
10. **Set up environment variables**

### Phase 2: Auth Migration (Day 2)
1. **Create auth API routes:**
   - `POST /api/auth/signup` — hash password (bcrypt), create user + profile in one Prisma transaction
   - `POST /api/auth/login` — verify password, return JWT/session
   - `POST /api/auth/logout` — invalidate session
   - `GET /api/auth/session` — get current session
   - `POST /api/auth/verify-email` — email verification
   - `POST /api/auth/resend-verification` — resend verification email
   - `PUT /api/auth/change-password` — password change
2. **Replace `src/stores/authStore.ts`** — change all Supabase auth calls to API calls
3. **Replace `src/pages/LoginPage.tsx`** — use new API
4. **Replace `src/pages/SignupPage.tsx`** — use new API
5. **Replace `src/pages/auth/ConfirmEmail.tsx`** — use new API
6. **Replace `src/pages/SettingsPage.tsx`** — password change via API
7. **Set up email sending** (Resend, SendGrid, or Nodemailer) for verification emails
8. **Delete `src/lib/supabase.ts`** after all references removed

### Phase 3: Storage Migration (Day 3)
1. **Create storage API routes:**
   - `POST /api/upload/avatar` — upload to Cloudinary, return URL
   - `POST /api/upload/cover-photo` — upload to Cloudinary
   - `POST /api/upload/entry-artwork` — upload to Cloudinary
   - `POST /api/upload/contest-thumbnail` — upload to Cloudinary
   - `POST /api/upload/sponsor-logo` — upload to Cloudinary
   - `DELETE /api/upload/:id` — delete from Cloudinary
2. **Replace storage calls in:**
   - `SettingsPage.tsx` (avatar upload)
   - `ProfileBanner.tsx` (cover photo upload/delete)
   - `SubmitEntryPage.tsx` (entry artwork upload)
   - `AdminCreateContest.tsx` (thumbnail + sponsor logo)
   - `AdminEditContest.tsx` (thumbnail + sponsor logo)

### Phase 4: Database Query Migration (Day 3-5)
Create API routes and replace all `supabase.from()` calls:

**Core API Routes needed:**
```
# Users
GET    /api/users                    — list users (admin, artists page, leaderboard)
GET    /api/users/:username          — get user profile
PUT    /api/users/:id                — update user profile
GET    /api/users/:id/entries        — get user's entries
GET    /api/users/:id/stats          — get user stats (followers, entries, wins)

# Contests
GET    /api/contests                 — list contests
GET    /api/contests/:id             — get contest detail
POST   /api/contests                 — create contest (admin)
PUT    /api/contests/:id             — update contest (admin)
DELETE /api/contests/:id             — delete contest (admin)
POST   /api/contests/:id/finalize    — finalize contest (admin)

# Entries
GET    /api/entries/:id              — get entry detail
POST   /api/entries                  — create/submit entry
PUT    /api/entries/:id              — update entry
GET    /api/contests/:id/entries     — get entries for contest

# Reactions
GET    /api/entries/:id/reactions    — get reactions for entry
POST   /api/entries/:id/reactions    — add/update reaction
DELETE /api/entries/:id/reactions    — remove reaction

# Comments
GET    /api/entries/:id/comments     — get comments for entry
POST   /api/entries/:id/comments     — add comment
PUT    /api/comments/:id             — edit comment
DELETE /api/comments/:id             — delete comment
PUT    /api/comments/:id/pin         — pin/unpin comment

# Comment Reactions
POST   /api/comments/:id/reactions   — add reaction to comment
DELETE /api/comments/:id/reactions   — remove reaction from comment

# Follows
GET    /api/users/:id/followers      — get followers
GET    /api/users/:id/following      — get following
POST   /api/follows                  — follow user
DELETE /api/follows/:id              — unfollow user

# Notifications
GET    /api/notifications            — get user notifications
PUT    /api/notifications/:id/read   — mark as read
PUT    /api/notifications/read-all   — mark all as read
DELETE /api/notifications/:id        — delete notification
DELETE /api/notifications            — clear all notifications

# Feed
GET    /api/feed                     — get personalized feed

# Search
GET    /api/search?q=...&type=...    — search contests, users, entries

# XP System
POST   /api/xp/award                 — award XP (internal)
GET    /api/xp/progress/:userId      — get level progress

# Admin
GET    /api/admin/dashboard          — dashboard stats
PUT    /api/admin/entries/:id/review — approve/reject entry
GET    /api/admin/messages           — get contact messages
PUT    /api/admin/messages/:id       — update message status
GET    /api/admin/xp/levels          — get level config
PUT    /api/admin/xp/levels/:level   — update level config
GET    /api/admin/xp/rewards         — get XP rewards
PUT    /api/admin/xp/rewards/:id     — update XP reward

# Shares
POST   /api/shares                   — record share

# Contact
POST   /api/contact                  — submit contact form
```

### Phase 5: Business Logic Migration (Day 5-6)
Reimplement all RPC functions and triggers as application-level logic:

1. **`create_user_profile`** → Part of signup API route (Prisma `user.create()`)
2. **`award_xp`** → Prisma transaction: insert xp_transaction, update user.xp/level, check level_config
3. **`get_level_progress`** → Prisma query on user + level_config
4. **`update_user_share_stats`** → Prisma update in share API route
5. **`finalize_contest_and_select_winners`** → Prisma transaction: count reactions, determine top 3, create contest_winners, update user points, award XP
6. **`get_level_distribution`** → Prisma groupBy query
7. **Trigger replacements** — All count updates (vote_count, comment_count, share_count) done in the respective API routes using Prisma `update({ increment })` or transactions

### Phase 6: Realtime Migration (Day 6)
Replace Supabase Realtime with one of:

**Option A: Polling (Simplest)**
- Replace realtime subscriptions with `setInterval` polling every 10-30 seconds
- Affects: `NotificationBell.tsx`, `useContactMessages.ts`, `usePendingReviews.ts`

**Option B: Pusher/Ably (Recommended)**
- Server pushes events when data changes
- Client subscribes to channels

**Option C: Socket.io (Self-hosted)**
- More complex but full control

### Phase 7: RLS → API Authorization (Day 6-7)
All RLS policies must be reimplemented as middleware/guards in API routes:

| RLS Policy | API Implementation |
|-----------|-------------------|
| Users can read all profiles | Public GET endpoint |
| Users can update own profile | Check `req.user.id === params.id` |
| Approved entries visible to all | Filter by status in query |
| Users can see own pending entries | Add `OR user_id = currentUser` |
| Users can insert own entries | Verify `req.user.id` matches body |
| Admin can update any entry | Check `req.user.role === 'admin'` |
| Entry owners can pin comments | Verify entry ownership in API |

### Phase 8: Testing & Cleanup (Day 7)
1. Test all auth flows (signup, login, logout, email verification, password change)
2. Test all CRUD operations for every entity
3. Test file uploads (avatars, entries, contest thumbnails)
4. Test XP system (award, level up, progress)
5. Test contest finalization
6. Test notifications
7. Test admin functions
8. Remove `@supabase/supabase-js` from `package.json`
9. Delete `src/lib/supabase.ts`
10. Delete `src/types/database.ts` (replaced by Prisma generated types)
11. Update `.env.example` with new variables
12. Update `README.md`

---

## 7. File-by-File Migration Map

### Files to DELETE:
| File | Reason |
|------|--------|
| `src/lib/supabase.ts` | Replaced by Prisma client + API calls |
| `src/types/database.ts` | Replaced by Prisma generated types |
| `migration/*.sql` | Replaced by Prisma migrations |

### Files to CREATE:
| File | Purpose |
|------|---------|
| `prisma/schema.prisma` | Prisma schema |
| `prisma/seed.ts` | Seed data (levels, XP rewards) |
| `api/` or `src/api/` | All API route handlers |
| `src/lib/api.ts` | API client (fetch wrapper with auth headers) |
| `src/lib/auth.ts` | Auth utilities (JWT handling, session management) |
| `src/lib/upload.ts` | Upload utilities (Cloudinary integration) |

### Files to MODIFY (every file with `import { supabase }`):
| File | Changes Required |
|------|-----------------|
| `src/stores/authStore.ts` | Replace all `supabase.auth.*` with API calls |
| `src/lib/xp.ts` | Replace RPC calls with API calls |
| `src/hooks/useContactMessages.ts` | Replace realtime with polling/Pusher |
| `src/hooks/usePendingReviews.ts` | Replace realtime with polling/Pusher |
| `src/components/social/Comments.tsx` | Replace all `supabase.from()` with API calls |
| `src/components/social/ReactionPicker.tsx` | Replace with API calls |
| `src/components/social/ShareButton.tsx` | Replace with API calls |
| `src/components/social/FollowButton.tsx` | Replace with API calls |
| `src/components/social/WhoReactedModal.tsx` | Replace with API calls |
| `src/components/social/CommentReactionPicker.tsx` | Replace with API calls |
| `src/components/social/MentionInput.tsx` | Replace with API calls |
| `src/components/notifications/NotificationBell.tsx` | Replace with API calls + polling |
| `src/components/profile/ProfileBanner.tsx` | Replace storage + DB calls with API |
| `src/components/home/StatsSection.tsx` | Replace with API call |
| `src/pages/LoginPage.tsx` | Replace username lookup + auth |
| `src/pages/SignupPage.tsx` | Replace auth calls |
| `src/pages/FeedPage.tsx` | Replace all queries with API calls |
| `src/pages/SubmitEntryPage.tsx` | Replace queries + storage with API |
| `src/pages/EntryDetailPage.tsx` | Replace queries with API |
| `src/pages/ContestDetailPage.tsx` | Replace queries with API |
| `src/pages/UserProfilePage.tsx` | Replace queries with API |
| `src/pages/SettingsPage.tsx` | Replace queries + storage + auth with API |
| `src/pages/ActiveContestsPage.tsx` | Replace queries with API |
| `src/pages/ArtistsPage.tsx` | Replace queries with API |
| `src/pages/ContactPage.tsx` | Replace insert with API |
| `src/pages/LeaderboardPage.tsx` | Replace queries with API |
| `src/pages/SearchPage.tsx` | Replace queries with API |
| `src/pages/WinnersPage.tsx` | Replace queries with API |
| `src/pages/NotificationsPage.tsx` | Replace queries with API |
| `src/pages/auth/ConfirmEmail.tsx` | Replace auth with API |
| `src/pages/admin/AdminDashboard.tsx` | Replace queries with API |
| `src/pages/admin/AdminContests.tsx` | Replace queries with API |
| `src/pages/admin/AdminCreateContest.tsx` | Replace queries + storage with API |
| `src/pages/admin/AdminEditContest.tsx` | Replace queries + storage with API |
| `src/pages/admin/AdminReviews.tsx` | Replace queries with API |
| `src/pages/admin/AdminFinalizeContest.tsx` | Replace queries + RPC with API |
| `src/pages/admin/AdminUsers.tsx` | Replace queries with API |
| `src/pages/admin/AdminMessages.tsx` | Replace queries with API |
| `src/pages/admin/AdminXPSystem.tsx` | Replace queries + RPC with API |

---

## 8. Risk Assessment & Mitigation

### High Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| **Data loss during migration** | Critical | Export all data before migration. Use Prisma `db push` for schema, then migrate data with scripts |
| **Auth token incompatibility** | Users logged out | Plan a "maintenance window". All users will need to re-login |
| **N+1 query performance** | Slow pages | Use Prisma `include` and `select` for eager loading. UserProfilePage and LeaderboardPage are the worst offenders |
| **Missing API authorization** | Security breach | Implement auth middleware first. Test every endpoint for proper authorization |

### Medium Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| **Realtime feature degradation** | Delayed notifications | Start with polling (simple), upgrade to Pusher later |
| **Storage URL changes** | Broken images | Migrate existing images to Cloudinary first, update URLs in DB |
| **XP calculation bugs** | Wrong levels/points | Write comprehensive tests for XP system before migration |
| **Contest finalization errors** | Wrong prize distribution | Test with mock data extensively |

### Low Risk
| Risk | Impact | Mitigation |
|------|--------|------------|
| **Type mismatches** | Build errors | Prisma generates types automatically; update imports |
| **Environment variable confusion** | Deploy failures | Document all new env vars clearly |

---

## Summary

**Total files to modify:** ~40 files
**Total API routes to create:** ~45 endpoints
**Total Supabase features to replace:** 4 (Database, Auth, Storage, Realtime)
**Recommended migration order:** Auth → Storage → Database Queries → Business Logic → Realtime → Testing
