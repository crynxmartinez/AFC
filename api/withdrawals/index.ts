import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma'
import { requireAuth } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const user = requireAuth(req, res)
  if (!user) return

  if (req.method === 'GET') {
    try {
      const withdrawals = await prisma.withdrawal.findMany({
        where: { userId: user.id },
        orderBy: { requestedAt: 'desc' },
      })

      return res.status(200).json({ withdrawals })
    } catch (error) {
      console.error('Error fetching withdrawals:', error)
      return res.status(500).json({ error: 'Failed to fetch withdrawals' })
    }
  }

  if (req.method === 'POST') {
    try {
      const { amount, paymentMethod, paymentDetails } = req.body

      // Validation
      if (!amount || amount < 500) {
        return res.status(400).json({ error: 'Minimum withdrawal amount is 500 points' })
      }

      if (!paymentMethod || !['paypal', 'gcash'].includes(paymentMethod)) {
        return res.status(400).json({ error: 'Invalid payment method' })
      }

      if (!paymentDetails) {
        return res.status(400).json({ error: 'Payment details are required' })
      }

      // Check user's balance
      const userProfile = await prisma.user.findUnique({
        where: { id: user.id },
        select: { pointsBalance: true },
      })

      if (!userProfile || userProfile.pointsBalance < amount) {
        return res.status(400).json({ error: 'Insufficient points balance' })
      }

      // Create withdrawal request and deduct points
      const withdrawal = await prisma.$transaction(async (tx) => {
        // Deduct points
        await tx.user.update({
          where: { id: user.id },
          data: {
            pointsBalance: { decrement: amount },
            totalSpent: { increment: amount },
          },
        })

        // Create withdrawal record
        return tx.withdrawal.create({
          data: {
            userId: user.id,
            amount,
            pointsDeducted: amount,
            paymentMethod,
            paymentDetails,
            status: 'pending',
          },
        })
      })

      return res.status(201).json({ withdrawal })
    } catch (error) {
      console.error('Error creating withdrawal:', error)
      return res.status(500).json({ error: 'Failed to create withdrawal request' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
