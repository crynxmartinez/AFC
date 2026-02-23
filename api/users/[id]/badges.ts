import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const badges = await prisma.userBadge.findMany({
      where: {
        userId: id as string,
      },
      orderBy: {
        earnedAt: 'desc',
      },
    })

    return res.status(200).json({ badges })
  } catch (error) {
    console.error('Get badges error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
