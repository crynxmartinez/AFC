import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'DELETE') {
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

      await prisma.notification.delete({
        where: { id: id as string },
      })

      return res.status(200).json({ message: 'Notification deleted' })
    } catch (error) {
      console.error('Delete notification error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
