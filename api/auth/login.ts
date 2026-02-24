import type { VercelRequest, VercelResponse } from '@vercel/node'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { serialize } from 'cookie'

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
})
const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
const COOKIE_NAME = 'afc-session'

interface SessionUser {
  id: string
  email: string
  username: string
  role: string
}

const ALLOWED_ORIGINS = [
  'https://www.arenaforcreatives.online',
  'https://arenaforcreatives.online',
  'http://localhost:5173',
  'http://localhost:3000',
]

function setCorsHeaders(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin || ''
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie')
  res.setHeader('Access-Control-Max-Age', '86400')
}

function handleCors(req: VercelRequest, res: VercelResponse): boolean {
  setCorsHeaders(req, res)
  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return true
  }
  return false
}

async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

function generateToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

function setSessionCookie(res: VercelResponse, token: string) {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  res.setHeader('Set-Cookie', cookie)
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (handleCors(req, res)) return

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { emailOrUsername, password } = req.body

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: 'Missing required fields' })
    }

    // Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: emailOrUsername },
          { username: emailOrUsername },
        ],
      },
    })

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.passwordHash)

    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    // Generate session token
    const token = generateToken({
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    })

    // Set session cookie
    setSessionCookie(res, token)

    // Update last active timestamp
    await prisma.user.update({
      where: { id: user.id },
      data: { lastActiveAt: new Date() },
    })

    // Return user data
    return res.status(200).json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        level: user.level,
        xp: user.xp,
        pointsBalance: user.pointsBalance,
        avatarUrl: user.avatarUrl,
        displayName: user.displayName,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
}
