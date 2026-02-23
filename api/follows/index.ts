import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../src/lib/prisma'
import { requireAuth } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      const { userId } = req.body

      if (!userId) {
        return res.status(400).json({ error: 'User ID required' })
      }

      if (userId === user.id) {
        return res.status(400).json({ error: 'Cannot follow yourself' })
      }

      // Check if already following
      const existing = await prisma.follow.findUnique({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId: userId,
          },
        },
      })

      if (existing) {
        return res.status(400).json({ error: 'Already following' })
      }

      const follow = await prisma.follow.create({
        data: {
          followerId: user.id,
          followingId: userId,
        },
      })

      return res.status(201).json({ follow })
    } catch (error) {
      console.error('Follow user error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
