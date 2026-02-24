import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../lib/prisma.js'
import { requireAuth } from '../../lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'PUT') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      const comment = await prisma.entryComment.findUnique({
        where: { id: id as string },
        include: {
          entry: {
            select: {
              userId: true,
            },
          },
        },
      })

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' })
      }

      // Only entry owner can pin comments
      if (comment.entry.userId !== user.id) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const { isPinned } = req.body

      const updated = await prisma.entryComment.update({
        where: { id: id as string },
        data: {
          isPinned,
          pinnedAt: isPinned ? new Date() : null,
        },
      })

      return res.status(200).json({ comment: updated })
    } catch (error) {
      console.error('Pin comment error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
