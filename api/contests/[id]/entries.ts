import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../../src/lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const entries = await prisma.entry.findMany({
        where: {
          contestId: id as string,
          status: 'approved',
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              level: true,
            },
          },
          _count: {
            select: {
              reactions: true,
              comments: true,
            },
          },
        },
        orderBy: { voteCount: 'desc' },
      })

      return res.status(200).json({ entries })
    } catch (error) {
      console.error('Get contest entries error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
