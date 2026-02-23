import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../../lib/prisma'
import { verifyToken } from '../../../lib/auth'
import cookie from 'cookie'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { level } = req.query

  if (req.method !== 'PUT') {
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

    const { xpRequired } = req.body

    if (typeof xpRequired !== 'number' || xpRequired < 0) {
      return res.status(400).json({ error: 'Invalid XP required' })
    }

    const levelConfig = await prisma.levelConfig.update({
      where: { level: parseInt(level as string) },
      data: { xpRequired },
    })

    return res.status(200).json({ levelConfig })
  } catch (error) {
    console.error('Update level config error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
