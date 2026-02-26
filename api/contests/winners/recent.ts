import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../lib/prisma.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    try {
      const { days = '7' } = req.query
      const daysAgo = new Date()
      daysAgo.setDate(daysAgo.getDate() - parseInt(days as string))

      // Get recently finalized contests with winners
      const contests = await prisma.contest.findMany({
        where: {
          prizePoolDistributed: true,
          finalizedAt: {
            gte: daysAgo,
          },
        },
        select: {
          id: true,
          title: true,
          finalizedAt: true,
        },
        orderBy: {
          finalizedAt: 'desc',
        },
        take: 3,
      })

      // Get winners for each contest
      const contestsWithWinners = await Promise.all(
        contests.map(async (contest) => {
          const winners = await prisma.contestWinner.findMany({
            where: {
              contestId: contest.id,
            },
            include: {
              user: {
                select: {
                  username: true,
                  avatarUrl: true,
                },
              },
              entry: {
                select: {
                  phase4Url: true,
                },
              },
            },
            orderBy: {
              placement: 'asc',
            },
          }) as any[]

          return {
            contestId: contest.id,
            contestTitle: contest.title,
            finalizedAt: contest.finalizedAt,
            winners: winners.map((w: any) => ({
              placement: w.placement,
              username: w.user.username,
              avatarUrl: w.user.avatarUrl,
              prizeAmount: w.prizeAmount,
              entryImage: w.entry?.phase4Url,
            })),
          }
        })
      )

      return res.status(200).json({ announcements: contestsWithWinners })
    } catch (error) {
      console.error('Get recent winners error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

