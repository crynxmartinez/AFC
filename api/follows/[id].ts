import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'DELETE') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      await prisma.follow.delete({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: id as string,
          },
        },
      })

      return res.status(200).json({ message: 'Unfollowed' })
    } catch (error) {
      console.error('Unfollow user error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
