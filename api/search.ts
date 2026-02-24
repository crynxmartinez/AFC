import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './lib/prisma'
import { handleCors } from './lib/cors'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return
  if (req.method === 'GET') {
    try {
      const { q, type = 'all' } = req.query
      
      if (!q || typeof q !== 'string') {
        return res.status(400).json({ error: 'Search query required' })
      }

      const searchQuery = q.trim()
      const results: any = {
        contests: [],
        users: [],
        entries: [],
      }

      // Search contests
      if (type === 'all' || type === 'contests') {
        results.contests = await prisma.contest.findMany({
          where: {
            OR: [
              { title: { contains: searchQuery, mode: 'insensitive' } },
              { description: { contains: searchQuery, mode: 'insensitive' } },
            ],
          },
          include: {
            _count: {
              select: { entries: true },
            },
          },
          take: 10,
        })
      }

      // Search users
      if (type === 'all' || type === 'users') {
        results.users = await prisma.user.findMany({
          where: {
            OR: [
              { username: { contains: searchQuery, mode: 'insensitive' } },
              { displayName: { contains: searchQuery, mode: 'insensitive' } },
            ],
          },
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            level: true,
            bio: true,
          },
          take: 10,
        })
      }

      // Search entries
      if (type === 'all' || type === 'entries') {
        results.entries = await prisma.entry.findMany({
          where: {
            status: 'approved',
            OR: [
              { title: { contains: searchQuery, mode: 'insensitive' } },
              { description: { contains: searchQuery, mode: 'insensitive' } },
            ],
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
            contest: {
              select: {
                id: true,
                title: true,
              },
            },
            _count: {
              select: {
                reactions: true,
                comments: true,
              },
            },
          },
          take: 10,
        })
      }

      return res.status(200).json(results)
    } catch (error) {
      console.error('Search error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
