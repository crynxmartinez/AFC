// Fixture suites must never run against the production account database.
import { loadEnvFile } from 'node:process';
if (!process.env.DATABASE_URL) loadEnvFile('.env');
const testSchema =
  /^postgres(ql)?:/.test(process.env.DATABASE_URL || '') &&
  /^afc_test_[a-f0-9]{32}$/.test(
    new URL(process.env.DATABASE_URL!).searchParams.get('schema') || '',
  );
if (process.env.VERCEL || (!process.env.DATABASE_URL?.startsWith('file:') && !testSchema)) {
  throw new Error('Fixture tests require local SQLite. Do not run them against production.');
}
