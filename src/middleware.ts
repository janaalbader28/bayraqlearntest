import { NextResponse, type NextRequest } from 'next/server'
import { decrypt } from '@/lib/auth'

export async function middleware(request: NextRequest) {
    const session = request.cookies.get('session')?.value
    const path = request.nextUrl.pathname

    if (path.startsWith('/dashboard')) {
        // No session at all → redirect to login
        if (!session) {
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('next', path)
            return NextResponse.redirect(loginUrl)
        }

        let role: string | undefined
        try {
            const data = await decrypt(session)
            role = data?.user?.role
        } catch {
            // Expired / invalid JWT
            const loginUrl = new URL('/login', request.url)
            loginUrl.searchParams.set('next', path)
            return NextResponse.redirect(loginUrl)
        }

        // Admin-only area
        if (path.startsWith('/dashboard/admin')) {
            if (role !== 'admin' && role !== 'super_admin') {
                // Students trying to access admin → back to their dashboard
                return NextResponse.redirect(new URL('/dashboard', request.url))
            }
            return NextResponse.next()
        }

        // Students (and instructors) in the regular dashboard
        // Admins should stay in the admin area — redirect them
        if (role === 'admin' || role === 'super_admin') {
            // Allow admin to reach /dashboard root (overview) but nowhere else in the student area
            if (path !== '/dashboard') {
                return NextResponse.redirect(new URL('/dashboard/admin', request.url))
            }
        }

        return NextResponse.next()
    }

    // Auth routes: redirect to dashboard if already logged in with valid session
    if (path === '/login' || path === '/register') {
        if (session) {
            try {
                const data = await decrypt(session)
                const role = data?.user?.role
                const dest = (role === 'admin' || role === 'super_admin') ? '/dashboard/admin' : '/dashboard'
                return NextResponse.redirect(new URL(dest, request.url))
            } catch {
                // Expired session — allow login/register page
            }
        }
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/login', '/register'],
}
