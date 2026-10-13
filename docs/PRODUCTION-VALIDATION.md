# Production preparation validation — 2026-10-14

Verified before repository replacement:

- Existing remote main history retained as parent; old tracked `.env.vercel` removed from the replacement tree.
- Database catalog inspected first: no existing application tables. Initial migration applied only to the new `afc` schema; provider-owned `ppg` schema untouched.
- Direct administrative and pooled runtime connections verified. Runtime uses PgBouncer compatibility, three connections per instance, and a 30-second connect timeout.
- Administrator created with salted scrypt password hashing; no password in source, logs, or Vercel variables.
- Six domain tests passed against a disposable PostgreSQL schema, including ten simultaneous duplicate votes. The test schema was removed afterward.
- Private Blob upload/read round trip passed; anonymous access denied; temporary object deleted.
- Production-configured local HTTP app passed health, admin login, disabled demo login/top-ups, authenticated media upload/read, and denied guest access to an unpublished image. Temporary media record/object removed.
- PostgreSQL Vercel build passed; migration rerun correctly reported no pending migrations.
- Local SQLite six-test suite, HTTP flow, and admin operations suite passed. TypeScript and local production build passed.
- npm dependency audit: zero vulnerabilities at validation time.
- Staged-source scan found none of the supplied database credentials, Blob token, or administrator password. Local secrets, SQLite, and uploads are ignored.

The local preview remains at http://127.0.0.1:3000. The Vercel deployment requires importing `.env.vercel` into Production and redeploying. These checks do not claim that the public domain is serving this release yet. Follow `DEPLOYMENT.md` for remaining launch responsibilities.
