import assert from 'node:assert/strict';
import { PrismaClient } from '@prisma/client';
import { randomUUID } from 'node:crypto';
const db = new PrismaClient();
const base = 'http://127.0.0.1:3000';
const prefix = `ops-${randomUUID()}`;
const users = [0, 1, 2, 3].map((i) => `${prefix}-${i}`);
const contestId = prefix;
const entries = users.slice(0, 3).map((_, i) => `${prefix}-entry-${i}`);
async function main() {
  let cookie = '';
  const call = async (action: string, data: Record<string, unknown>, status = 200) => {
    const r = await fetch(base + '/api/action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: cookie, Origin: base },
      body: JSON.stringify({ action, ...data }),
    });
    const body = await r.json();
    assert.equal(r.status, status, JSON.stringify(body));
    return r;
  };
  try {
    await db.user.createMany({
      data: users.map((id, i) => ({
        id,
        email: `${id}@test.local`,
        name: `Operations test ${i}`,
        password: 'disabled',
      })),
    });
    await db.contest.create({
      data: {
        id: contestId,
        title: 'Operations test arena',
        type: 'ART',
        description: 'Temporary test contest',
        rules: 'Temporary rules for automated verification',
        banner: '/art/city.png',
        prize: 1000000,
        status: 'ACTIVE',
        startsAt: new Date(Date.now() - 1000),
        endsAt: new Date(Date.now() + 600000),
      },
    });
    for (let i = 0; i < 3; i++)
      await db.entry.create({
        data: {
          id: entries[i],
          authorId: users[i],
          contestId,
          title: `Operation entry ${i}`,
          status: 'PENDING',
          stages: {
            create: [
              { position: 0, label: 'Rough sketch', url: '/art/sketch.png' },
              { position: 1, label: 'Clean line art', url: '/art/lineart.png' },
              { position: 2, label: 'Final artwork', url: '/art/forest.png' },
            ],
          },
        },
      });
    const login = await call('demoLogin', { role: 'ADMIN' });
    cookie = login.headers.get('set-cookie')!.split(';')[0];
    for (const id of entries) await call('moderate', { id, status: 'APPROVED' });
    const guest = await fetch(base + '/api/state').then((r) => r.json());
    assert.equal(guest.entries.find((e: any) => e.id === entries[0]).stages.length, 3);
    await db.vote.createMany({
      data: [
        { userId: users[3], entryId: entries[0] },
        { userId: users[2], entryId: entries[0] },
        { userId: users[3], entryId: entries[1] },
      ],
    });
    await call('publishResults', { id: contestId, order: entries }, 400);
    await call('contestStatus', { id: contestId, status: 'CLOSED' });
    await call(
      'publishResults',
      { id: contestId, order: [entries[1], entries[0], entries[2]] },
      400,
    );
    await call('publishResults', { id: contestId, order: entries });
    const result = await db.contest.findUniqueOrThrow({
      where: { id: contestId },
      include: { winners: { orderBy: { place: 'asc' } } },
    });
    assert.equal(result.status, 'ANNOUNCED');
    assert.deepEqual(
      result.winners.map((w) => w.amount),
      [500000, 300000, 200000],
    );
    assert.deepEqual(
      result.winners.map((w) => w.voteCount),
      [2, 1, 0],
    );
    await call('publishResults', { id: contestId, order: entries }, 400);
    await call('moderate', { id: entries[0], status: 'DISQUALIFIED', note: 'Test reason' }, 400);
    console.log(
      'PASS: admin approval exposes all stages; early results refused; non-ranked winners refused; 50/30/20 results published; duplicate publishing and post-result moderation refused.',
    );
  } finally {
    await db.notification.deleteMany({ where: { userId: { in: users } } });
    await db.audit.deleteMany({
      where: { OR: [{ targetId: contestId }, { targetId: { in: entries } }] },
    });
    await db.winner.deleteMany({ where: { contestId } });
    await db.vote.deleteMany({ where: { entryId: { in: entries } } });
    await db.entry.deleteMany({ where: { contestId } });
    await db.contest.deleteMany({ where: { id: contestId } });
    await db.user.deleteMany({ where: { id: { in: users } } });
    await db.$disconnect();
  }
}
main().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
import './local-only';
