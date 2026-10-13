import { z } from 'zod';
import { db } from '@/lib/db';
import {
  currentUser,
  startSession,
  endSession,
  hashPassword,
  checkPassword,
  localDemo,
} from '@/lib/auth';
import { AppError, castVote, demoCredit, isOpen, prizeSplit, stageLabels } from '@/lib/domain';
import { throttle } from '@/lib/rate-limit';
import { confirmEmail, confirmationHash, issueConfirmation } from '@/lib/confirmation';
import { sendConfirmationEmail } from '@/lib/confirmation-email';
const str = z.string().trim().min(1).max(160);
const signup = z.object({
  email: z.string().email().max(200),
  password: z.string().min(8).max(128),
  name: z.string().trim().min(2).max(60),
});
export async function POST(request: Request) {
  try {
    const origin = request.headers.get('origin');
    if (origin && new URL(origin).host !== request.headers.get('host'))
      throw new AppError('Invalid request origin.', 403);
    if (Number(request.headers.get('content-length') || 0) > 40000)
      throw new AppError('Request too large.', 413);
    const data = await request.json();
    const action = str.parse(data.action);
    const host = request.headers.get('host') || '';
    if (action === 'confirmEmail') {
      await throttle(`confirm:${request.headers.get('x-vercel-forwarded-for') || 'local'}`);
      return Response.json({
        ok: true,
        ...(await confirmEmail(
          db,
          z
            .string()
            .regex(/^[a-f0-9]{64}$/)
            .parse(data.token),
        )),
      });
    }
    if (['login', 'register', 'demoLogin', 'resendConfirmation'].includes(action)) {
      const ip =
        process.env.VERCEL === '1'
          ? request.headers.get('x-vercel-forwarded-for') || 'unknown'
          : 'local';
      await throttle(`auth:${ip}`);
      if (action === 'demoLogin') {
        if (!localDemo(host)) throw new AppError('Demo access is disabled.', 403);
        const id = data.role === 'ADMIN' ? 'demo-admin' : 'demo-member';
        await startSession(id);
        return Response.json({ ok: true });
      }
      const email = z.string().email().max(200).parse(data.email).toLowerCase();
      await throttle(`email:${email}`);
      const password = z.string().min(8).max(128).parse(data.password);
      const sendProof = async (userId: string) => {
        await throttle(`confirmation-send:${userId}`, 1);
        const token = await issueConfirmation(db, userId);
        try {
          await sendConfirmationEmail(email, token);
        } catch (error) {
          await db.emailConfirmation.deleteMany({ where: { id: confirmationHash(token) } });
          throw error;
        }
        return Response.json({ ok: true, confirmationRequired: true, emailSent: true });
      };
      if (action === 'register') {
        const input = signup.parse({ ...data, email, password });
        const existing = await db.user.findUnique({ where: { email } });
        if (existing) {
          if (
            !existing.emailVerifiedAt &&
            !existing.suspended &&
            checkPassword(password, existing.password)
          )
            return await sendProof(existing.id);
          throw new AppError('An account already uses this email. Please sign in.');
        }
        const demo = localDemo(host);
        const user = await db.user.create({
          data: {
            email,
            password: hashPassword(password),
            name: input.name,
            emailVerifiedAt: demo ? new Date() : null,
            balance: demo ? 100 : 0,
            ledger: demo
              ? {
                  create: {
                    amount: 100,
                    description: 'Welcome bonus',
                    eventKey: `welcome:${email}`,
                  },
                }
              : undefined,
          },
        });
        if (!demo) return await sendProof(user.id);
        await startSession(user.id);
      } else {
        const user = await db.user.findUnique({ where: { email } });
        if (!user || user.suspended || !checkPassword(password, user.password))
          throw new AppError('Email or password is incorrect.', 401);
        if (!user.emailVerifiedAt && !localDemo(host)) {
          if (action === 'resendConfirmation') return await sendProof(user.id);
          return Response.json({ ok: true, confirmationRequired: true, emailSent: false });
        }
        if (action === 'resendConfirmation')
          return Response.json({ ok: true, alreadyConfirmed: true });
        await startSession(user.id);
      }
      return Response.json({ ok: true });
    }
    const me = await currentUser();
    if (!me) throw new AppError('Please sign in to continue.', 401);
    const target = () => str.parse(data.id);
    const audit = async (targetId: string, detail = '') =>
      db.audit.create({ data: { actorId: me.id, action, targetId, detail } });
    if (action === 'logout') await endSession();
    else if (action === 'vote')
      return Response.json({ ok: true, ...(await castVote(db, me.id, target())) });
    else if (action === 'topup') {
      if (!localDemo(host)) throw new AppError('Real payments are not connected yet.', 403);
      await demoCredit(
        db,
        me.id,
        z.number().int().parse(data.amount),
        z.string().uuid().parse(data.key),
      );
    } else if (action === 'bookmark') {
      const targetId = target();
      const kind = z.enum(['ENTRY', 'CONTEST']).parse(data.kind);
      const eligible =
        kind === 'ENTRY'
          ? await db.entry.findFirst({ where: { id: targetId, status: 'APPROVED' } })
          : await db.contest.findFirst({ where: { id: targetId, status: { not: 'DRAFT' } } });
      if (!eligible) throw new AppError('Item unavailable.');
      const where = { userId_targetId_kind: { userId: me.id, targetId, kind } };
      if (await db.bookmark.findUnique({ where })) await db.bookmark.delete({ where });
      else await db.bookmark.create({ data: { userId: me.id, targetId, kind } });
    } else if (action === 'follow') {
      const followingId = target();
      if (followingId === me.id || !(await db.user.findUnique({ where: { id: followingId } })))
        throw new AppError('Cannot follow this account.');
      const where = { followerId_followingId: { followerId: me.id, followingId } };
      if (await db.follow.findUnique({ where })) await db.follow.delete({ where });
      else await db.follow.create({ data: { followerId: me.id, followingId } });
    } else if (action === 'comment') {
      const entryId = target();
      const body = z.string().trim().min(1).max(1000).parse(data.body);
      await throttle(`comment:${me.id}`);
      const entry = await db.entry.findFirst({
        where: { id: entryId, status: 'APPROVED' },
        include: { author: true },
      });
      if (!entry) throw new AppError('Entry unavailable.');
      await db.comment.create({ data: { userId: me.id, entryId, body } });
      if (entry.authorId !== me.id && entry.author.notifyActivity)
        await db.notification.create({
          data: {
            userId: entry.authorId,
            title: 'A new comment on your entry',
            body: `${me.name}: ${body.slice(0, 140)}`,
            href: `/entries/${entryId}`,
          },
        });
    } else if (action === 'report') {
      const kind = z.enum(['ENTRY', 'COMMENT']).parse(data.kind);
      const targetId = target();
      const exists =
        kind === 'ENTRY'
          ? await db.entry.findFirst({ where: { id: targetId, status: 'APPROVED' } })
          : await db.comment.findFirst({ where: { id: targetId, hidden: false } });
      if (!exists) throw new AppError('This content is unavailable.');
      await throttle(`report:${me.id}`);
      await db.report.create({
        data: {
          reporterId: me.id,
          targetId,
          kind,
          reason: z.string().trim().min(5).max(500).parse(data.reason),
        },
      });
    } else if (action === 'readNotifications')
      await db.notification.updateMany({ where: { userId: me.id }, data: { read: true } });
    else if (action === 'profile') {
      const input = z
        .object({
          name: z.string().trim().min(2).max(60),
          bio: z.string().max(300),
          notifyActivity: z.boolean(),
          notifyContests: z.boolean(),
          avatar: z.string().max(300).optional(),
          featuredEntryId: z.string().optional(),
        })
        .parse(data);
      if (
        input.featuredEntryId &&
        !(await db.entry.findFirst({
          where: { id: input.featuredEntryId, authorId: me.id, status: 'APPROVED' },
        }))
      )
        throw new AppError('Choose one of your published entries.');
      if (input.avatar && !input.avatar.startsWith('/api/media/'))
        throw new AppError('Upload a valid avatar.');
      if (
        input.avatar &&
        !(await db.media.findFirst({
          where: { key: input.avatar.split('/').pop(), ownerId: me.id },
        }))
      )
        throw new AppError('Invalid avatar.');
      await db.user.update({
        where: { id: me.id },
        data: { ...input, featuredEntryId: input.featuredEntryId || null },
      });
    } else if (action === 'saveEntry') {
      const input = z
        .object({
          contestId: str,
          title: z.string().trim().min(1).max(100),
          description: z.string().max(1000),
          stages: z.array(z.string().max(300)).max(3),
          submit: z.boolean(),
          rulesAccepted: z.boolean().optional(),
        })
        .parse(data);
      const contest = await db.contest.findUnique({ where: { id: input.contestId } });
      if (!contest || !isOpen(contest)) throw new AppError('Submissions are closed.');
      const labels = stageLabels(contest.type);
      if (
        input.submit &&
        (!input.rulesAccepted ||
          input.stages.length !== labels.length ||
          input.stages.some((s) => !s))
      )
        throw new AppError('Complete every stage and accept the rules.');
      if (input.stages.length > labels.length) throw new AppError('Too many stages.');
      for (const url of input.stages.filter(Boolean)) {
        if (
          !url.startsWith('/api/media/') ||
          !(await db.media.findFirst({ where: { key: url.split('/').pop(), ownerId: me.id } }))
        )
          throw new AppError('Upload your own stage images.');
      }
      const entryId = await db.$transaction(async (tx) => {
        const freshContest = await tx.contest.findUniqueOrThrow({ where: { id: contest.id } });
        if (!isOpen(freshContest)) throw new AppError('Submissions are closed.');
        const existing = await tx.entry.findUnique({
          where: { authorId_contestId: { authorId: me.id, contestId: contest.id } },
        });
        if (existing && !['DRAFT', 'CHANGES'].includes(existing.status))
          throw new AppError('Your entry is submitted and locked.');
        const entry =
          existing ||
          (await tx.entry.create({
            data: { authorId: me.id, contestId: contest.id, title: input.title },
          }));
        await tx.stage.deleteMany({ where: { entryId: entry.id } });
        await tx.entry.update({
          where: { id: entry.id },
          data: {
            title: input.title,
            description: input.description,
            status: input.submit ? 'PENDING' : 'DRAFT',
            stages: {
              create: input.stages
                .map((url, position) => ({ url, position, label: labels[position] }))
                .filter((s) => s.url),
            },
          },
        });
        return entry.id;
      });
      return Response.json({ ok: true, id: entryId });
    } else {
      if (me.role !== 'ADMIN') throw new AppError('Administrator access required.', 403);
      if (action === 'saveContest') {
        const input = z
          .object({
            title: z.string().trim().min(3).max(100),
            description: z.string().min(5).max(2000),
            type: z.enum(['ART', 'COSPLAY']),
            rules: z.string().min(10).max(5000),
            prize: z.number().int().min(0).max(100000000),
            customPrizes: z.string().max(2000).default(''),
            startsAt: z.string().datetime(),
            endsAt: z.string().datetime(),
          })
          .parse(data);
        if (new Date(input.endsAt) <= new Date(input.startsAt))
          throw new AppError('End date must follow start date.');
        if (!input.prize && !input.customPrizes.trim())
          throw new AppError('Set a cash pool or custom prizes.');
        if (!input.prize && input.customPrizes.split('\n').filter((s) => s.trim()).length !== 3)
          throw new AppError('Enter exactly three custom prizes, one per line.');
        const fields = {
          ...input,
          banner: input.type === 'ART' ? '/art/city.png' : '/art/cosplay.png',
          startsAt: new Date(input.startsAt),
          endsAt: new Date(input.endsAt),
        };
        if (data.id) {
          const contest = await db.contest.findUnique({ where: { id: target() } });
          if (!contest || contest.status !== 'DRAFT')
            throw new AppError('Only draft contest rules can be edited.');
          await db.contest.update({ where: { id: contest.id }, data: fields });
          await audit(contest.id);
        } else {
          const contest = await db.contest.create({ data: fields });
          await audit(contest.id);
        }
      } else if (action === 'contestStatus') {
        const id = target();
        const status = z.enum(['ACTIVE', 'CLOSED']).parse(data.status);
        const contest = await db.contest.findUnique({ where: { id } });
        if (
          !contest ||
          (status === 'ACTIVE'
            ? contest.status !== 'DRAFT' || contest.endsAt <= new Date()
            : contest.status !== 'ACTIVE')
        )
          throw new AppError('Invalid contest transition.');
        await db.contest.update({ where: { id }, data: { status } });
        await audit(id, status);
        if (status === 'ACTIVE') {
          const users = await db.user.findMany({
            where: {
              notifyContests: true,
              suspended: false,
              NOT: { id: { startsWith: 'seed-voter-' } },
            },
            select: { id: true },
          });
          await db.notification.createMany({
            data: users.map((u) => ({
              userId: u.id,
              title: 'A new arena is open',
              body: contest.title,
              href: `/contests/${id}`,
            })),
          });
        }
      } else if (action === 'moderate') {
        const id = target();
        const status = z.enum(['APPROVED', 'CHANGES', 'DISQUALIFIED']).parse(data.status);
        const note = z
          .string()
          .max(500)
          .parse(data.note || '');
        const entry = await db.entry.findUnique({
          where: { id },
          include: { contest: true, stages: true },
        });
        if (!entry || entry.contest.status === 'ANNOUNCED')
          throw new AppError('This entry cannot be moderated.');
        if (
          status === 'APPROVED' &&
          (entry.status !== 'PENDING' ||
            !isOpen(entry.contest) ||
            entry.stages.length !== stageLabels(entry.contest.type).length)
        )
          throw new AppError('Only complete pending entries in active contests can be approved.');
        if (status === 'CHANGES' && entry.status !== 'PENDING')
          throw new AppError('Only pending entries can receive change requests.');
        if (status === 'DISQUALIFIED' && !['APPROVED', 'PENDING'].includes(entry.status))
          throw new AppError('Invalid moderation transition.');
        if (status !== 'APPROVED' && note.trim().length < 5)
          throw new AppError('Please give a clear moderation reason.');
        await db.entry.update({ where: { id }, data: { status, moderationNote: note } });
        await audit(id, `${status}: ${note}`);
        await db.notification.create({
          data: {
            userId: entry.authorId,
            title: status === 'APPROVED' ? 'Your entry is live!' : 'An update on your submission',
            body: note || entry.title,
            href: status === 'APPROVED' ? `/entries/${id}` : '/submit',
          },
        });
        if (status === 'APPROVED') {
          const followers = await db.follow.findMany({ where: { followingId: entry.authorId } });
          const recipients = await db.user.findMany({
            where: {
              id: { in: followers.map((f) => f.followerId) },
              notifyActivity: true,
              suspended: false,
            },
            select: { id: true },
          });
          await db.notification.createMany({
            data: recipients.map((u) => ({
              userId: u.id,
              title: 'A creator you follow entered the arena',
              body: entry.title,
              href: `/entries/${id}`,
            })),
          });
        }
      } else if (action === 'hideComment') {
        await db.comment.update({ where: { id: target() }, data: { hidden: true } });
        await audit(target());
      } else if (action === 'resolveReport') {
        await db.report.update({ where: { id: target() }, data: { resolved: true } });
        await audit(target());
      } else if (action === 'suspend') {
        const user = await db.user.findUnique({ where: { id: target() } });
        if (!user || user.role === 'ADMIN') throw new AppError('Cannot suspend this account.');
        await db.user.update({ where: { id: user.id }, data: { suspended: !user.suspended } });
        await db.session.deleteMany({ where: { userId: user.id } });
        await audit(user.id);
      } else if (action === 'publishResults') {
        const contestId = target();
        const order = z.array(str).length(3).parse(data.order);
        if (new Set(order).size !== 3) throw new AppError('Choose three different winners.');
        await db.$transaction(async (tx) => {
          const contest = await tx.contest.findUnique({ where: { id: contestId } });
          if (!contest || contest.status !== 'CLOSED')
            throw new AppError('Close the contest before publishing results.');
          const entries = await tx.entry.findMany({
            where: { contestId, status: 'APPROVED' },
            include: { _count: { select: { votes: true } } },
          });
          const ranked = [...entries].sort((a, b) => b._count.votes - a._count.votes);
          if (ranked.length < 3) throw new AppError('Three eligible entries are required.');
          const chosen = order.map((id) => entries.find((e) => e.id === id));
          if (chosen.some((e, i) => !e || e._count.votes !== ranked[i]._count.votes))
            throw new AppError('Winner order must follow vote counts. Only ties can be reordered.');
          const tied = ranked.some(
            (e, i) => i < 3 && ranked[i + 1]?._count.votes === e._count.votes,
          );
          const reason = z
            .string()
            .max(1000)
            .parse(data.reason || '');
          if (tied && reason.trim().length < 5)
            throw new AppError('Explain how the tied positions were resolved.');
          const amounts = prizeSplit(contest.prize);
          await tx.winner.createMany({
            data: chosen.map((e, i) => ({
              contestId,
              entryId: e!.id,
              place: i + 1,
              amount: amounts[i],
              voteCount: e!._count.votes,
            })),
          });
          await tx.contest.update({
            where: { id: contestId },
            data: {
              status: 'ANNOUNCED',
              resultsNote: reason || 'Ranked by total unique community votes.',
            },
          });
          await tx.audit.create({
            data: {
              actorId: me.id,
              action,
              targetId: contestId,
              detail: reason || 'Ranked by unique votes.',
            },
          });
          await tx.notification.createMany({
            data: chosen.map((e, i) => ({
              userId: e!.authorId,
              title: `You placed #${i + 1}!`,
              body: `${contest.title} results are published.`,
              href: `/contests/${contestId}`,
            })),
          });
        });
      } else throw new AppError('Unknown action.');
    }
    return Response.json({ ok: true });
  } catch (error) {
    if (error instanceof z.ZodError)
      return Response.json(
        { error: error.issues[0]?.message || 'Check your input.' },
        { status: 400 },
      );
    if (error instanceof AppError)
      return Response.json({ error: error.message }, { status: error.status });
    if (error && typeof error === 'object' && 'code' in error && error.code === 'P2002')
      return Response.json(
        { error: 'This record already exists. Refresh and try again.' },
        { status: 409 },
      );
    console.error('AFC action failed', error instanceof Error ? error.message : 'Unknown error');
    return Response.json(
      { error: 'We could not save that change. Please try again.' },
      { status: 500 },
    );
  }
}
