import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../src/lib/prisma'
import { requireAdmin } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'GET') {
    const user = requireAdmin(req, res)
    if (!user) return

    try {
      const { status } = req.query
      
      const where = status && status !== 'all' ? { status: status as string } : {}

      const messages = await prisma.contactSubmission.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return res.status(200).json({ messages })
    } catch (error) {
      console.error('Get messages error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
