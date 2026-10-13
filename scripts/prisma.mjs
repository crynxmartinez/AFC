import { spawnSync } from 'node:child_process';
const production =
  /^(postgres|postgresql):/.test(process.env.DATABASE_URL || '') || process.env.VERCEL === '1';
const args = process.argv.slice(2);
const result = spawnSync(
  process.execPath,
  [
    'node_modules/prisma/build/index.js',
    ...args,
    '--schema',
    production ? 'prisma/postgres/schema.prisma' : 'prisma/schema.prisma',
  ],
  { stdio: 'inherit', env: process.env },
);
process.exit(result.status ?? 1);
