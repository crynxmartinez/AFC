import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../lib/prisma.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const reactions = await prisma.commentReaction.findMany({
      where: {
        commentId: id as string,
      },
      include: {
        user: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
          },
        },
      },
    })

    return res.status(200).json({ reactions })
  } catch (error) {
    console.error('Get comment reactions error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
