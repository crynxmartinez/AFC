# Local build validation

Verified during implementation on 13 October 2026.

- TypeScript compilation: passed.
- Next.js production build: passed.
- `npm audit`: zero reported vulnerabilities after updating Sharp and overriding patched Prisma tooling dependencies. Prisma generation and tests passed with those overrides.
- Six domain/database tests passed: stage counts, deadline boundaries, prize arithmetic, ten simultaneous duplicate votes, self/closed vote rejection, and idempotent credits.
- HTTP workflow suite passed: guest stage visibility, registration with one 100-point credit, admin access restriction, protected uploads, incomplete submission rejection, private drafts, one charge per vote, one credit per top-up key, bookmarks/follows/comments/reports.
- Operations suite passed: approval publishes stages, premature results rejected, untied rank changes rejected, exact 50/30/20 payouts, repeat publication rejected, post-result moderation rejected.
- Browser: member demo login, art stage gallery, voting changes 100 to 99 and disables duplicate vote, bookmark, demo top-up changes 99 to 149, mobile Explore, public stage labels, two-stage cosplay form, upload of first costume image, private draft saved.
- Responsive check at 390 x 844: mobile navigation fixed to bottom, document width 375 (within viewport), no horizontal overflow. Desktop sidebar observed at the normal viewport.

The member demo intentionally retains the review-session vote, bookmark, 50-point demo credit and sample draft so the user can inspect persistence. The automated suites remove only their own fixture records.

Limitations: local SQLite and filesystem storage; payment credits simulated; no online mail/payment/Blob/Postgres integration; reminders reconciled during visits instead of an external scheduler. Sample art and stages are generated design placeholders. See ONLINE-HANDOFF.md before public deployment.
