import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { get } from '@vercel/blob';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
export async function GET(_request: Request, context: { params: Promise<{ key: string }> }) {
  const { key } = await context.params;
  if (!/^[a-f0-9-]+\.webp$/.test(key)) return new Response('Not found', { status: 404 });
  const media = await db.media.findUnique({ where: { key } });
  if (!media) return new Response('Not found', { status: 404 });
  const url = `/api/media/${key}`;
  const [publicStage, avatar, me] = await Promise.all([
    db.stage.findFirst({
      where: { url, entry: { status: 'APPROVED', contest: { status: { not: 'DRAFT' } } } },
    }),
    db.user.findFirst({ where: { avatar: url } }),
    currentUser(),
  ]);
  if (!publicStage && !avatar && me?.id !== media.ownerId && me?.role !== 'ADMIN')
    return new Response('Not found', { status: 404 });
  try {
    if (media.blobPath) {
      const result = await get(media.blobPath, { access: 'private' });
      if (result?.statusCode !== 200) return new Response('Not found', { status: 404 });
      return new Response(result.stream, {
        headers: {
          'Content-Type': 'image/webp',
          'Cache-Control': 'private, no-store',
          'X-Content-Type-Options': 'nosniff',
        },
      });
    }
    const bytes = await readFile(path.join(process.cwd(), 'storage', 'uploads', key));
    return new Response(bytes, {
      headers: {
        'Content-Type': 'image/webp',
        'Cache-Control': 'private, no-store',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
