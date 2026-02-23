import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const followers = await prisma.follow.findMany({
        where: { followingId: id as string },
        include: {
          follower: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
              level: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return res.status(200).json({ followers })
    } catch (error) {
      console.error('Get followers error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
