// Mechanical mirror: models live in schema.prisma; production uses PostgreSQL.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const source = readFileSync('prisma/schema.prisma', 'utf8');
const postgres = source
  .replace('provider = "sqlite"', 'provider = "postgresql"')
  .replace(
    'url = env("DATABASE_URL")',
    'url = env("DATABASE_URL")\n  directUrl = env("DIRECT_URL")',
  );
mkdirSync('prisma/postgres', { recursive: true });
writeFileSync('prisma/postgres/schema.prisma', postgres);
