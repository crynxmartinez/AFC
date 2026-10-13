import './local-only';
import { after, before, test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { castVote, demoCredit, isOpen, prizeSplit, stageLabels } from '../src/lib/domain';
const db = new PrismaClient();
const prefix = `test-${randomUUID()}`;
const voter = prefix + '-voter';
const author = prefix + '-author';
const contestId = prefix + '-contest';
const entryId = prefix + '-entry';
before(async () => {
  await db.user.createMany({
    data: [
      {
        id: voter,
        email: `${voter}@test.local`,
        name: 'Test voter',
        password: 'disabled',
        balance: 2,
      },
      { id: author, email: `${author}@test.local`, name: 'Test author', password: 'disabled' },
    ],
  });
  await db.contest.create({
    data: {
      id: contestId,
      title: 'Test contest',
      description: 'Test',
      type: 'ART',
      banner: '',
      rules: 'Test',
      status: 'ACTIVE',
      startsAt: new Date(Date.now() - 10000),
      endsAt: new Date(Date.now() + 600000),
    },
  });
  await db.entry.create({
    data: { id: entryId, title: 'Test entry', authorId: author, contestId, status: 'APPROVED' },
  });
});
after(async () => {
  await db.ledger.deleteMany({ where: { userId: { in: [voter, author] } } });
  await db.vote.deleteMany({ where: { entryId } });
  await db.entry.delete({ where: { id: entryId } });
  await db.contest.delete({ where: { id: contestId } });
  await db.user.deleteMany({ where: { id: { in: [voter, author] } } });
  await db.$disconnect();
});
test('public process contracts are exactly three art stages and two cosplay stages', () => {
  assert.equal(stageLabels('ART').length, 3);
  assert.deepEqual(stageLabels('COSPLAY'), ['The costume', 'Cosplayer in costume']);
});
test('deadline is exclusive and the opening instant inclusive', () => {
  const now = new Date();
  assert.equal(isOpen({ status: 'ACTIVE', startsAt: now, endsAt: new Date(+now + 1) }, now), true);
  assert.equal(isOpen({ status: 'ACTIVE', startsAt: new Date(+now - 1), endsAt: now }, now), false);
});
test('cash split conserves centavos', () => {
  assert.deepEqual(prizeSplit(1000000), [500000, 300000, 200000]);
  assert.equal(
    prizeSplit(101).reduce((a, b) => a + b),
    101,
  );
});
test('ten simultaneous repeat votes create one debit and one vote', async () => {
  const results = await Promise.allSettled(
    Array.from({ length: 10 }, () => castVote(db, voter, entryId)),
  );
  assert.ok(results.some((r) => r.status === 'fulfilled'));
  assert.equal(await db.vote.count({ where: { userId: voter, entryId } }), 1);
  assert.equal((await db.user.findUniqueOrThrow({ where: { id: voter } })).balance, 1);
  assert.equal(await db.ledger.count({ where: { userId: voter, amount: -1 } }), 1);
  await castVote(db, voter, entryId);
  assert.equal((await db.user.findUniqueOrThrow({ where: { id: voter } })).balance, 1);
});
test('self votes and closed contest votes are refused', async () => {
  await assert.rejects(() => castVote(db, author, entryId), /own entry/);
  await db.contest.update({ where: { id: contestId }, data: { status: 'CLOSED' } });
  await assert.rejects(() => castVote(db, voter, entryId), /closed/);
  await db.contest.update({ where: { id: contestId }, data: { status: 'ACTIVE' } });
});
test('top-up retry credits only once', async () => {
  const key = randomUUID();
  await demoCredit(db, voter, 50, key);
  await demoCredit(db, voter, 50, key);
  assert.equal((await db.user.findUniqueOrThrow({ where: { id: voter } })).balance, 51);
  assert.equal(await db.ledger.count({ where: { eventKey: `demo:${voter}:${key}` } }), 1);
});
