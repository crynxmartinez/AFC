import { spawnSync } from 'node:child_process';
if (
  !/^postgres(ql)?:/.test(process.env.DATABASE_URL || '') ||
  !process.env.DIRECT_URL ||
  process.env.LOCAL_DEMO !== 'false'
) {
  console.error(
    'Import DATABASE_URL, DIRECT_URL and LOCAL_DEMO=false into Vercel before deploying.',
  );
  process.exit(1);
}
if (process.env.STORAGE_PROVIDER !== 'blob' || !process.env.BLOB_READ_WRITE_TOKEN) {
  console.error(
    'Connect a private Blob store and set STORAGE_PROVIDER=blob and BLOB_READ_WRITE_TOKEN.',
  );
  process.exit(1);
}
for (const args of [
  ['scripts/prisma.mjs', 'generate'],
  ['scripts/prisma.mjs', 'migrate', 'deploy'],
  ['node_modules/next/dist/bin/next', 'build'],
]) {
  const result = spawnSync(process.execPath, args, { stdio: 'inherit', env: process.env });
  if (result.status !== 0) process.exit(result.status ?? 1);
}
