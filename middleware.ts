import { NextRequest, NextResponse } from 'next/server'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? ''

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  const cookie = req.cookies.get('admin_auth')?.value
  if (cookie === ADMIN_PASSWORD && ADMIN_PASSWORD !== '') {
    return NextResponse.next()
  }

  // Pas de cookie valide → redirection vers login
  if (pathname !== '/admin/login') {
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: '/admin/:path*',
}
