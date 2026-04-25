import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ''

// Rate limiting simple en mémoire (reset au redémarrage du serveur)
const attempts = new Map<string, { count: number; resetAt: number }>()
const MAX_ATTEMPTS = 5
const WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function getIp(req: NextRequest): string {
  return req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'
}

function isRateLimited(ip: string): boolean {
  const now = Date.now()
  const entry = attempts.get(ip)

  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS })
    return false
  }

  if (entry.count >= MAX_ATTEMPTS) return true

  entry.count++
  return false
}

function resetAttempts(ip: string) {
  attempts.delete(ip)
}

export async function POST(req: NextRequest) {
  const ip = getIp(req)

  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: 'Trop de tentatives. Réessayez dans 15 minutes.' },
      { status: 429 }
    )
  }

  let body: { password?: string }
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Requête invalide.' }, { status: 400 })
  }

  const { password } = body

  if (!password || password !== ADMIN_PASSWORD || ADMIN_PASSWORD === '') {
    return NextResponse.json({ error: 'Mot de passe incorrect.' }, { status: 401 })
  }

  resetAttempts(ip)

  const res = NextResponse.json({ ok: true })
  res.cookies.set('admin_auth', ADMIN_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 heures
    path: '/',
  })
  return res
}
