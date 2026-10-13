# AFC — Arena for Creatives

Implementation plan · 13 October 2026

## Capability and product promise
AFC lets artists and cosplayers enter admin-created competitions, publicly share their process, support each entry once using points, and build a portfolio of contest submissions. Success means creators complete submissions, viewers discover and vote for multiple creators, and administrators can publish an auditable top three. This plan distinguishes confirmed rules from implementation defaults and online dependencies.

## Confirmed rules
- Art has exactly three required stages: rough sketch, clean line art, final artwork.
- Cosplay has exactly two required stages: the costume and the cosplayer wearing it.
- ALL viewers, including guests, can inspect EVERY stage on a published entry. Drafts are private.
- Submissions and voting are open together, ending at the same instant.
- One entry per account per contest. One permanent vote per account per entry, costing one point. No paid repeat votes, unvotes, or routine refunds.
- Every new account receives 100 points once. Packages: 50, 100, 200, 500 points.
- Public vote totals and creator identities. Voter identities and My Votes remain private.
- Winners are determined by votes: first 50%, second 30%, third 20% of the cash pool.
- No blind voting, judges, verification code, alternate awards, critique mode, or elaborate achievement system.
- Profiles show contest entries with their contest names, avatar, name, bio, follows, and optional featured entry.
- Ordinary comments with reporting; bookmarks, notifications, saved drafts, clear rules, wallet ledger.
- Desktop uses a left menu; mobile uses bottom navigation.

## Actors and surfaces
Guest: explore, search, contests, public entries including full process, profiles, results. Member: guest capabilities plus draft/upload/submit, vote, comment/report, bookmark contests/entries, follow, own ledger, demo top-up, notifications, profile/settings. Admin: contest creation/editing/closing, review submissions and reports, hide comments, manage account access, publish results and record tie resolutions.

Routes: / (Explore), /contests, /contests/:id, /entries/:id, /submit, /saved, /wallet, /notifications, /profile/:id, /settings, /login, /admin. Desktop navigation: Explore, Contests, Submit, Saved, Wallet, Notifications, Profile, Settings, and Admin when authorized. Mobile: Explore, Contests, Submit, Saved, Profile; wallet and notifications in top bar.

## User journeys
1. Browse an active contest, read rules and prizes, create account, receive 100 points.
2. Select contest, add title/description, upload sequential stages, save draft, preview ALL public stages, accept rules, submit for moderation.
3. Admin inspects each stage and accepts or requests changes. Approved complete entries become public immediately during the active contest.
4. Viewer opens entry, inspects stages, votes once. Server deducts exactly one point atomically; UI displays Voted and new balance. Bookmarks are free and independent of voting.
5. User opens wallet, sees credits/debits and private voting history, selects a demo package and confirms a simulated credit. Real checkout remains disabled locally.
6. Deadline passes: server rejects new votes/submissions even if an old browser still shows an active countdown. Admin reviews standings, resolves ties with a reason, publishes first/second/third. Results and all public process images remain visible.

## Lifecycle and policy defaults
Contest: Draft -> Active -> Closed -> Winners Announced. Future start dates appear Upcoming. Start inclusive, end exclusive; persist UTC and display local time/timezone. Reads reconcile expired active contests; mutation checks always enforce dates. Closing is irreversible through ordinary controls. Finalizing requires at least three eligible entries; contests with fewer remain closed until a published resolution policy is chosen.
Entry: Draft -> Pending -> Approved or Changes Requested -> resubmit; Approved -> Disqualified. Only Approved entries appear publicly; published images cannot be replaced. Draft stage files are access-controlled. Declined entries can be edited by their owner during the active contest. Moderation is evidence review, never a guarantee that something is AI-free.
Proposed default: no self-votes; admin tie ordering may change ONLY tied positions and requires a reason. Cash arithmetic uses integer centavos; final place receives any rounding residual. Custom prizes have explicit first/second/third descriptions. Normal votes remain final if an entry is later disqualified, with the reason visible to the voter; no automatic point refunds.

## Screen specification
Explore: welcoming header, active contest hero, Art/Cosplay filters, Newest/Most Voted/discovery sorts, large image cards, author, contest, vote count, save control; loading/error/empty states.
Contest: banner, prompt, shared deadline, three cash amounts or custom prizes, submit/save, Entries/Rules/Leaderboard/Results. Closed state removes voting and submission actions.
Entry: finished image, creator/contest links, vote, wallet balance, share/bookmark/report, ordered public process images with full-size viewer, plain comments and follow creator. All stages remain accessible on small screens.
Submit: contest selector, draft resume, title/description, three/two labeled upload areas, validation, progress, preview, rules acceptance; real upload persistence.
Wallet: balance, package cards, explicit demo confirmation, transaction ledger, My Votes. No fabricated currency prices.
Profile: portfolio grid with contest labels, bio, avatar, follow counts and optional featured entry. Saved: Entries/Contests. Notifications: preferences and read states. Settings: profile, theme, notification options.
Admin: counts and queues, create/edit draft contest, activate/close, inspect all stages, approve/request changes/disqualify, reports and comments, restricted account controls, audited results.

