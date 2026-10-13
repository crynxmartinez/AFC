import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pageMetadata, siteUrl } from '../src/lib/seo';

test('social previews have canonical URLs, absolute images and a large card', () => {
  const metadata = pageMetadata('AFC test', 'A clear description', '/contests');
  assert.equal(metadata.alternates?.canonical, '/contests');
  assert.equal((metadata.twitter as { card: string }).card, 'summary_large_image');
  assert.deepEqual(metadata.openGraph?.images, [
    { url: `${siteUrl}/share-image`, alt: 'AFC test', width: 1200, height: 630 },
  ]);
});
test('entry previews use the public artwork image and normalize descriptions', () => {
  const metadata = pageMetadata(
    'Artwork by creator',
    ' A\n creative   process ',
    '/entries/example',
    '/api/media/example.webp',
  );
  assert.equal(metadata.description, 'A creative process');
  assert.deepEqual(metadata.openGraph?.images, [
    { url: `${siteUrl}/api/media/example.webp`, alt: 'Artwork by creator' },
  ]);
});
