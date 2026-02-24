import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma.js'
import { verifyToken } from '../lib/auth.js'
import cookie from 'cookie'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  // Verify authentication for all methods
  const cookies = cookie.parse(req.headers.cookie || '')
  const token = cookies.session

  if (!token) {
    return res.status(401).json({ error: 'Not authenticated' })
  }

  const decoded = verifyToken(token)
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid token' })
  }

  try {
    if (req.method === 'PUT') {
      const { type } = req.body

      if (!type) {
        return res.status(400).json({ error: 'Missing reaction type' })
      }

      const validTypes = ['like', 'love', 'haha', 'fire', 'wow', 'sad', 'cry', 'angry']
      if (!validTypes.includes(type)) {
        return res.status(400).json({ error: 'Invalid reaction type' })
      }

      // Verify ownership
      const existing = await prisma.commentReaction.findUnique({
        where: { id: id as string },
      })

      if (!existing || existing.userId !== decoded.id) {
        return res.status(403).json({ error: 'Not authorized' })
      }

      const reaction = await prisma.commentReaction.update({
        where: { id: id as string },
        data: { type },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      })

      return res.status(200).json({ reaction })
    } else if (req.method === 'DELETE') {
      // Verify ownership
      const existing = await prisma.commentReaction.findUnique({
        where: { id: id as string },
      })

      if (!existing || existing.userId !== decoded.id) {
        return res.status(403).json({ error: 'Not authorized' })
      }

      await prisma.commentReaction.delete({
        where: { id: id as string },
      })

      return res.status(200).json({ message: 'Reaction deleted' })
    } else {
      return res.status(405).json({ error: 'Method not allowed' })
    }
  } catch (error) {
    console.error('Comment reaction error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
