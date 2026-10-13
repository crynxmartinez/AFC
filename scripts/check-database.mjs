import { PrismaClient } from '@prisma/client';
const db = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL });
try {
  const tables =
    await db.$queryRaw`SELECT table_schema, table_name FROM information_schema.tables WHERE table_schema NOT IN ('pg_catalog', 'information_schema') ORDER BY table_schema, table_name`;
  console.log(JSON.stringify(tables));
} catch (error) {
  console.error('Database inspection failed.', error.code || error.name);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
