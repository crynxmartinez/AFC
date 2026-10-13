import { PrismaClient } from '@prisma/client';
const url = new URL(process.env.DATABASE_URL);
if (process.argv.includes('--pgbouncer')) url.searchParams.set('pgbouncer', 'true');
url.searchParams.set('connect_timeout', '30');
url.searchParams.set('connection_limit', '3');
const db = new PrismaClient({ datasourceUrl: url.toString() });
try {
  await db.$queryRaw`SELECT 1`;
  console.log('Pooled runtime connection verified.');
} catch (error) {
  let message = String(error.message);
  for (const key of ['DATABASE_URL', 'DIRECT_URL']) {
    if (process.env[key]) {
      const url = new URL(process.env[key]);
      for (const value of [process.env[key], url.username, url.password])
        message = message.split(value).join('[redacted]');
    }
  }
  console.error(message);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
