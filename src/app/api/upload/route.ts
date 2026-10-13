import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import { put, del } from '@vercel/blob';
import { currentUser } from '@/lib/auth';
import { db } from '@/lib/db';
export async function POST(request: Request) {
  const me = await currentUser();
  if (!me) return Response.json({ error: 'Sign in to upload.' }, { status: 401 });
  const origin = request.headers.get('origin');
  if (origin && new URL(origin).host !== request.headers.get('host'))
    return Response.json({ error: 'Invalid origin.' }, { status: 403 });
  if (Number(request.headers.get('content-length') || 0) > 3.5 * 1024 * 1024)
    return Response.json({ error: 'Use an image smaller than 3 MB.' }, { status: 413 });
  const useBlob = process.env.STORAGE_PROVIDER === 'blob' || process.env.VERCEL === '1';
  if (useBlob && !process.env.BLOB_READ_WRITE_TOKEN)
    return Response.json({ error: 'Image storage is not configured yet.' }, { status: 503 });
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (
      !(file instanceof File) ||
      file.size > 3 * 1024 * 1024 ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    )
      return Response.json(
        { error: 'Choose a JPG, PNG or WebP image under 3 MB.' },
        { status: 400 },
      );
    const bytes = Buffer.from(await file.arrayBuffer());
    const normalized = await sharp(bytes, { limitInputPixels: 40000000 })
      .rotate()
      .resize(2400, 2400, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 88 })
      .toBuffer();
    const key = `${randomUUID()}.webp`;
    if (useBlob) {
      const blob = await put(`afc/${key}`, normalized, {
        access: 'private',
        contentType: 'image/webp',
        addRandomSuffix: false,
      });
      try {
        await db.media.create({ data: { ownerId: me.id, key, blobPath: blob.pathname } });
      } catch (error) {
        await del(blob.url).catch(() => {});
        throw error;
      }
    } else {
      const dir = path.join(process.cwd(), 'storage', 'uploads');
      await mkdir(dir, { recursive: true });
      await writeFile(path.join(dir, key), normalized);
      await db.media.create({ data: { ownerId: me.id, key } });
    }
    return Response.json({ url: `/api/media/${key}` });
  } catch {
    return Response.json(
      { error: 'This image could not be read. Try a different file.' },
      { status: 400 },
    );
  }
}
