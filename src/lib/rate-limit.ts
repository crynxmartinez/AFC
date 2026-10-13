import { createHash } from 'node:crypto';
import { db } from './db';
import { AppError } from './domain';

// Atomic upsert shared by every serverless instance. Store no raw IP/email.
export async function throttle(key: string, limit = 20) {
  const minute = Math.floor(Date.now() / 60000);
  const id = createHash('sha256').update(`${minute}:${key}`).digest('hex');
  const bucket = await db.rateLimit.upsert({
    where: { id },
    create: { id, count: 1, expiresAt: new Date((minute + 2) * 60000) },
    update: { count: { increment: 1 } },
  });
  if (bucket.count > limit) throw new AppError('Please wait a minute before trying again.', 429);
  if (Math.random() < 0.01) {
    await db.rateLimit.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  }
}
