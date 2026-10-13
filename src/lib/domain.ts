import { Prisma, PrismaClient } from '@prisma/client';
export class AppError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export const stageLabels = (type: string) =>
  type === 'ART'
    ? ['Rough sketch', 'Clean line art', 'Final artwork']
    : ['The costume', 'Cosplayer in costume'];
export const isOpen = (
  contest: { status: string; startsAt: Date; endsAt: Date },
  now = new Date(),
) => contest.status === 'ACTIVE' && contest.startsAt <= now && contest.endsAt > now;
export function prizeSplit(total: number) {
  const first = Math.floor(total * 0.5);
  const second = Math.floor(total * 0.3);
  return [first, second, total - first - second];
}
export async function castVote(client: PrismaClient, userId: string, entryId: string) {
  try {
    return await client.$transaction(
      async (tx) => {
        const user = await tx.user.findUnique({ where: { id: userId } });
        if (!user || user.suspended) throw new AppError('Please sign in to vote.', 401);
        const entry = await tx.entry.findUnique({
          where: { id: entryId },
          include: { contest: true },
        });
        if (!entry || entry.status !== 'APPROVED')
          throw new AppError('This entry is not eligible for voting.');
        if (!isOpen(entry.contest)) throw new AppError('Voting has closed for this contest.');
        if (entry.authorId === userId) throw new AppError('You cannot vote for your own entry.');
        const existing = await tx.vote.findUnique({
          where: { userId_entryId: { userId, entryId } },
        });
        if (existing) return { alreadyVoted: true };
        const changed = await tx.user.updateMany({
          where: { id: userId, balance: { gte: 1 }, suspended: false },
          data: { balance: { decrement: 1 } },
        });
        if (!changed.count)
          throw new AppError('You are out of points. Visit your wallet to top up.');
        await tx.vote.create({ data: { userId, entryId } });
        await tx.ledger.create({
          data: {
            userId,
            amount: -1,
            description: `Vote: ${entry.title}`,
            entryId,
            eventKey: `vote:${userId}:${entryId}`,
          },
        });
        return { alreadyVoted: false };
      },
      { timeout: 15000 },
    );
  } catch (error) {
    // A concurrent identical vote may win the unique constraint. Its transaction
    // debits once; this transaction rolls back completely before we return.
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      if (await client.vote.findUnique({ where: { userId_entryId: { userId, entryId } } })) {
        return { alreadyVoted: true };
      }
    }
    throw error;
  }
}
export async function demoCredit(
  client: PrismaClient,
  userId: string,
  amount: number,
  key: string,
) {
  if (![50, 100, 200, 500].includes(amount)) throw new AppError('Choose a valid points package.');
  return client.$transaction(async (tx) => {
    const eventKey = `demo:${userId}:${key}`;
    if (await tx.ledger.findUnique({ where: { eventKey } })) return;
    await tx.ledger.create({
      data: { userId, amount, eventKey, description: `Demo top-up · ${amount} points` },
    });
    await tx.user.update({ where: { id: userId }, data: { balance: { increment: amount } } });
  });
}
