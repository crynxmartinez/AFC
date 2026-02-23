import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../../../src/lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { username } = req.query

  if (req.method === 'GET') {
    try {
      const user = await prisma.user.findUnique({
        where: { username: username as string },
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
          coverPhotoUrl: true,
          bio: true,
          profileTitle: true,
          level: true,
          xp: true,
          location: true,
          skills: true,
          specialties: true,
          yearsExperience: true,
          availableForWork: true,
          instagramUrl: true,
          twitterUrl: true,
          portfolioUrl: true,
          website: true,
          createdAt: true,
          profileVisibility: true,
          showContestsJoined: true,
          showContestsWon: true,
        },
      })

      if (!user) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Check privacy settings
      if (user.profileVisibility === 'private') {
        return res.status(403).json({ error: 'Profile is private' })
      }

      return res.status(200).json({ user })
    } catch (error) {
      console.error('Get user error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
