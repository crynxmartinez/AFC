import { randomUUID } from 'node:crypto';
import { put, get, del } from '@vercel/blob';
const marker = `AFC storage check ${randomUUID()}`;
let blob;
try {
  blob = await put(`afc-healthcheck/${randomUUID()}.txt`, marker, {
    access: 'private',
    addRandomSuffix: false,
  });
  const result = await get(blob.pathname, { access: 'private' });
  if (result?.statusCode !== 200 || (await new Response(result.stream).text()) !== marker)
    throw new Error('Round-trip failed');
  const anonymous = await fetch(blob.url);
  if (anonymous.ok) throw new Error('Blob unexpectedly readable without authentication');
  console.log('Private Blob upload/read verified; anonymous access denied.');
} catch {
  console.error('Blob verification failed. Check the private store and token.');
  process.exitCode = 1;
} finally {
  if (blob) {
    await del(blob.url);
    console.log('Temporary verification blob deleted.');
  }
}
