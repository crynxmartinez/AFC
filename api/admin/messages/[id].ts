import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../lib/prisma'
import { requireAdmin } from '../../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'PUT') {
    const user = requireAdmin(req, res)
    if (!user) return

    try {
      const { status, adminNotes } = req.body

      const data: any = {}
      
      if (status) {
        data.status = status
        if (status === 'read' && !data.readAt) {
          data.readAt = new Date()
        }
        if (status === 'resolved') {
          data.resolvedAt = new Date()
        }
      }
      
      if (adminNotes !== undefined) {
        data.adminNotes = adminNotes
      }

      const message = await prisma.contactSubmission.update({
        where: { id: id as string },
        data,
      })

      return res.status(200).json({ message })
    } catch (error) {
      console.error('Update message error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
