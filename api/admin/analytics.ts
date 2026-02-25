import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma'
import { requireAdmin } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = requireAdmin(req, res)
    if (!user) return

    // Get time range from query (default: last 30 days)
    const days = parseInt(req.query.days as string) || 30
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    // Total counts
    const [totalUsers, totalContests, totalEntries, totalVotes] = await Promise.all([
      prisma.user.count(),
      prisma.contest.count(),
      prisma.entry.count(),
      prisma.vote.count(),
    ])

    // Recent growth (last 30 days)
    const [newUsers, newContests, newEntries, newVotes] = await Promise.all([
      prisma.user.count({ where: { createdAt: { gte: startDate } } }),
      prisma.contest.count({ where: { createdAt: { gte: startDate } } }),
      prisma.entry.count({ where: { createdAt: { gte: startDate } } }),
      prisma.vote.count({ where: { createdAt: { gte: startDate } } }),
    ])

    // Contest status breakdown
    const contestsByStatus = await prisma.contest.groupBy({
      by: ['status'],
      _count: true,
    })

    // Entry status breakdown
    const entriesByStatus = await prisma.entry.groupBy({
      by: ['status'],
      _count: true,
    })

    // Top contests by entries
    const topContestsByEntries = await prisma.contest.findMany({
      take: 5,
      orderBy: {
        entries: {
          _count: 'desc',
        },
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            entries: true,
          },
        },
      },
    })

    // Top contests by votes
    const topContestsByVotes = await prisma.contest.findMany({
      take: 5,
      select: {
        id: true,
        title: true,
        entries: {
          select: {
            _count: {
              select: {
                votes: true,
              },
            },
          },
        },
      },
    })

    const contestsWithVoteCounts = topContestsByVotes.map((contest: any) => ({
      id: contest.id,
      title: contest.title,
      voteCount: contest.entries.reduce((sum: number, entry: any) => sum + entry._count.votes, 0),
    })).sort((a: any, b: any) => b.voteCount - a.voteCount).slice(0, 5)

    // User growth over time (daily for last 30 days)
    const userGrowth = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM "User"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Entry submissions over time
    const entryGrowth = await prisma.$queryRaw<Array<{ date: Date; count: bigint }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM "Entry"
      WHERE created_at >= ${startDate}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `

    // Most active users (by entries)
    const topUsersByEntries = await prisma.user.findMany({
      take: 10,
      orderBy: {
        entries: {
          _count: 'desc',
        },
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        _count: {
          select: {
            entries: true,
          },
        },
      },
    })

    // Pending reviews count
    const pendingReviews = await prisma.entry.count({
      where: { status: 'pending_review' },
    })

    return res.status(200).json({
      totals: {
        users: totalUsers,
        contests: totalContests,
        entries: totalEntries,
        votes: totalVotes,
      },
      growth: {
        users: newUsers,
        contests: newContests,
        entries: newEntries,
        votes: newVotes,
      },
      contestsByStatus: contestsByStatus.map((c: any) => ({
        status: c.status,
        count: c._count,
      })),
      entriesByStatus: entriesByStatus.map((e: any) => ({
        status: e.status,
        count: e._count,
      })),
      topContestsByEntries: topContestsByEntries.map((c: any) => ({
        id: c.id,
        title: c.title,
        entryCount: c._count.entries,
      })),
      topContestsByVotes: contestsWithVoteCounts,
      userGrowth: userGrowth.map((g: any) => ({
        date: g.date.toISOString().split('T')[0],
        count: Number(g.count),
      })),
      entryGrowth: entryGrowth.map((g: any) => ({
        date: g.date.toISOString().split('T')[0],
        count: Number(g.count),
      })),
      topUsers: topUsersByEntries.map((u: any) => ({
        id: u.id,
        username: u.username,
        displayName: u.displayName,
        avatarUrl: u.avatarUrl,
        entryCount: u._count.entries,
      })),
      pendingReviews,
    })
  } catch (error) {
    console.error('Error fetching analytics:', error)
    return res.status(500).json({ error: 'Failed to fetch analytics' })
  }
}
