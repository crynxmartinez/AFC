# AFC online deployment

Server-side functions are pinned to Singapore (`sin1`) in `vercel.json`, alongside the Singapore database. This takes effect on the next successful deployment; the build machine location is separate. This setting does not relocate the Blob store.

## Import and deploy

1. Use the existing GitHub connection to `crynxmartinez/AFC`, production branch `main`.
2. Keep Vercel Root Directory at the repository root. Use Next.js and Node 24. `vercel.json` supplies `npm ci`, `npm run build:vercel`, and `.next`. Remove any old Vite-specific project overrides.
3. In Vercel Environment Variables, choose **Import .env**, select the local **`.env.vercel`**, and apply to **Production only**. This secret file is ignored by Git. `production.env.example` is the safe template.
4. Redeploy the latest main commit after importing. A push before import may fail: the build deliberately refuses missing credentials or demo mode.
5. Check `/api/health`, sign in, create a contest, and verify submission, moderation, and voting on `https://www.arenaforcreatives.online`.

Variables: `DATABASE_URL` (pooled), `DIRECT_URL` (migrations), `LOCAL_DEMO=false`, `STORAGE_PROVIDER=blob`, `APP_URL`, `BLOB_STORE_ID`, `BLOB_READ_WRITE_TOKEN`. No Supabase, Clerk, JWT, or payment keys are used. Sessions are random opaque tokens stored hashed in PostgreSQL.

Private Blob storage is required. Do not substitute a public store. Vercel's server upload limit is 4.5 MB; this implementation accepts images up to **3 MB**, validates and normalizes them, and checks permission on every media read. Larger direct browser uploads are future work.

## Database and administrator

Production uses a dedicated `afc` schema and versioned migrations in `prisma/postgres/migrations`. Local demo accounts, contests, and submissions are not copied online. Generated banner assets are presentation assets, not real contest submissions.

The administrator is provisioned separately. `.env.admin` is local, ignored, and must **not** be imported into Vercel. `scripts/create-admin.ts` refuses to replace an existing account. Keep credentials in a password manager; remove the bootstrap file when no longer needed.

For an explicitly authorized admin setup, supply `ADMIN_EMAIL` and `ADMIN_PASSWORD` privately:

```powershell
node --env-file=.env.vercel scripts/prisma.mjs generate
node --env-file=.env.vercel --env-file=.env.admin node_modules/tsx/dist/cli.mjs scripts/create-admin.ts
```

Never run demo seeds or `migrate reset` against production. Do not edit an applied migration. Use backups and expand/contract changes for breaking migrations. The build applies pending migrations through the direct connection.

## Verify infrastructure

```powershell
node --env-file=.env.vercel scripts/prisma.mjs generate
node --env-file=.env.vercel scripts/check-runtime-db.mjs
node --env-file=.env.vercel scripts/verify-postgres.mjs
node --env-file=.env.vercel scripts/check-blob.mjs
node --env-file=.env.vercel scripts/vercel-build.mjs
```

The database test runner creates a random `afc_test_*` schema and removes only that owned schema afterward. Blob verification creates and deletes one temporary object. Never expose these operational scripts as HTTP routes.

To return to local SQLite, stop the server, run `npm run db:generate`, `npm run db:push`, `npm test`, and `npm run build`. Keep `.env` pointing to the local file database. Windows locks Prisma's DLL while a server is running.

## Remaining launch responsibilities

- Verify the actual Vercel deployment: build success locally does not prove it is online.
- Real payments are disabled. Implement signed webhooks, idempotent credit, and reconciliation before selling points. Prize allocations are records, not automatic bank transfers.
- Set eligibility, fulfillment terms, and a policy for fewer than three qualifying entries. Results currently require three entries.
- Add email recovery, monitoring, storage quotas, backup/restore procedures, and stronger abuse controls. Database-backed throttling is not full multi-account/bot protection.
- Deadline checks reject late actions. Closing/reminders reconcile on requests; proactive scheduling and orphan cleanup remain future work.
- Use separate databases and Blob stores for previews. Do not expose production credentials to untrusted branch code.
- Rotate old secrets ever committed in the previous repository: removing a file does not erase its Git history. Rotate shared credentials if this conversation or the import file is shared beyond your trusted access.

## References

- [Prisma pooled/direct connections](https://www.prisma.io/docs/postgres/database/connecting-to-your-database)
- [Vercel private storage](https://vercel.com/docs/vercel-blob/private-storage)
- [Vercel server uploads](https://vercel.com/docs/vercel-blob/server-upload)
