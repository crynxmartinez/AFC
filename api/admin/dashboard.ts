import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma.js'
import { requireAdmin } from '../lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const user = requireAdmin(req, res)
    if (!user) return

    try {
      const [
        totalUsers,
        totalContests,
        activeContests,
        pendingEntries,
        totalEntries,
        unreadMessages,
      ] = await Promise.all([
        prisma.user.count(),
        prisma.contest.count(),
        prisma.contest.count({
          where: {
            startDate: { lte: new Date() },
            endDate: { gte: new Date() },
          },
        }),
        prisma.entry.count({
          where: { status: 'pending' },
        }),
        prisma.entry.count(),
        prisma.contactSubmission.count({
          where: { status: 'new' },
        }),
      ])

      // Get recent contests with entry counts
      const recentContests = await prisma.contest.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { entries: true },
          },
        },
      })

      return res.status(200).json({
        stats: {
          totalUsers,
          totalContests,
          activeContests,
          pendingEntries,
          totalEntries,
          unreadMessages,
        },
        recentContests,
      })
    } catch (error) {
      console.error('Get dashboard stats error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

