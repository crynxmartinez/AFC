import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../../lib/prisma'
import { requireAdmin } from '../../../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'PUT') {
    const user = requireAdmin(req, res)
    if (!user) return

    try {
      const { status, rejectionReason } = req.body

      if (!status || !['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' })
      }

      if (status === 'rejected' && !rejectionReason) {
        return res.status(400).json({ error: 'Rejection reason required' })
      }

      const entry = await prisma.entry.update({
        where: { id: id as string },
        data: {
          status,
          rejectionReason: status === 'rejected' ? rejectionReason : null,
          approvedAt: status === 'approved' ? new Date() : null,
        },
      })

      return res.status(200).json({ entry })
    } catch (error) {
      console.error('Review entry error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
