import './local-only';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { issueConfirmation } from '../src/lib/confirmation';
const db = new PrismaClient();
const base = 'http://127.0.0.1:3002';
const email = `confirmation-http-${randomUUID()}@test.local`;
const password = randomUUID();
let id = '';
async function main() {
  const call = (action: string, data = {}) =>
    fetch(`${base}/api/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: base },
      body: JSON.stringify({ action, ...data }),
    });
  try {
    const state = await (await fetch(`${base}/api/state`)).json();
    assert.equal(state.demo, false, 'Run this check on the no-demo, no-GHL test server.');
    const registration = await call('register', { email, password, name: 'Confirmation test' });
    assert.equal(
      registration.status,
      503,
      'Missing mail configuration must not silently activate the account.',
    );
    const user = await db.user.findUniqueOrThrow({ where: { email } });
    id = user.id;
    assert.equal(user.balance, 0);
    assert.equal(user.emailVerifiedAt, null);
    const pendingLogin = await call('login', { email, password });
    assert.equal((await pendingLogin.json()).confirmationRequired, true);
    assert.equal(pendingLogin.headers.get('set-cookie'), null);
    assert.equal((await call('vote', { id: 'keeper' })).status, 401);
    const token = await issueConfirmation(db, id);
    const confirmation = await call('confirmEmail', { token });
    assert.equal(confirmation.status, 200);
    assert.equal(confirmation.headers.get('set-cookie'), null);
    assert.equal((await call('confirmEmail', { token })).status, 400);
    const login = await call('login', { email, password });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie')!.split(';')[0];
    const member = await (await fetch(`${base}/api/state`, { headers: { Cookie: cookie } })).json();
    assert.equal(member.me.balance, 100);
    console.log(
      'PASS: send failure leaves pending account; unconfirmed login/vote blocked; confirmation single-use; no auto-login; confirmed login and one-time points work.',
    );
  } finally {
    if (!id) id = (await db.user.findUnique({ where: { email } }))?.id || '';
    if (id) {
      await db.ledger.deleteMany({ where: { userId: id } });
      await db.user.delete({ where: { id } });
    }
    await db.$disconnect();
  }
}
main().catch(() => {
  console.error('Confirmation HTTP validation failed.');
  process.exitCode = 1;
});
