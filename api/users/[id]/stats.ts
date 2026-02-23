import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const [user, entriesCount, followersCount, followingCount, winsCount] = await Promise.all([
        prisma.user.findUnique({
          where: { id: id as string },
          select: {
            id: true,
            username: true,
            level: true,
            xp: true,
            pointsBalance: true,
          },
        }),
        prisma.entry.count({
          where: { userId: id as string, status: 'approved' },
        }),
        prisma.follow.count({
          where: { followingId: id as string },
        }),
        prisma.follow.count({
          where: { followerId: id as string },
        }),
        prisma.contestWinner.count({
          where: { userId: id as string },
        }),
      ])

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      return res.status(200).json({
        stats: {
          ...user,
          entriesCount,
          followersCount,
          followingCount,
          winsCount,
        },
      })
    } catch (error) {
      console.error('Get user stats error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
