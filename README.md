# Arena for Creatives (AFC)

A competitive art platform for Filipino digital artists featuring 4-phase submissions, vote-based prizes, and gamification.

## 🚀 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS (Dark Mode)
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **State Management**: Zustand
- **Payments**: SaligPay

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The `.env.local` file has already been created with your Supabase credentials.

### 3. Set Up Supabase Database

1. Go to your Supabase project: https://pqyfzmkerzvyqswnmtvp.supabase.co
2. Navigate to the SQL Editor
3. Copy the contents of `supabase-schema.sql`
4. Paste and run the SQL script

This will create all necessary tables, indexes, RLS policies, and triggers.

### 4. Configure Supabase Storage

1. In Supabase Dashboard, go to Storage
2. Create the following buckets:
   - `contest-thumbnails` (public)
   - `entry-artworks` (public)
   - `user-avatars` (public)

### 5. Run Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## 📁 Project Structure

```
src/
├── components/
│   ├── auth/          # Protected routes
│   └── layout/        # Navbar, Sidebar, etc.
├── pages/             # Route pages
│   ├── admin/         # Admin dashboard pages
│   └── ...            # User pages
├── lib/               # Supabase client, utilities
├── stores/            # Zustand state management
├── types/             # TypeScript types
└── App.tsx            # Main app with routing
```

## 🎨 Features

### User Features
- 4-phase artwork submission (Sketch → Line Art → Base Colors → Final)
- Vote on entries (1 point = 1 vote)
- Purchase points via SaligPay
- Follow artists
- Comment on entries (100 char max)
- XP & leveling system
- Badges & achievements

### Admin Features
- Create and manage contests
- Review and approve submissions
- View analytics dashboard
- Manage users

## 💰 Financial Model

- **1 point = ₱1 PHP = 1 vote**
- **Top 3 Prize Distribution**:
  - 1st Place: 50%
  - 2nd Place: 20%
  - 3rd Place: 10%
  - Platform: 20%
- **Platform Revenue**: 100% of 4th+ place votes

## 🔐 User Roles

- **User**: Browse, submit, vote, follow, comment
- **Admin**: All user functions + admin dashboard

## 📦 Point Packages

| Package | Price | Bonus | Total |
|---------|-------|-------|-------|
| Starter | ₱20 | +2 | 22 pts |
| Basic | ₱50 | +5 | 55 pts |
| Popular | ₱100 | +15 | 115 pts |
| Pro | ₱500 | +100 | 600 pts |
| Champion | ₱1,000 | +250 | 1,250 pts |

*First-time buyers get +10 bonus points*

## 🚀 Deployment

### Vercel Deployment

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

## 📝 Development Roadmap

- [x] Phase 1: Foundation (Auth, UI Shell)
- [ ] Phase 2: Contest System
- [ ] Phase 3: Submission System
- [ ] Phase 4: Points & Voting
- [ ] Phase 5: Gamification
- [ ] Phase 6: Social Features
- [ ] Phase 7: Admin Analytics
- [ ] Phase 8: Polish & Launch

## 🤝 Contributing

This is a private project. Contact the owner for contribution guidelines.

## 📄 License

Proprietary - All rights reserved
