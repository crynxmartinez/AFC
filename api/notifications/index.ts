import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'
import { handleCors } from '../lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return
  if (req.method === 'GET') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      const notifications = await prisma.notification.findMany({
        where: { userId: user.id },
        include: {
          actor: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        take: 50,
      })

      return res.status(200).json({ notifications })
    } catch (error) {
      console.error('Get notifications error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      await prisma.notification.deleteMany({
        where: { userId: user.id },
      })

      return res.status(200).json({ message: 'All notifications cleared' })
    } catch (error) {
      console.error('Clear notifications error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

