import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import sharp from 'sharp';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
const base = 'http://127.0.0.1:3000';
const db = new PrismaClient();
const stamp = randomUUID();
let cookie = '';
let userId = '';
let entryId = '';
let mediaKey = '';
async function action(
  action: string,
  data: Record<string, unknown> = {},
  status = 200,
  auth = cookie,
) {
  const r = await fetch(base + '/api/action', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: base, Cookie: auth },
    body: JSON.stringify({ action, ...data }),
  });
  const d = await r.json();
  assert.equal(r.status, status, JSON.stringify(d));
  return { r, d };
}
async function main() {
  try {
    const guest = await fetch(base + '/api/state').then((r) => r.json());
    assert.equal(guest.me, null);
    assert.equal(guest.entries.find((e: any) => e.id === 'keeper').stages.length, 3);
    assert.equal(guest.entries.find((e: any) => e.id === 'moonlit-valkyrie').stages.length, 2);
    assert.ok(!JSON.stringify(guest).includes('password'));
    const reg = await action('register', {
      email: `http-${stamp}@test.local`,
      name: 'Integration Tester',
      password: 'TestingAfc2026!',
    });
    cookie = reg.r.headers.get('set-cookie')!.split(';')[0];
    let s = await fetch(base + '/api/state', { headers: { Cookie: cookie } }).then((r) => r.json());
    userId = s.me.id;
    assert.equal(s.me.balance, 100);
    assert.equal(s.ledger.length, 1);
    await action('contestStatus', { id: 'myth-magic', status: 'CLOSED' }, 403);
    const upload = new FormData();
    upload.set(
      'file',
      new Blob(
        [
          await sharp(await readFile('public/art/sketch.png'))
            .resize(640)
            .png()
            .toBuffer(),
        ],
        { type: 'image/png' },
      ),
      'sketch.png',
    );
    const ur = await fetch(base + '/api/upload', {
      method: 'POST',
      headers: { Cookie: cookie, Origin: base },
      body: upload,
    });
    const ud = await ur.json();
    assert.equal(ur.status, 200, JSON.stringify(ud));
    mediaKey = ud.url.split('/').pop();
    assert.equal((await fetch(base + ud.url)).status, 404);
    assert.equal((await fetch(base + ud.url, { headers: { Cookie: cookie } })).status, 200);
    await action(
      'saveEntry',
      {
        contestId: 'myth-magic',
        title: 'Test draft',
        description: 'Integration check',
        stages: [ud.url],
        submit: true,
        rulesAccepted: true,
      },
      400,
    );
    const saved = await action('saveEntry', {
      contestId: 'myth-magic',
      title: 'Test draft',
      description: 'Integration check',
      stages: [ud.url],
      submit: false,
    });
    entryId = saved.d.id;
    const guest2 = await fetch(base + '/api/state').then((r) => r.json());
    assert.ok(!guest2.entries.some((e: any) => e.id === entryId));
    await action('vote', { id: 'keeper' });
    await action('vote', { id: 'keeper' });
    s = await fetch(base + '/api/state', { headers: { Cookie: cookie } }).then((r) => r.json());
    assert.equal(s.me.balance, 99);
    assert.equal(s.myVotes.length, 1);
    const key = randomUUID();
    await action('topup', { amount: 50, key });
    await action('topup', { amount: 50, key });
    s = await fetch(base + '/api/state', { headers: { Cookie: cookie } }).then((r) => r.json());
    assert.equal(s.me.balance, 149);
    await action('bookmark', { id: 'keeper', kind: 'ENTRY' });
    await action('follow', { id: 'mika' });
    await action('comment', { id: 'keeper', body: 'Integration test comment' });
    await action('report', { id: 'keeper', kind: 'ENTRY', reason: 'Integration test report' });
    console.log(
      'PASS: public 3/2 stages, registration credit, admin authorization, upload privacy, incomplete submission rejection, draft privacy, voting idempotency, top-up idempotency, bookmarks, follows, comments, reports.',
    );
  } finally {
    if (userId) {
      await db.report.deleteMany({ where: { reporterId: userId } });
      await db.notification.deleteMany({ where: { body: { startsWith: 'Integration Tester:' } } });
      await db.comment.deleteMany({ where: { userId } });
      await db.follow.deleteMany({ where: { followerId: userId } });
      await db.bookmark.deleteMany({ where: { userId } });
      await db.ledger.deleteMany({ where: { userId } });
      await db.vote.deleteMany({ where: { userId } });
      if (entryId) await db.entry.delete({ where: { id: entryId } });
      await db.media.deleteMany({ where: { ownerId: userId } });
      await db.user.delete({ where: { id: userId } });
    }
    await db.$disconnect();
  }
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
import './local-only';
