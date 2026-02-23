import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { name, email, subject, message, userId } = req.body

    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    const submission = await prisma.contactSubmission.create({
      data: {
        name,
        email,
        subject,
        message,
        userId: userId || null,
        status: 'pending',
      },
    })

    return res.status(201).json({ submission })
  } catch (error) {
    console.error('Contact submission error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
