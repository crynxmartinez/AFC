import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma'
import { requireAuth } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = requireAuth(req, res)
    if (!user) return

    const unreadCount = await prisma.notification.count({
      where: {
        userId: user.id,
        read: false,
      },
    })

    return res.status(200).json({ unreadCount })
  } catch (error) {
    console.error('Error fetching unread count:', error)
    return res.status(500).json({ error: 'Failed to fetch unread count' })
  }
}
