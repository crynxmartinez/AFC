import { ArenaPage } from '@/components/Arena';
import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const { slug = [] } = await params;
  if (slug[0] === 'entries' && slug[1]) {
    const entry = await db.entry.findFirst({
      where: { id: slug[1], status: 'APPROVED', contest: { status: { not: 'DRAFT' } } },
      include: {
        stages: { orderBy: { position: 'desc' }, take: 1 },
        author: { select: { name: true } },
      },
    });
    if (entry)
      return {
        title: `${entry.title} by ${entry.author.name} — AFC`,
        description: entry.description,
        openGraph: {
          title: entry.title,
          description: entry.description,
          images: entry.stages[0] ? [entry.stages[0].url] : [],
        },
      };
  }
  return { title: 'AFC — Arena for Creatives' };
}
export default async function Page({ params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug = [] } = await params;
  if (
    slug.length &&
    ![
      'contests',
      'entries',
      'submit',
      'saved',
      'wallet',
      'notifications',
      'profile',
      'settings',
      'login',
      'admin',
    ].includes(slug[0])
  )
    notFound();
  return <ArenaPage />;
}
