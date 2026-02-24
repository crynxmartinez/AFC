import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../../lib/prisma.js'
import { verifyToken } from '../../../lib/auth.js'
import cookie from 'cookie'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Verify admin authentication
    const cookies = cookie.parse(req.headers.cookie || '')
    const token = cookies.session

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const decoded = verifyToken(token)
    if (!decoded || decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' })
    }

    const rewards = await prisma.xpReward.findMany({
      orderBy: {
        action: 'asc',
      },
    })

    return res.status(200).json({ rewards })
  } catch (error) {
    console.error('Get XP rewards error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

