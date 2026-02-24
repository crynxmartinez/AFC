import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../lib/prisma.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const following = await prisma.follow.findMany({
        where: { followerId: id as string },
        include: {
          following: {
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

      return res.status(200).json({ following })
    } catch (error) {
      console.error('Get following error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
