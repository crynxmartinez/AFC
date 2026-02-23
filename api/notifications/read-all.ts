import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma'
import { requireAuth } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'PUT') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      await prisma.notification.updateMany({
        where: { 
          userId: user.id,
          read: false,
        },
        data: { read: true },
      })

      return res.status(200).json({ message: 'All notifications marked as read' })
    } catch (error) {
      console.error('Mark all as read error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
