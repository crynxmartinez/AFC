import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../../src/lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const winners = await prisma.contestWinner.findMany({
        where: {
          contestId: id as string,
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
          entry: {
            select: {
              id: true,
              title: true,
              phase4Url: true,
            },
          },
        },
        orderBy: {
          placement: 'asc',
        },
      })

      return res.status(200).json({ winners })
    } catch (error) {
      console.error('Get contest winners error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
