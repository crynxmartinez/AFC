import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/auth';
const db = new PrismaClient();
async function main() {
  if (process.env.VERCEL || !process.env.DATABASE_URL?.startsWith('file:')) {
    throw new Error('Demo seeding is only allowed against local SQLite.');
  }
  if (await db.user.findUnique({ where: { id: 'demo-admin' } })) {
    console.log('Seed already present; existing data preserved.');
    return;
  }
  const password = hashPassword('AfcLocal2026!');
  const users = [
    ['demo-admin', 'Arena Team', 'ADMIN'],
    ['demo-member', 'Luna Reyes', 'USER'],
    ['mika', 'Mika Reyes', 'USER'],
    ['kael', 'Kael Ardyn', 'USER'],
    ['elise', 'Elise Marlow', 'USER'],
    ['rin', 'Rin Sato', 'USER'],
    ['orin', 'Orin Vale', 'USER'],
    ['sera', 'Sera Kim', 'USER'],
  ];
  for (const [id, name, role] of users)
    await db.user.create({
      data: {
        id,
        name,
        role,
        email: `${id}@afc.local`,
        password,
        bio:
          id === 'demo-member'
            ? 'Making small things, dreaming up big worlds. Art lover & aspiring creator.'
            : 'An imagination at work. Sharing my creative journey, one arena at a time.',
        ledger: {
          create: { amount: 100, description: 'Welcome bonus', eventKey: `welcome:${id}` },
        },
      },
    });
  const start = new Date(Date.now() - 3 * 86400000);
  const end = new Date(Date.now() + 7 * 86400000);
  const rules =
    'Create original work inspired by the theme.\nArt entries must include rough sketch, clean line art, and final artwork. Cosplay entries must show the costume and you wearing it. Every stage is public.\nOne entry per creator. One permanent vote per account per entry, costing 1 point. No self-voting.\nSubmissions and voting close together at the displayed deadline. Earlier submissions have more time to receive votes.\nGenerative AI entries and stolen work are not eligible. Sample images in this local demo are generated placeholders.\nThe top three eligible entries win 50%, 30%, and 20% of the cash prize pool. Ties are resolved by the admin with a published explanation.\nVotes are final, including if an entry is later disqualified. Prize fulfillment will be coordinated by the organizer.';
  for (const c of [
    {
      id: 'myth-magic',
      title: 'Myth & Magic',
      description:
        'Some worlds only exist in your imagination. Bring yours to life. Create an original artwork inspired by mythical creatures, forgotten kingdoms, and a little magic.',
      type: 'ART',
      banner: '/art/city.png',
      prize: 1000000,
    },
    {
      id: 'cosplay-spotlight',
      title: 'Cosplay Spotlight',
      description:
        'From the first stitch to the final transformation. Show us the character you become, and the costume that makes it possible.',
      type: 'COSPLAY',
      banner: '/art/cosplay.png',
      prize: 1500000,
    },
    {
      id: 'wild-at-heart',
      title: 'Wild at Heart',
      description:
        'A celebration of the extraordinary natural world. Paint a story that brings us closer to it.',
      type: 'ART',
      banner: '/art/forest.png',
      prize: 500000,
    },
  ])
    await db.contest.create({
      data: { ...c, rules, status: 'ACTIVE', startsAt: start, endsAt: end },
    });
  const entries = [
    ['keeper', 'Keeper of the forest', 'mika', 'myth-magic', 'forest'],
    ['last-companion', 'The last companion', 'kael', 'myth-magic', 'dragon'],
    ['cities-above', 'Cities above', 'elise', 'myth-magic', 'city'],
    ['moonlit-valkyrie', 'Moonlit valkyrie', 'rin', 'cosplay-spotlight', 'cosplay'],
    ['golden-hour', 'Golden hour', 'orin', 'wild-at-heart', 'forest'],
    ['silver-oath', 'The silver oath', 'sera', 'cosplay-spotlight', 'cosplay'],
    ['beyond-clouds', 'Beyond the clouds', 'orin', 'myth-magic', 'city'],
    ['ancient-friend', 'An ancient friend', 'sera', 'myth-magic', 'dragon'],
  ];
  for (const [id, title, authorId, contestId, art] of entries) {
    const cosplay = contestId === 'cosplay-spotlight';
    const stages = cosplay
      ? [
          { label: 'The costume', url: '/art/costume.png' },
          { label: 'Cosplayer in costume', url: '/art/cosplay.png' },
        ]
      : [
          { label: 'Rough sketch', url: '/art/sketch.png' },
          { label: 'Clean line art', url: '/art/lineart.png' },
          { label: 'Final artwork', url: `/art/${art}.png` },
        ];
    await db.entry.create({
      data: {
        id,
        title,
        authorId,
        contestId,
        status: 'APPROVED',
        description: cosplay
          ? 'Layers of hand-shaped details, soft feathers, and a little imagination. A character brought to life. This is an illustrative demo entry.'
          : 'A story of quiet wonder, imagined worlds, and the things that connect us. Explore the stages below. This is an illustrative demo entry; sample stages are placeholders.',
        stages: { create: stages.map((s, position) => ({ ...s, position })) },
      },
    });
  }
  for (let i = 0; i < 36; i++) {
    const id = `seed-voter-${i}`;
    const supported = entries.filter((_, idx) => i < [36, 31, 27, 25, 20, 18, 15, 12][idx]);
    await db.user.create({
      data: {
        id,
        email: `${id}@afc.local`,
        name: `Demo supporter ${i + 1}`,
        password: 'disabled',
        balance: 100 - supported.length,
        ledger: {
          create: [
            { amount: 100, description: 'Welcome bonus', eventKey: `welcome:${id}` },
            ...supported.map((e) => ({
              amount: -1,
              description: `Vote: ${e[1]}`,
              entryId: e[0],
              eventKey: `vote:${id}:${e[0]}`,
            })),
          ],
        },
        votes: { create: supported.map((e) => ({ entryId: e[0] })) },
      },
    });
  }
  await db.comment.create({
    data: {
      userId: 'elise',
      entryId: 'keeper',
      body: 'The light in this piece is beautiful. Love seeing the process!',
    },
  });
  await db.notification.create({
    data: {
      userId: 'demo-member',
      title: 'Welcome to your creative arena',
      body: 'Your first 100 points are ready. Discover a creator and make your first vote count.',
      href: '/wallet',
    },
  });
  await db.notification.create({
    data: {
      userId: 'demo-member',
      title: 'Myth & Magic is open',
      body: 'There is a whole new world waiting to be imagined. Submissions and voting are open.',
      href: '/contests/myth-magic',
    },
  });
  console.log('AFC seeded. Local demo password: AfcLocal2026!');
}
main().finally(() => db.$disconnect());
