import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../../src/lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      const entries = await prisma.entry.findMany({
        where: { 
          userId: id as string,
          status: 'approved',
        },
        include: {
          contest: {
            select: {
              id: true,
              title: true,
              category: true,
            },
          },
          _count: {
            select: {
              reactions: true,
              comments: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return res.status(200).json({ entries })
    } catch (error) {
      console.error('Get user entries error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
