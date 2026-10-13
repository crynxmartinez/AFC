import { db } from './db';
import { currentUser, localDemo } from './auth';
import { headers } from 'next/headers';
export async function getState() {
  await db.contest.updateMany({
    where: { status: 'ACTIVE', endsAt: { lte: new Date() } },
    data: { status: 'CLOSED' },
  });
  const me = await currentUser();
  const admin = me?.role === 'ADMIN';
  if (me?.notifyContests) {
    const interested = await db.bookmark.findMany({ where: { userId: me.id, kind: 'CONTEST' } });
    const ending = await db.contest.findMany({
      where: {
        status: 'ACTIVE',
        endsAt: { gt: new Date(), lte: new Date(Date.now() + 86400000) },
        OR: [
          { id: { in: interested.map((b) => b.targetId) } },
          { entries: { some: { authorId: me.id } } },
        ],
      },
    });
    for (const contest of ending) {
      const id = `deadline:${me.id}:${contest.id}`;
      await db.notification.upsert({
        where: { id },
        create: {
          id,
          userId: me.id,
          title: 'An arena you follow closes soon',
          body: `${contest.title}: submissions and voting end within 24 hours.`,
          href: `/contests/${contest.id}`,
        },
        update: {},
      });
    }
  }
  const [
    contests,
    entries,
    people,
    bookmarks,
    ledger,
    notifications,
    follows,
    myVotes,
    reports,
    audits,
  ] = await Promise.all([
    db.contest.findMany({
      where: admin ? {} : { status: { not: 'DRAFT' } },
      include: { winners: { orderBy: { place: 'asc' } } },
      orderBy: { createdAt: 'asc' },
    }),
    db.entry.findMany({
      where: admin
        ? {}
        : {
            OR: [
              { status: 'APPROVED', contest: { status: { not: 'DRAFT' } } },
              ...(me ? [{ authorId: me.id }] : []),
            ],
          },
      include: {
        stages: { orderBy: { position: 'asc' } },
        _count: { select: { votes: true } },
        comments: {
          where: admin ? {} : { hidden: false },
          include: { user: { select: { id: true, name: true, avatar: true } } },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    }),
    db.user.findMany({
      where: { NOT: { id: { startsWith: 'seed-voter-' } } },
      select: {
        id: true,
        name: true,
        bio: true,
        avatar: true,
        featuredEntryId: true,
        ...(admin ? { suspended: true, role: true } : {}),
      },
    }),
    me ? db.bookmark.findMany({ where: { userId: me.id } }) : [],
    me ? db.ledger.findMany({ where: { userId: me.id }, orderBy: { createdAt: 'desc' } }) : [],
    me
      ? db.notification.findMany({ where: { userId: me.id }, orderBy: { createdAt: 'desc' } })
      : [],
    db.follow.findMany(),
    me ? db.vote.findMany({ where: { userId: me.id }, select: { entryId: true } }) : [],
    admin ? db.report.findMany({ orderBy: { createdAt: 'desc' } }) : [],
    admin ? db.audit.findMany({ take: 30, orderBy: { createdAt: 'desc' } }) : [],
  ]);
  return {
    me: me
      ? {
          id: me.id,
          name: me.name,
          email: me.email,
          avatar: me.avatar,
          bio: me.bio,
          balance: me.balance,
          role: me.role,
          notifyActivity: me.notifyActivity,
          notifyContests: me.notifyContests,
        }
      : null,
    contests,
    entries: entries.map((e) => ({ ...e, voteCount: e._count.votes })),
    people,
    bookmarks,
    ledger,
    notifications,
    follows,
    myVotes: myVotes.map((v) => v.entryId),
    reports,
    audits,
    demo: localDemo((await headers()).get('host') || ''),
  };
}
