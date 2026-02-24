import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../../lib/prisma.js'
import { verifyToken } from '../../../lib/auth.js'
import cookie from 'cookie'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

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

    const { banned } = req.body

    if (typeof banned !== 'boolean') {
      return res.status(400).json({ error: 'Invalid banned status' })
    }

    const user = await prisma.user.update({
      where: { id: id as string },
      data: { banned },
      select: {
        id: true,
        username: true,
        email: true,
        banned: true,
      },
    })

    return res.status(200).json({ user })
  } catch (error) {
    console.error('Ban/unban user error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
