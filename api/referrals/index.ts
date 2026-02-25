import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma'
import { requireAuth } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = requireAuth(req, res)
  if (!user) return

  if (req.method === 'GET') {
    try {
      // Get user's referral stats
      const userWithReferrals = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
          referralCode: true,
          referralsMade: {
            include: {
              referred: {
                select: {
                  username: true,
                  displayName: true,
                  avatarUrl: true,
                  createdAt: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
        },
      })

      if (!userWithReferrals) {
        return res.status(404).json({ error: 'User not found' })
      }

      // Generate referral code if user doesn't have one
      let referralCode = userWithReferrals.referralCode
      if (!referralCode) {
        referralCode = `${user.username.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
        await prisma.user.update({
          where: { id: user.id },
          data: { referralCode },
        })
      }

      const stats = {
        referralCode,
        totalReferrals: userWithReferrals.referralsMade.length,
        completedReferrals: userWithReferrals.referralsMade.filter(r => r.status === 'completed').length,
        totalBonusXp: userWithReferrals.referralsMade.reduce((sum, r) => sum + r.bonusXpAwarded, 0),
        referrals: userWithReferrals.referralsMade,
      }

      return res.status(200).json(stats)
    } catch (error) {
      console.error('Error fetching referral stats:', error)
      return res.status(500).json({ error: 'Failed to fetch referral stats' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
