import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma.js'
import { verifyToken } from '../lib/auth.js'
import cookie from 'cookie'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify authentication
    const cookies = cookie.parse(req.headers.cookie || '')
    const token = cookies.session

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { commentId, type } = req.body

    if (!commentId || !type) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    const validTypes = ['like', 'love', 'haha', 'fire', 'wow', 'sad', 'cry', 'angry']
    if (!validTypes.includes(type)) {
      return res.status(400).json({ error: 'Invalid reaction type' })
    }

    const reaction = await prisma.commentReaction.create({
      data: {
        commentId,
        userId: decoded.id,
        type,
      },
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

    return res.status(201).json({ reaction })
  } catch (error) {
    console.error('Create comment reaction error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

