import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { serialize, parse } from 'cookie'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-change-in-production'
const COOKIE_NAME = 'afc-session'

export interface SessionUser {
  id: string
  email: string
  username: string
  role: string
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export function generateToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser
  } catch {
    return null
  }
}

export function setSessionCookie(res: VercelResponse, token: string) {
  const cookie = serialize(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
  res.setHeader('Set-Cookie', cookie)
}

export function clearSessionCookie(res: VercelResponse) {
  const cookie = serialize(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  res.setHeader('Set-Cookie', cookie)
}

export function getSessionFromRequest(req: VercelRequest): SessionUser | null {
  const cookies = parse(req.headers.cookie || '')
  const token = cookies[COOKIE_NAME]
  
  if (!token) return null
  
  return verifyToken(token)
}

export function requireAuth(req: VercelRequest, res: VercelResponse): SessionUser | null {
  const user = getSessionFromRequest(req)
  
  if (!user) {
    res.status(401).json({ error: 'Unauthorized' })
    return null
  }
  
  return user
}

export function requireAdmin(req: VercelRequest, res: VercelResponse): SessionUser | null {
  const user = requireAuth(req, res)
  
  if (!user) return null
  
  if (user.role !== 'admin') {
    res.status(403).json({ error: 'Forbidden - Admin access required' })
    return null
  }
  
  return user
}
