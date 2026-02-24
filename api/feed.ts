import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from './lib/prisma.js'
import { getSessionFromRequest } from './lib/auth.js'
import { handleCors } from './lib/cors.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return
  if (req.method === 'GET') {
    try {
      const { filter = 'latest' } = req.query
      const user = getSessionFromRequest(req)

      let entries

      if (filter === 'following' && user) {
        // Get entries from followed users
        const following = await prisma.follow.findMany({
          where: { followerId: user.id },
          select: { followingId: true },
        })

        const followingIds = following.map(f => f.followingId)

        entries = await prisma.entry.findMany({
          where: {
            status: 'approved',
            userId: { in: followingIds },
          },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                level: true,
              },
            },
            contest: {
              select: {
                id: true,
                title: true,
                category: true,
              },
            },
            _count: {
              select: {
                reactions: true,
                comments: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
      } else if (filter === 'popular') {
        // Get entries sorted by reactions
        entries = await prisma.entry.findMany({
          where: { status: 'approved' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                level: true,
              },
            },
            contest: {
              select: {
                id: true,
                title: true,
                category: true,
              },
            },
            _count: {
              select: {
                reactions: true,
                comments: true,
              },
            },
          },
          orderBy: { voteCount: 'desc' },
          take: 20,
        })
      } else {
        // Latest entries
        entries = await prisma.entry.findMany({
          where: { status: 'approved' },
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
                level: true,
              },
            },
            contest: {
              select: {
                id: true,
                title: true,
                category: true,
              },
            },
            _count: {
              select: {
                reactions: true,
                comments: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        })
      }

      return res.status(200).json({ entries })
    } catch (error) {
      console.error('Get feed error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}
