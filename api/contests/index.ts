import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma.js'
import { requireAdmin } from '../lib/auth.js'
import { handleCors } from '../lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method === 'GET') {
    try {
      const { status } = req.query
      
      // First, auto-update contest statuses based on dates
      const now = new Date()
      
      // Update contests that should be active
      await prisma.contest.updateMany({
        where: {
          status: 'draft',
          startDate: { lte: now },
          endDate: { gte: now },
        },
        data: { status: 'active' },
      })
      
      // Update contests that should be ended
      await prisma.contest.updateMany({
        where: {
          status: { in: ['draft', 'active'] },
          endDate: { lt: now },
        },
        data: { status: 'ended' },
      })
      
      const where = status ? { status: status as string } : {}
      
      const contests = await prisma.contest.findMany({
        where,
        include: {
          createdBy: {
            select: {
              id: true,
              username: true,
              displayName: true,
            },
          },
          _count: {
            select: {
              entries: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      })

      return res.status(200).json({ contests })
    } catch (error) {
      console.error('List contests error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'POST') {
    const user = requireAdmin(req, res)
    if (!user) return

    try {
      const {
        title,
        description,
        category,
        startDate,
        endDate,
        thumbnailUrl,
        hasSponsor,
        sponsorName,
        sponsorLogoUrl,
        sponsorPrizeAmount,
      } = req.body

      if (!title || !description || !startDate || !endDate) {
        return res.status(400).json({ error: 'Missing required fields' })
      }

      const contest = await prisma.contest.create({
        data: {
          title,
          description,
          category: category || 'art',
          startDate: new Date(startDate),
          endDate: new Date(endDate),
          thumbnailUrl,
          hasSponsor: hasSponsor || false,
          sponsorName,
          sponsorLogoUrl,
          sponsorPrizeAmount,
          createdById: user.id,
          status: 'draft',
        },
      })

      return res.status(201).json({ contest })
    } catch (error) {
      console.error('Create contest error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

