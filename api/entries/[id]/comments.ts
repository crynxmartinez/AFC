import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../../src/lib/prisma'
import { requireAuth } from '../../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const comments = await prisma.entryComment.findMany({
        where: { entryId: id as string },
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
          replies: {
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
                },
              },
            },
          },
          _count: {
            select: {
              reactions: true,
              replies: true,
            },
          },
        },
        orderBy: [
          { isPinned: 'desc' },
          { createdAt: 'desc' },
        ],
      })

      return res.status(200).json({ comments })
    } catch (error) {
      console.error('Get comments error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      const { content, parentCommentId } = req.body

      if (!content || !content.trim()) {
        return res.status(400).json({ error: 'Comment content required' })
      }

      const comment = await prisma.entryComment.create({
        data: {
          entryId: id as string,
          userId: user.id,
          content: content.trim(),
          parentCommentId: parentCommentId || null,
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
        },
      })

      // Update entry comment count
      await prisma.entry.update({
        where: { id: id as string },
        data: {
          commentCount: { increment: 1 },
          lastActivityAt: new Date(),
        },
      })

      return res.status(201).json({ comment })
    } catch (error) {
      console.error('Create comment error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
