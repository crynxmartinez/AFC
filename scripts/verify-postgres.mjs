import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
const schema = `afc_test_${randomUUID().replaceAll('-', '')}`;
if (!/^afc_test_[a-f0-9]{32}$/.test(schema)) throw new Error('Invalid test schema');
const admin = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL });
let owned = false;
try {
  const exists =
    await admin.$queryRaw`SELECT schema_name FROM information_schema.schemata WHERE schema_name = ${schema}`;
  if (exists.length) throw new Error('Refusing to reuse an existing schema');
  await admin.$executeRawUnsafe(`CREATE SCHEMA "${schema}"`);
  owned = true;
  const env = { ...process.env };
  for (const key of ['DATABASE_URL', 'DIRECT_URL']) {
    const url = new URL(env[key]);
    url.searchParams.set('schema', schema);
    env[key] = url.toString();
  }
  for (const args of [
    ['scripts/prisma.mjs', 'migrate', 'deploy'],
    ['node_modules/tsx/dist/cli.mjs', '--test', 'tests/domain.test.ts', 'tests/confirmation.test.ts'],
  ]) {
    const result = spawnSync(process.execPath, args, { env, stdio: 'inherit' });
    if (result.status !== 0) throw new Error('PostgreSQL validation failed');
  }
} catch (error) {
  console.error(error.code || error.name, 'PostgreSQL validation failed.');
  process.exitCode = 1;
} finally {
  if (owned) {
    await admin.$executeRawUnsafe(`DROP SCHEMA "${schema}" CASCADE`);
    console.log('Isolated validation schema removed; AFC data was not modified.');
  }
  await admin.$disconnect();
}
