import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma'
import { getSessionFromRequest } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const sessionUser = getSessionFromRequest(req)

    if (!sessionUser) {
      return res.status(401).json({ user: null })
    }

    // Fetch full user data from database
    const user = await prisma.user.findUnique({
      where: { id: sessionUser.id },
      select: {
        id: true,
        email: true,
        username: true,
        role: true,
        displayName: true,
        avatarUrl: true,
        level: true,
        xp: true,
        pointsBalance: true,
        emailVerified: true,
      },
    })

    if (!user) {
      return res.status(401).json({ user: null })
    }

    return res.status(200).json({ user })
  } catch (error) {
    console.error('Session error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
