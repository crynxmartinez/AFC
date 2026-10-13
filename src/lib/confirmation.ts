import { createHash, randomBytes } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import { AppError } from './domain';

export const confirmationHash = (token: string) => createHash('sha256').update(token).digest('hex');
export async function issueConfirmation(client: PrismaClient, userId: string) {
  const token = randomBytes(32).toString('hex');
  await client.emailConfirmation.create({
    data: {
      id: confirmationHash(token),
      userId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });
  return token;
}
export async function confirmEmail(client: PrismaClient, token: string) {
  if (!/^[a-f0-9]{64}$/.test(token))
    throw new AppError('This confirmation link is invalid or expired.');
  return client.$transaction(async (tx) => {
    const id = confirmationHash(token);
    const proof = await tx.emailConfirmation.findUnique({ where: { id } });
    if (!proof || proof.expiresAt <= new Date())
      throw new AppError(
        'This confirmation link is invalid or expired. Request a new email from sign-in.',
      );
    const changed = await tx.user.updateMany({
      where: { id: proof.userId, emailVerifiedAt: null, suspended: false },
      data: { emailVerifiedAt: new Date() },
    });
    if (changed.count) {
      const user = await tx.user.findUniqueOrThrow({ where: { id: proof.userId } });
      const eventKey = `welcome:${user.email}`;
      if (!(await tx.ledger.findUnique({ where: { eventKey } }))) {
        await tx.user.update({ where: { id: user.id }, data: { balance: { increment: 100 } } });
        await tx.ledger.create({
          data: {
            userId: proof.userId,
            amount: 100,
            description: 'Welcome bonus',
            eventKey,
          },
        });
      }
    }
    await tx.emailConfirmation.deleteMany({ where: { userId: proof.userId } });
    if (!changed.count)
      throw new AppError('Account already confirmed or unavailable. Please sign in.');
    return { confirmed: true };
  });
}