## Implementation contract
- Next.js App Router + TypeScript + React; server routes own all authorization, validation and database changes.
- Prisma ORM. This machine has Node but no Docker detected: initial local runtime uses a SQLite file for a self-contained launch. Production target stays Prisma Postgres. Generate a separate PostgreSQL migration history and re-run transaction/concurrency tests before online release; switching providers is NOT a data migration.
- Local image storage outside public/ with a guarded serving route. Validate decoded image contents, size and dimensions; normalize using Sharp to remove metadata; serve draft files only to owner/admin. Approved stage files are public.
- Production Blob adapter must preserve the same visibility rules; use private Blob for draft files and an authorized route, or publish copies only on approval. Local filesystem is not a Vercel persistence strategy.
- Password hashing with scrypt; random opaque sessions stored hashed; HttpOnly SameSite cookies; server-side role and ownership checks; same-origin mutation checks. Local demo sign-in exists only with LOCAL_DEMO=true and loopback host.
- Vote unique(voterId, entryId), entry unique(authorId, contestId), wallet ledger unique event keys. Wallet decrement, vote insert and ledger append commit together. Retry must not charge twice; balance cannot become negative.
- API mutations return explicit validation/conflict/auth errors. Notifications link to existing pages; no identity leakage through public vote responses.
- All external payments are simulated locally, labeled clearly, gated by local mode; production payment provider/prices are still undecided. Online credit requires a verified, idempotent payment webhook.

## Data model
User (account/profile/role/balance/preferences), Session, Contest (type/rules/dates/prizes/state), Entry (owner/contest/state/text), Stage (ordered label/file), Media (owner/key/type), Vote, Ledger, Bookmark, Follow, Comment, Report, Notification, Winner, Audit. Database constraints preserve uniqueness. Monetary amounts use integer centavos. Vote counts derive from actual vote records; seeded demo votes are real rows and explicitly demo content.

## Failure and recovery
Uploads can be retried without publishing drafts; incomplete submission is rejected. Duplicate vote/top-up callbacks are idempotent. Pending payment never credits. Closed contest prevents late approval. Insufficient points yields a wallet link. Published winners are stored snapshots. Report moderation keeps evidence/audit history. User suspension revokes mutation access. Errors preserve form data and show a recoverable action.

## Delivery sequence
1. Foundations: install, schema, migrations, sessions, local media, deterministic demo seeds, persistent layout.
2. Core experience: Explore, contests, public process detail, search/sort, profile, responsive desktop/mobile.
3. Participation: registration/login, drafts/uploads/preview, moderation, transactional voting, wallet/demo packages.
4. Community: comments/reports, bookmarks/follows, notification preferences, settings.
5. Operations: admin contest management, result snapshots and 50/30/20 distribution, audit.
6. Verification: typecheck, production build, isolated integration tests, desktop/mobile browser walkthrough, local server handoff.
7. Online later: Git remote and deployment, PostgreSQL migration, private Blob, real checkout/webhooks, email delivery/reset/verification, rate limiting across instances, backups/monitoring, scheduled reminders and lifecycle tasks.

## Acceptance checks
- Guests can see all THREE art stages and both TWO cosplay stages; cannot read drafts.
- Ten simultaneous repeat vote requests create one vote, one deduction and one ledger debit.
- Different entries can receive one vote each, until balance reaches zero; self-vote is refused.
- Reload/server restart preserves entries, votes, wallet, saves, comments.
- Missing stages, duplicate contest entries and late submissions fail server-side.
- Non-admin cannot access admin data or mutate someone else's entry.
- Results obey ranking and 50/30/20; untied ranks cannot be manually replaced.
- Mobile bottom menu is usable at 390px; desktop sidebar remains visible; no horizontal overflow.
- Local top-ups do not request card details or charge money.

## Open online decisions and handoff
Payment provider/package prices, actual prize fulfillment, eligible ages, custom-prize defaults, operational review SLA, email provider and final AI/tool-use wording remain owner decisions before public launch. These do not prevent a functional local build. Proceed with local implementation and explicit demo labels. No online deployment is requested yet.

## References
Implementation references: https://nextjs.org/docs/app/getting-started/installation and https://docs.prisma.io/docs/orm/v6/overview/databases/sqlite . Concept images are design direction; this specification overrides incidental generated text, dates, figures, and inconsistent sample labels.
