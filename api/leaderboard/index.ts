import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma.js'
import { handleCors } from '../lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { limit = '50', timeframe = 'all', category = 'xp' } = req.query

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

    // Fetch users with basic info
    const users = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        level: true,
        xp: true,
        totalXp: true,
        pointsBalance: true,
        profileTitle: true,
        createdAt: true,
      },
      orderBy: category === 'xp' ? { xp: 'desc' } : { pointsBalance: 'desc' },
      take: parseInt(limit as string) * 2, // Fetch more to filter after aggregation
    })

    // Fetch aggregated stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        // Count total entries
        const totalEntries = await prisma.entry.count({
          where: { userId: user.id, status: 'approved' },
        })

        // Count total wins
        const totalWins = await prisma.contestWinner.count({
          where: { userId: user.id },
        })

        // Sum total prize money from contest wins
        const prizeSum = await prisma.contestWinner.aggregate({
          where: { userId: user.id },
          _sum: { prizeAmount: true },
        })
        const totalPrizeMoney = prizeSum._sum.prizeAmount || 0

        // Calculate average votes (reactions) per entry
        const entriesWithReactions = await prisma.entry.findMany({
          where: { userId: user.id, status: 'approved' },
          select: {
            _count: {
              select: { reactions: true },
            },
          },
        })
        const totalReactions = entriesWithReactions.reduce((sum, e) => sum + e._count.reactions, 0)
        const avgVotes = totalEntries > 0 ? totalReactions / totalEntries : 0

        // Calculate win rate
        const winRate = totalEntries > 0 ? (totalWins / totalEntries) * 100 : 0

        return {
          ...user,
          totalEntries,
          totalWins,
          totalPrizeMoney,
          avgVotes: Math.round(avgVotes),
          winRate: parseFloat(winRate.toFixed(1)),
        }
      })
    )

    // Sort based on category
    let sortedUsers = usersWithStats
    if (category === 'earners') {
      sortedUsers = usersWithStats.sort((a, b) => b.totalPrizeMoney - a.totalPrizeMoney)
    } else if (category === 'winners') {
      sortedUsers = usersWithStats.sort((a, b) => b.totalWins - a.totalWins)
    }

    // Take final limit
    const finalUsers = sortedUsers.slice(0, parseInt(limit as string))

    return res.status(200).json({ users: finalUsers })
  } catch (error) {
    console.error('Leaderboard error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

