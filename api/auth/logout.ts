import type { VercelRequest, VercelResponse } from '@vercel/node'
import { clearSessionCookie } from '../lib/auth'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Clear session cookie
  clearSessionCookie(res)

  return res.status(200).json({ message: 'Logged out successfully' })
}
