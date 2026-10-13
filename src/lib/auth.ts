import { randomBytes, scryptSync, timingSafeEqual, createHash } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { db } from './db';
export function hashPassword(password: string) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}
export function checkPassword(password: string, hash: string) {
  const [salt, value] = hash.split(':');
  if (!salt || !value) return false;
  const expected = Buffer.from(value, 'hex');
  const actual = scryptSync(password, salt, 64);
  return expected.length === actual.length && timingSafeEqual(expected, actual);
}
const tokenHash = (token: string) => createHash('sha256').update(token).digest('hex');
export async function currentUser() {
  const token = (await cookies()).get('afc_session')?.value;
  if (!token) return null;
  const session = await db.session.findUnique({
    where: { id: tokenHash(token) },
    include: { user: true },
  });
  return session && session.expiresAt > new Date() && !session.user.suspended ? session.user : null;
}
export async function startSession(userId: string) {
  const token = randomBytes(32).toString('hex');
  await db.session.create({
    data: { id: tokenHash(token), userId, expiresAt: new Date(Date.now() + 7 * 86400000) },
  });
  const h = await headers();
  (await cookies()).set('afc_session', token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.VERCEL === '1' || h.get('x-forwarded-proto') === 'https',
    path: '/',
    maxAge: 604800,
  });
}
export async function endSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get('afc_session')?.value;
  if (token) await db.session.deleteMany({ where: { id: tokenHash(token) } });
  cookieStore.delete('afc_session');
}
export function localDemo(host: string) {
  return (
    process.env.VERCEL !== '1' &&
    process.env.LOCAL_DEMO === 'true' &&
    /^(localhost|127\.0\.0\.1)(:\d+)?$/.test(host)
  );
}
