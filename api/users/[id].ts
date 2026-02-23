import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../src/lib/prisma'
import { requireAuth } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'PUT') {
    const user = requireAuth(req, res)
    if (!user) return

    if (user.id !== id) {
      return res.status(403).json({ error: 'Forbidden' })
    }

    try {
      const updated = await prisma.user.update({
        where: { id: id as string },
        data: req.body,
      })

      return res.status(200).json({ user: updated })
    } catch (error) {
      console.error('Update user error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
