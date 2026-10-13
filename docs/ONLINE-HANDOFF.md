# Original local handoff checklist (historical)

The PostgreSQL/Blob implementation supersedes the infrastructure items below. See [current deployment instructions](DEPLOYMENT.md) for import steps, verification, and remaining operational limitations.

The local preview is complete enough to exercise the contest loop. Online infrastructure requires the following explicit configuration and verification.

1. Create a Git remote and review files before pushing. Keep `.env`, SQLite, uploads, session records, and local test data excluded. No remote or deployment has been created by this task.
2. Create Prisma Postgres. Replace the schema datasource provider with `postgresql`, supply the production URL, and create a PostgreSQL-specific initial migration. Do not reuse SQLite migration SQL. The application models use portable strings, dates, integers, booleans and relations. Re-run concurrency, ledger and unique-constraint tests on PostgreSQL. Move only deliberately selected data using an export/import step; the local demo database is not production seed data.
3. Introduce a storage adapter backed by Vercel Blob. Draft media must remain private; every publicly approved entry must expose ALL required stages. Migrate image keys and references deliberately. Preserve authorization for revoked/disqualified uploads and avoid public caching of private content.
4. Set `LOCAL_DEMO=false`, remove demo accounts and demo artwork from production, use HTTPS session cookies, configure production origin, rate limiting shared across instances, and account verification/recovery through a mail service. Current auth throttling is a local single-process safeguard.
5. Choose payment provider and package prices. Implement server-created orders, signed webhook verification, unique provider event IDs, atomic ledger credits, and reconciliation of pending/failed payments. Local demo credits must remain unavailable online.
6. Run a scheduler for deadline transitions, upcoming/closing reminders, and orphaned media cleanup. Request-time date checks already reject late votes/submissions; scheduling improves timely notifications and operational visibility.
7. Set actual contest eligibility, allowed tools, fulfillment details, and policy for contests with fewer than three qualifying entries. Publish rule changes as explicit announcements. The current app locks rules when a contest is published.
8. Add database backups, error monitoring and request metrics; verify restoration of both database and media. Set file storage quotas, shared abuse controls and moderation operating procedures.
9. Run the build, tests and browser checks in staging, verify no public voter identities or private drafts leak, then connect the final domain and deploy.

No online-ready claim should be inferred from a successful local build.
