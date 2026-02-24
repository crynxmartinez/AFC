import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../lib/prisma.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { userId } = req.query

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId as string },
        select: {
          id: true,
          username: true,
          level: true,
          xp: true,
          totalXp: true,
        },
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Get current and next level config
      const [currentLevel, nextLevel] = await Promise.all([
        prisma.levelConfig.findUnique({
          where: { level: user.level },
        }),
        prisma.levelConfig.findUnique({
          where: { level: user.level + 1 },
        }),
      ])

      const progress = {
        user,
        currentLevel,
        nextLevel,
        xpToNextLevel: nextLevel ? nextLevel.xpRequired - user.xp : 0,
        progressPercentage: nextLevel 
          ? Math.min(100, (user.xp / nextLevel.xpRequired) * 100)
          : 100,
      }

      return res.status(200).json(progress)
    } catch (error) {
      console.error('Get XP progress error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
