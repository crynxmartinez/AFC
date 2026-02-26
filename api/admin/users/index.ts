import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../lib/prisma.js'
import { requireAdmin } from '../../lib/auth.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const user = requireAdmin(req, res)
    if (!user) return

    const users = await prisma.user.findMany({
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        level: true,
        xp: true,
        pointsBalance: true,
        createdAt: true,
        avatarUrl: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return res.status(200).json({ users })
  } catch (error) {
    console.error('Admin users list error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

