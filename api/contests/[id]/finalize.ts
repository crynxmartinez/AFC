import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../../src/lib/prisma'
import { requireAdmin } from '../../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'POST') {
    const user = requireAdmin(req, res)
    if (!user) return

    try {
      // Get contest
      const contest = await prisma.contest.findUnique({
        where: { id: id as string },
      })

      if (!contest) {
        return res.status(404).json({ error: 'Contest not found' })
      }

      if (contest.prizePoolDistributed) {
        return res.status(400).json({ error: 'Contest already finalized' })
      }

      // Get top 3 entries by vote count
      const topEntries = await prisma.entry.findMany({
        where: {
          contestId: id as string,
          status: 'approved',
        },
        include: {
          user: true,
          _count: {
            select: { reactions: true },
          },
        },
        orderBy: { voteCount: 'desc' },
        take: 3,
      })

      if (topEntries.length === 0) {
        return res.status(400).json({ error: 'No entries to finalize' })
      }

      // Calculate prize distribution (60%, 30%, 10%)
      const prizeDistribution = [0.6, 0.3, 0.1]
      const totalPrize = contest.prizePool + (contest.sponsorPrizeAmount || 0)

      // Create winners and distribute prizes
      const winners = await Promise.all(
        topEntries.map(async (entry, index) => {
          const placement = index + 1
          const prizeAmount = Math.floor(totalPrize * prizeDistribution[index])

          // Create winner record
          const winner = await prisma.contestWinner.create({
            data: {
              contestId: id as string,
              userId: entry.userId,
              entryId: entry.id,
              placement,
              votesReceived: entry._count.reactions,
              prizeAmount,
            },
          })

          // Update user points balance
          await prisma.user.update({
            where: { id: entry.userId },
            data: {
              pointsBalance: { increment: prizeAmount },
            },
          })

          // Award XP for winning
          const xpAmounts = [200, 150, 100] // 1st, 2nd, 3rd place XP
          await prisma.xpTransaction.create({
            data: {
              userId: entry.userId,
              actionType: `contest_winner_${placement}${placement === 1 ? 'st' : placement === 2 ? 'nd' : 'rd'}`,
              xpAmount: xpAmounts[index],
              referenceId: contest.id,
              description: `Won ${placement}${placement === 1 ? 'st' : placement === 2 ? 'nd' : 'rd'} place in ${contest.title}`,
            },
          })

          await prisma.user.update({
            where: { id: entry.userId },
            data: {
              xp: { increment: xpAmounts[index] },
              totalXp: { increment: xpAmounts[index] },
            },
          })

          return winner
        })
      )

      // Mark contest as finalized
      await prisma.contest.update({
        where: { id: id as string },
        data: {
          prizePoolDistributed: true,
          finalizedAt: new Date(),
        },
      })

      return res.status(200).json({
        message: 'Contest finalized successfully',
        winners,
      })
    } catch (error) {
      console.error('Finalize contest error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
