import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma.js'
import { requireAuth } from '../lib/auth.js'
import { validateImageUrl } from '../lib/imageValidator.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === 'POST') {
    const user = requireAuth(req, res)
    if (!user) return

    try {
      const { coverPhotoUrl } = req.body

      // Validate cover photo URL if provided
      if (coverPhotoUrl && coverPhotoUrl.trim()) {
        const validation = await validateImageUrl(coverPhotoUrl)
        if (!validation.valid) {
          return res.status(400).json({ error: validation.error })
        }
      }

      const updated = await prisma.user.update({
        where: { id: user.id },
        data: { coverPhotoUrl },
      })

      return res.status(200).json({ user: updated })
    } catch (error) {
      console.error('Update cover photo error:', error)
      return res.status(500).json({ error: 'Internal server error' })
    }
  }

  return res.status(405).json({ error: 'Method not allowed' })
}

