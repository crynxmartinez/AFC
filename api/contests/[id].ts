import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma.js'
import { requireAdmin } from '../lib/auth.js'
import { handleCors } from '../lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return
  const { id } = req.query

  if (req.method === 'GET') {
    try {
      // Auto-update contest status based on dates
      const now = new Date()
      const contestToCheck = await prisma.contest.findUnique({
        where: { id: id as string },
        select: { status: true, startDate: true, endDate: true },
      })

      if (contestToCheck) {
        let newStatus = contestToCheck.status
        
        // Check if should be active
        if (contestToCheck.status === 'draft' && 
            contestToCheck.startDate <= now && 
            contestToCheck.endDate >= now) {
          newStatus = 'active'
        }
        
        // Check if should be ended
        if ((contestToCheck.status === 'draft' || contestToCheck.status === 'active') && 
            contestToCheck.endDate < now) {
          newStatus = 'ended'
        }
        
        // Update if status changed
        if (newStatus !== contestToCheck.status) {
          await prisma.contest.update({
            where: { id: id as string },
            data: { status: newStatus },
          })
        }
      }

      const contest = await prisma.contest.findUnique({
        where: { id: id as string },
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
      })

      if (!contest) {
        return res.status(404).json({ error: 'Contest not found' })
      }

      return res.status(200).json({ contest })
    } catch (error) {
      console.error('Get contest error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'PUT') {
    const user = requireAdmin(req, res)
    if (!user) return

    try {
      const contest = await prisma.contest.update({
        where: { id: id as string },
        data: req.body,
      })

      return res.status(200).json({ contest })
    } catch (error) {
      console.error('Update contest error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  if (req.method === 'DELETE') {
    const user = requireAdmin(req, res)
    if (!user) return

    try {
      await prisma.contest.delete({
        where: { id: id as string },
      })

      return res.status(200).json({ message: 'Contest deleted' })
    } catch (error) {
      console.error('Delete contest error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
