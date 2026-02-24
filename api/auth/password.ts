import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma.js'
import { hashPassword, verifyToken } from '../lib/auth.js'
import cookie from 'cookie'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // Get token from cookie
    const cookies = cookie.parse(req.headers.cookie || '')
    const token = cookies.session

    if (!token) {
      return res.status(401).json({ error: 'Not authenticated' })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' })
    }

    // Get user with password hash
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, passwordHash: true },
    })

    if (!user) {
      return res.status(404).json({ error: 'User not found' })
    }

    // Verify current password
    const bcrypt = require('bcryptjs')
    const isValid = await bcrypt.compare(currentPassword, user.passwordHash)

    if (!isValid) {
      return res.status(400).json({ error: 'Current password is incorrect' })
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword)

    // Update password
    await prisma.user.update({
      where: { id: decoded.id },
      data: { passwordHash: newPasswordHash },
    })

    return res.status(200).json({ message: 'Password updated successfully' })
  } catch (error) {
    console.error('Password update error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}

