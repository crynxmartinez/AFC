import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { limit = '50', timeframe = 'all' } = req.query

    let whereClause = {}

    // Filter by timeframe if specified
    if (timeframe === 'week') {
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 7)
      whereClause = {
        updatedAt: {
          gte: weekAgo,
        },
      }
    } else if (timeframe === 'month') {
      const monthAgo = new Date()
      monthAgo.setMonth(monthAgo.getMonth() - 1)
      whereClause = {
        updatedAt: {
          gte: monthAgo,
        },
      }
    }

    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        avatarUrl: true,
        level: true,
        xp: true,
        totalXp: true,
        pointsBalance: true,
        createdAt: true,
      },
      orderBy: {
        xp: 'desc',
      },
      take: parseInt(limit as string),
    })

    return res.status(200).json({ users })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
