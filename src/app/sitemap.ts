import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { publicEntry, siteUrl } from '@/lib/seo';
export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [contests, entries, people] = await Promise.all([
    db.contest.findMany({ where: { status: { not: 'DRAFT' } }, select: { id: true } }),
    db.entry.findMany({ where: publicEntry, select: { id: true, updatedAt: true } }),
    db.user.findMany({
      where: {
        suspended: false,
        entries: { some: publicEntry },
        NOT: { id: { startsWith: 'seed-voter-' } },
      },
      select: { id: true },
    }),
  ]);
  return [
    { url: siteUrl },
    { url: `${siteUrl}/contests` },
    ...contests.map((c) => ({ url: `${siteUrl}/contests/${encodeURIComponent(c.id)}` })),
    ...entries.map((e) => ({
      url: `${siteUrl}/entries/${encodeURIComponent(e.id)}`,
      lastModified: e.updatedAt,
    })),
    ...people.map((p) => ({ url: `${siteUrl}/profile/${encodeURIComponent(p.id)}` })),
  ];
}
