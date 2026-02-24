import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'PUT') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      const comment = await prisma.entryComment.findUnique({
        where: { id: id as string },
      })

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' })
      }

      if (comment.userId !== user.id) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const { content } = req.body

      const updated = await prisma.entryComment.update({
        where: { id: id as string },
        data: { content },
      })

      return res.status(200).json({ comment: updated })
    } catch (error) {
      console.error('Update comment error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      const comment = await prisma.entryComment.findUnique({
        where: { id: id as string },
      })

      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' })
      }

      if (comment.userId !== user.id && user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden' })
      }

      await prisma.entryComment.delete({
        where: { id: id as string },
      })

      // Update entry comment count
      await prisma.entry.update({
        where: { id: comment.entryId },
        data: { commentCount: { decrement: 1 } },
      })

      return res.status(200).json({ message: 'Comment deleted' })
    } catch (error) {
      console.error('Delete comment error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
