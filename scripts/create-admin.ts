import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';
const db = new PrismaClient({ datasourceUrl: process.env.DIRECT_URL || process.env.DATABASE_URL });
async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  if (!email || !password || password.length < 10)
    throw new Error('Supply ADMIN_EMAIL and ADMIN_PASSWORD (10+ characters).');
  // Never silently take over an existing account or overwrite its password.
  if (await db.user.findUnique({ where: { email } }))
    throw new Error('Account already exists; no changes made.');
  await db.user.create({
    data: {
      email,
      name: 'AFC Admin',
      password: hashPassword(password),
      role: 'ADMIN',
      ledger: {
        create: { amount: 100, description: 'Welcome bonus', eventKey: `welcome:${email}` },
      },
    },
  });
  console.log('Administrator created. No password was logged.');
}
main()
  .catch((error) => {
    console.error(
      'Admin setup failed; check required inputs and whether the account exists.',
      error.code || error.name,
    );
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
