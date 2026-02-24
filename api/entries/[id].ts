import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'
import { handleCors } from '../lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const entry = await prisma.entry.findUnique({
        where: { id: id as string },
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
          contest: {
            select: {
              id: true,
              title: true,
              category: true,
              endDate: true,
            },
          },
          _count: {
            select: {
              reactions: true,
              comments: true,
            },
          },
        },
      })

      if (!entry) {
        return res.status(404).json({ error: 'Entry not found' })
      }

      return res.status(200).json({ entry })
    } catch (error) {
      console.error('Get entry error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      const entry = await prisma.entry.findUnique({
        where: { id: id as string },
      })

      if (!entry) {
        return res.status(404).json({ error: 'Entry not found' })
      }

      if (entry.userId !== user.id) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const updated = await prisma.entry.update({
        where: { id: id as string },
        data: {
          ...req.body,
          lastActivityAt: new Date(),
        },
      })

      return res.status(200).json({ entry: updated })
    } catch (error) {
      console.error('Update entry error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
