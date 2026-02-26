import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../lib/prisma.js'
import { requireAuth, getSessionFromRequest } from '../../lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const reactions = await prisma.reaction.findMany({
        where: { entryId: id as string },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return res.status(200).json({ reactions })
    } catch (error) {
      console.error('List reactions error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      const { reactionType } = req.body

      if (!reactionType) {
        return res.status(400).json({ error: 'Reaction type required' })
      }

      // Check if reaction already exists
      const existing = await prisma.reaction.findUnique({
        where: {
          userId_entryId: {
            userId: user.id,
            entryId: id as string,
          },
        },
      })

      if (existing) {
        // Update reaction type
        const reaction = await prisma.reaction.update({
          where: { id: existing.id },
          data: { reactionType },
        })

        return res.status(200).json({ reaction })
      }

      // Create new reaction
      const reaction = await prisma.reaction.create({
        data: {
          userId: user.id,
          entryId: id as string,
          reactionType,
        },
      })

      // Increment vote count
      await prisma.entry.update({
        where: { id: id as string },
        data: { voteCount: { increment: 1 } },
      })

      return res.status(201).json({ reaction })
    } catch (error) {
      console.error('Add reaction error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      await prisma.reaction.delete({
        where: {
          userId_entryId: {
            userId: user.id,
            entryId: id as string,
          },
        },
      })

      // Decrement vote count
      await prisma.entry.update({
        where: { id: id as string },
        data: { voteCount: { decrement: 1 } },
      })

      return res.status(200).json({ message: 'Reaction removed' })
    } catch (error) {
      console.error('Remove reaction error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
