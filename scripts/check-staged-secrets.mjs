import { spawnSync } from 'node:child_process';
import { parseEnv } from 'node:util';
import { readFileSync } from 'node:fs';
const git = (...args) => {
  const result = spawnSync(
    'git',
    ['-c', `safe.directory=${process.cwd().replaceAll('\\', '/')}`, ...args],
    { encoding: 'utf8', maxBuffer: 50 * 1024 * 1024 },
  );
  if (result.status !== 0) throw new Error('Git inspection failed');
  return result.stdout;
};
const env = {
  ...parseEnv(readFileSync('.env.vercel', 'utf8')),
  ...parseEnv(readFileSync('.env.admin', 'utf8')),
};
const secrets = [
  env.GHL_API_TOKEN,
  env.DATABASE_URL,
  env.DIRECT_URL,
  env.BLOB_READ_WRITE_TOKEN,
  env.ADMIN_PASSWORD,
  new URL(env.DATABASE_URL).username,
  new URL(env.DATABASE_URL).password,
];
const files = git('ls-files', '-z').split('\0').filter(Boolean);
const bad = [];
for (const file of files) {
  const data = git('show', `:${file}`);
  if (secrets.some((secret) => secret && data.includes(secret))) bad.push(file);
}
if (bad.length) {
  console.error('Secrets detected in staged files:', bad);
  process.exitCode = 1;
} else
  console.log(
    `Secret scan passed for ${files.length} staged files. No supplied credentials are tracked.`,
  );
