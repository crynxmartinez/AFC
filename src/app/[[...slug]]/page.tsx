import { ArenaPage } from '@/components/Arena';
import { db } from '@/lib/db';
import { currentUser } from '@/lib/auth';
import { pageMetadata, siteDescription, siteUrl } from '@/lib/seo';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { cache } from 'react';
type Props = { params: Promise<{ slug?: string[] }> };
const entryById = cache((id: string) =>
  db.entry.findUnique({
    where: { id },
    include: {
      stages: { orderBy: { position: 'desc' }, take: 1 },
      author: { select: { name: true } },
      contest: true,
    },
  }),
);
const contestById = cache((id: string) => db.contest.findUnique({ where: { id } }));
const personById = cache((id: string) =>
  db.user.findFirst({
    where: { id, suspended: false, NOT: { id: { startsWith: 'seed-voter-' } } },
    select: { name: true, bio: true, avatar: true },
  }),
);
const privateMetadata: Metadata = {
  ...pageMetadata('Your account — AFC', 'Sign in to manage your AFC account.', '/login'),
  robots: { index: false, follow: false },
  alternates: { canonical: null },
};
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug = [] } = await params;
  const [section, id] = slug;
  const path = '/' + slug.map(encodeURIComponent).join('/');
  if (!section)
    return pageMetadata('AFC — Art & Cosplay Contests for Creatives', siteDescription, '/');
  if (section === 'contests' && !id)
    return pageMetadata(
      'Art & Cosplay Contests — AFC',
      'Explore art and cosplay contests. Discover creators, view their creative process, and support your favorites.',
      path,
    );
  if (section === 'entries' && id) {
    const entry = await entryById(id);
    if (entry?.status === 'APPROVED' && entry.contest.status !== 'DRAFT')
      return pageMetadata(
        `${entry.title} by ${entry.author.name} — AFC`,
        `${entry.description || entry.title} — ${entry.contest.title}. Explore the creative process on AFC.`,
        path,
        entry.stages[0]?.url,
      );
  }
  if (section === 'contests' && id) {
    const contest = await contestById(id);
    if (contest && contest.status !== 'DRAFT')
      return pageMetadata(
        `${contest.title} — AFC Contest`,
        contest.description,
        path,
        contest.banner,
      );
  }
  if (section === 'profile' && id && id !== 'me') {
    const person = await personById(id);
    if (person)
      return pageMetadata(
        `${person.name} — AFC Creator`,
        person.bio || `Explore ${person.name}'s art, cosplay, and creative process on AFC.`,
        path,
        person.avatar,
      );
  }
  return privateMetadata;
}
export default async function Page({ params }: Props) {
  const { slug = [] } = await params;
  const [section, id] = slug;
  const single = [
    'submit',
    'saved',
    'wallet',
    'notifications',
    'settings',
    'login',
    'confirm-email',
    'admin',
  ];
  if (
    slug.length > 2 ||
    (section && !['entries', 'contests', 'profile', ...single].includes(section)) ||
    (single.includes(section) && id) ||
    (section === 'entries' && !id)
  )
    notFound();
  if (section === 'entries' && id) {
    const entry = await entryById(id);
    if (!entry) notFound();
    if (entry.status !== 'APPROVED' || entry.contest.status === 'DRAFT') {
      const me = await currentUser();
      if (!me || (me.role !== 'ADMIN' && me.id !== entry.authorId)) notFound();
    }
  }
  if (section === 'contests' && id) {
    const contest = await contestById(id);
    if (!contest || (contest.status === 'DRAFT' && (await currentUser())?.role !== 'ADMIN'))
      notFound();
  }
  if (section === 'profile' && id && id !== 'me' && !(await personById(id))) notFound();
  return (
    <>
      {!section && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'AFC — Arena for Creatives',
              url: siteUrl,
              description: siteDescription,
            }).replace(/</g, '\\u003c'),
          }}
        />
      )}
      <ArenaPage />
    </>
  );
}
