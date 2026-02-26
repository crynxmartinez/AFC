import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../lib/prisma.js'
import { requireAdmin } from '../../lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = requireAdmin(req, res)
    if (!user) return

    // Get total users
    const totalUsers = await prisma.user.count()

    // Get total contests
    const totalContests = await prisma.contest.count()

    // Get active contests
    const activeContests = await prisma.contest.count({
      where: {
        status: {
          in: ['active', 'voting'],
        },
      },
    })

    // Get pending entries
    const pendingEntries = await prisma.entry.count({
      where: {
        status: 'pending',
      },
    })

    // Get pending messages
    const pendingMessages = await prisma.contactSubmission.count({
      where: {
        status: 'pending',
      },
    })

    // Get total entries
    const totalEntries = await prisma.entry.count()

    // Get total prize money distributed
    const winners = await prisma.contestWinner.findMany({
      select: {
        prizeAmount: true,
      },
    })
    const totalPrizeDistributed = winners.reduce((sum, w) => sum + w.prizeAmount, 0)

    return res.status(200).json({
      stats: {
        totalUsers,
        totalContests,
        activeContests,
        pendingEntries,
        pendingMessages,
        totalEntries,
        totalPrizeDistributed,
      },
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

