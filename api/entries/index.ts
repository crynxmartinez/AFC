import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma'
import { requireAuth } from '../lib/auth'
import { handleCors } from '../lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return
  if (req.method === 'POST') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      const {
        contestId,
        title,
        description,
        phase1Url,
        phase2Url,
        phase3Url,
        phase4Url,
      } = req.body

      if (!contestId) {
        return res.status(400).json({ error: 'Contest ID required' })
      }

      // Check if user already has an entry for this contest
      const existing = await prisma.entry.findUnique({
        where: {
          userId_contestId: {
            userId: user.id,
            contestId,
          },
        },
      })

      if (existing) {
        // Update existing entry
        const entry = await prisma.entry.update({
          where: { id: existing.id },
          data: {
            title,
            description,
            phase1Url,
            phase2Url,
            phase3Url,
            phase4Url,
            status: 'pending',
            submittedAt: new Date(),
            lastActivityAt: new Date(),
          },
        })

        return res.status(200).json({ entry })
      }

      // Create new entry
      const entry = await prisma.entry.create({
        data: {
          userId: user.id,
          contestId,
          title,
          description,
          phase1Url,
          phase2Url,
          phase3Url,
          phase4Url,
          status: 'pending',
          submittedAt: new Date(),
        },
      })

      return res.status(201).json({ entry })
    } catch (error) {
      console.error('Create entry error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
