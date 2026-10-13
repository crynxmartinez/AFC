import './local-only';
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { confirmationHash, issueConfirmation, confirmEmail } from '../src/lib/confirmation';
import { sendConfirmationEmail } from '../src/lib/confirmation-email';

test('confirmation tokens expire, are hashed, and grant welcome points exactly once', async () => {
  const db = new PrismaClient();
  const id = `confirm-test-${randomUUID()}`;
  try {
    await db.user.create({
      data: {
        id,
        email: `${id}@test.local`,
        name: 'Confirmation test',
        password: 'disabled',
        balance: 0,
      },
    });
    const expired = await issueConfirmation(db, id);
    await db.emailConfirmation.update({
      where: { id: confirmationHash(expired) },
      data: { expiresAt: new Date(0) },
    });
    await assert.rejects(confirmEmail(db, expired), /expired/);
    await assert.rejects(confirmEmail(db, 'x'.repeat(64)), /invalid/);
    assert.equal((await db.user.findUniqueOrThrow({ where: { id } })).balance, 0);
    const token = await issueConfirmation(db, id);
    const stored = await db.emailConfirmation.findUniqueOrThrow({
      where: { id: confirmationHash(token) },
    });
    assert.notEqual(stored.id, token);
    const results = await Promise.allSettled([confirmEmail(db, token), confirmEmail(db, token)]);
    assert.equal(results.filter((r) => r.status === 'fulfilled').length, 1);
    assert.equal((await db.user.findUniqueOrThrow({ where: { id } })).balance, 100);
    assert.ok((await db.user.findUniqueOrThrow({ where: { id } })).emailVerifiedAt);
    assert.equal(await db.ledger.count({ where: { userId: id } }), 1);
    assert.equal(await db.emailConfirmation.count({ where: { userId: id } }), 0);
    await assert.rejects(confirmEmail(db, token), /invalid/);
  } finally {
    await db.ledger.deleteMany({ where: { userId: id } });
    await db.user.deleteMany({ where: { id } });
    await db.$disconnect();
  }
});

test('GHL sends only confirmation email and adds afc without replacing tags', async () => {
  const before = { ...process.env };
  Object.assign(process.env, {
    GHL_API_TOKEN: 'test-token',
    GHL_LOCATION_ID: 'test-location',
    GHL_FROM_EMAIL: 'AFC <sender@example.com>',
    APP_URL: 'https://example.com',
  });
  const calls: { url: string; body: Record<string, unknown> }[] = [];
  const send: typeof fetch = async (url, options) => {
    calls.push({ url: String(url), body: JSON.parse(String(options?.body)) });
    if (calls.length === 1)
      return Response.json({
        contact: { id: 'contact-1', email: 'member@example.com', locationId: 'test-location' },
      });
    if (calls.length === 2) return Response.json({ tags: ['existing', 'afc'] });
    return Response.json({ messageId: 'message-1' });
  };
  try {
    await sendConfirmationEmail('member@example.com', 'a'.repeat(64), send);
    assert.deepEqual(calls[0].body, { locationId: 'test-location', email: 'member@example.com' });
    assert.deepEqual(calls[1].body, { tags: ['afc'] });
    assert.equal(calls[2].body.type, 'Email');
    assert.equal(calls[2].body.emailFrom, 'AFC <sender@example.com>');
    assert.match(String(calls[2].body.html), /Confirm email/);
    assert.match(String(calls[2].body.html), /confirm-email#aaaa/);
    assert.equal(calls.length, 3);
    await assert.rejects(
      sendConfirmationEmail(
        'member@example.com',
        'b'.repeat(64),
        async () => new Response('', { status: 403 }),
      ),
      /could not send/,
    );
  } finally {
    for (const key of ['GHL_API_TOKEN', 'GHL_LOCATION_ID', 'GHL_FROM_EMAIL', 'APP_URL']) {
      if (before[key] === undefined) delete process.env[key];
      else process.env[key] = before[key];
    }
  }
});
