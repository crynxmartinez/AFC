import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { PrismaClient } from '@prisma/client';
import { del } from '@vercel/blob';
import sharp from 'sharp';
const base = 'http://127.0.0.1:3001';
const db = new PrismaClient();
let cookie = '';
let mediaKey;
try {
  assert.equal((await fetch(`${base}/api/health`)).status, 200);
  const initial = await (await fetch(`${base}/api/state`)).json();
  assert.equal(initial.demo, false);
  const action = (action, data = {}) =>
    fetch(`${base}/api/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: base, Cookie: cookie },
      body: JSON.stringify({ action, ...data }),
    });
  assert.equal((await action('demoLogin', { role: 'ADMIN' })).status, 403);
  const login = await action('login', {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
  });
  assert.equal(login.status, 200);
  cookie = login.headers.get('set-cookie').split(';')[0];
  const state = await (await fetch(`${base}/api/state`, { headers: { Cookie: cookie } })).json();
  assert.equal(state.me.role, 'ADMIN');
  assert.equal((await action('topup', { amount: 50 })).status, 403);
  const form = new FormData();
  const image = await sharp(await readFile('public/art/sketch.png'))
    .resize(640)
    .png()
    .toBuffer();
  form.set('file', new File([image], 'check.png', { type: 'image/png' }));
  const upload = await fetch(`${base}/api/upload`, {
    method: 'POST',
    headers: { Cookie: cookie, Origin: base },
    body: form,
  });
  assert.equal(upload.status, 200);
  const { url } = await upload.json();
  mediaKey = url.split('/').pop();
  assert.equal((await fetch(base + url)).status, 404);
  assert.equal((await fetch(base + url, { headers: { Cookie: cookie } })).status, 200);
  assert.equal((await action('logout')).status, 200);
  console.log(
    'Production HTTP verified: health, admin login, disabled demos/top-ups, private Blob upload/access.',
  );
} finally {
  if (cookie)
    await fetch(`${base}/api/action`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Origin: base, Cookie: cookie },
      body: JSON.stringify({ action: 'logout' }),
    });
  if (mediaKey) {
    const media = await db.media.findUnique({ where: { key: mediaKey } });
    if (media?.blobPath) await del(media.blobPath);
    await db.media.deleteMany({ where: { key: mediaKey } });
    console.log('Temporary HTTP-test upload and database record removed.');
  }
  await db.$disconnect();
}
