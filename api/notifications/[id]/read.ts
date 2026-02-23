import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../lib/prisma'
import { requireAuth } from '../../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'PUT') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      const notification = await prisma.notification.findUnique({
        where: { id: id as string },
      })

      if (!notification) {
        return res.status(404).json({ error: 'Notification not found' })
      }

      if (notification.userId !== user.id) {
        return res.status(403).json({ error: 'Forbidden' })
      }

      const updated = await prisma.notification.update({
        where: { id: id as string },
        data: { read: true },
      })

      return res.status(200).json({ notification: updated })
    } catch (error) {
      console.error('Mark notification as read error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
