import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'
import { validateImageUrl } from '../lib/imageValidator.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      const { avatarUrl } = req.body

      // Validate avatar URL if provided
      if (avatarUrl && avatarUrl.trim()) {
        const validation = await validateImageUrl(avatarUrl)
        if (!validation.valid) {
          return res.status(400).json({ error: validation.error })
        }
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { avatarUrl },
      })

      return res.status(200).json({ user: updated })
    } catch (error) {
      console.error('Update avatar error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

