import type { VercelRequest, VercelResponse } from '@vercel/node'
import prisma from '../lib/prisma'
import { hashPassword, generateToken, setSessionCookie } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { email, username, password } = req.body

    if (!email || !username || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' })
    }

    // Validate username (alphanumeric, underscore, 3-20 chars)
    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/
    if (!usernameRegex.test(username)) {
      return res.status(400).json({ error: 'Username must be 3-20 characters (letters, numbers, underscore only)' })
    }

    // Validate password length
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' })
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email },
    })

    if (existingEmail) {
      return res.status(400).json({ error: 'Email already registered' })
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username },
    })

    if (existingUsername) {
      return res.status(400).json({ error: 'Username already taken' })
    }

    // Hash password
    const passwordHash = await hashPassword(password)

    // Create user with default values (matching create_user_profile RPC)
    const user = await prisma.user.create({
      data: {
        email,
        username,
        passwordHash,
        role: 'user',
        pointsBalance: 100, // Starting points (100 free votes)
        totalSpent: 0,
        xp: 0,
        level: 1,
        totalXp: 0,
        emailVerified: true, // No email verification for now
      },
    })

    // Generate session token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    })

    // Set session cookie
    setSessionCookie(res, token)

    // Return user data (without password hash)
    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        level: user.level,
        xp: user.xp,
        pointsBalance: user.pointsBalance,
      },
    })
  } catch (error) {
    console.error('Signup error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
