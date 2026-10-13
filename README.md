# AFC — Arena for Creatives

A creative contest platform built with Next.js, React, TypeScript and Prisma. Local development uses SQLite; production uses Prisma Postgres and private Vercel Blob. Desktop left navigation and mobile bottom navigation follow the approved design concepts.

## Run locally

Use Node.js 24 LTS.

```powershell
npm install
Copy-Item .env.example .env
npm run db:generate
npm run db:push
npm run db:seed
npm run build
npm start
```

Open http://127.0.0.1:3000 . For development use `npm run dev` instead of build/start. Do not run development and production against the same `.next` directory simultaneously. Stop the app before regenerating Prisma on Windows because the query-engine DLL is loaded by the server.

The login page has **Explore as a member** and **Open admin studio** buttons when `LOCAL_DEMO=true` and the server is accessed through localhost/127.0.0.1. Real registration and password sign-in also work. Demo accounts: `demo-member@afc.local` / `demo-admin@afc.local`, password `AfcLocal2026!`. These are public development credentials only. Never deploy this database or seed accounts to a public environment.

## What works

- Public discovery, search by entry/creator/contest, Art/Cosplay filters, discovery/newest/vote sorts, contest pages and ranking.
- All three art stages and both cosplay stages publicly accessible after approval, with full-size viewing.
- Real sessions and registration; 100-point starting credit in a persistent ledger.
- One vote per account per entry; transactional deduction and unique database constraint; no self-votes.
- Private drafts, sequential image uploads, validation, preview, submission locking, review, changes requested, approval/disqualification.
- Bookmarks, follows, ordinary comments, reports, creator portfolios, optional featured entry, avatar upload, dark/light preference.
- Wallet history, private My Votes, clearly labeled simulated top-ups with retry protection.
- In-app activity/contest notifications, read state and preferences. Deadline reminders are reconciled when the app is opened; an online scheduler is a later deployment task.
- Admin contest drafts and publishing, closing, moderation, reports, account suspension, audited results with enforced rank and 50/30/20 split. Ties require explanation; at least three eligible entries are required for publishing.
- Local images stored on disk with authorization on draft access. Uploads are decoded and normalized before storage.

## Storage and online handoff

The local database is `prisma/afc.db`. Uploads are in `storage/uploads/`. Both survive application restarts and are excluded from Git. Back up both together before changing machines. Demo gallery artwork is generated sample content, not real contestant evidence; example stages are illustrative.

Production uses Vercel, Prisma Postgres, and private Vercel Blob. See [deployment instructions](docs/DEPLOYMENT.md) and [registration email confirmation](docs/EMAIL-CONFIRMATION.md). GHL sends only registration confirmation emails. No real payment processor or password-recovery email service is connected; online top-ups are disabled. Never commit credentials or deploy SQLite/local uploads to Vercel's ephemeral filesystem.

The source model is `prisma/schema.prisma` (SQLite). Run `npm run db:sync-schema` after model changes to update the PostgreSQL mirror, then create and review a new production migration. Production builds run `migrate deploy`, never `db push` or demo seeding. The Prisma client is selected from the configured database URL.

Uploads are limited to 3 MB, decoded and normalized into WebP. Private Blob files are served through an authorization-aware route: drafts remain private, and guests can view every stage of approved entries.

## Verify

```powershell
npm run typecheck
npm test
node node_modules/tsx/dist/cli.mjs tests/http-flow.ts
npm run build
```

HTTP checks require the server running on port 3000. They create isolated test accounts and remove their own database records. The database test suite verifies concurrent repeat votes, self-vote rejection, deadline boundaries, point credits and prize arithmetic.

## Planning and concepts

- `docs/PLATFORM-PLAN.md`: fixed requirements, defaults, workflows, states, data contract, delivery sequence and acceptance criteria.
- `docs/concepts/`: five desktop and five mobile images (Explore, Contest, Entry, Submit, Wallet).
- `docs/concepts/PROMPTS.md`: exact mockup prompts. Generated with the built-in image tool.
- `public/art/`: generated demo illustration assets. Never treat these as approved human-made contest submissions.
