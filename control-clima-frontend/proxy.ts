import { NextRequest, NextResponse } from 'next/server'

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl
    const token = request.cookies.get('accessToken')?.value
    const rolesStr = request.cookies.get('user_roles')?.value
    const modulesStr = request.cookies.get('user_modules')?.value

    let roles: string[] = []
    let modules: string[] = []

    try {
        if (rolesStr) roles = JSON.parse(rolesStr)
        if (modulesStr) modules = JSON.parse(modulesStr)
    } catch (e) {
        console.error('Error parsing session cookies in proxy:', e)
    }

    const isAdmin = roles.includes('admin')
    const hasDispositivos = modules.includes('dispositivos')

    // 1. Define public paths
    const isPublicPath =
        pathname === '/login' ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/_next') ||
        pathname.startsWith('/icons/') ||
        pathname.startsWith('/reset-password') ||
        pathname.includes('.')

    // 2. Redirect unauthenticated users to login (allow public assets)
    if (!token && !isPublicPath) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    // 3. Redirect authenticated users away from login
    if (token && isPublicPath) {
        return NextResponse.redirect(new URL(isAdmin ? '/admin' : '/salas', request.url))
    }

    // 4. Protect admin paths
    if (pathname.startsWith('/admin') && !isAdmin) {
        return NextResponse.redirect(new URL('/salas', request.url))
    }

    // 5. Protect modular dashboard (/)
    if (pathname === '/' && !hasDispositivos) {
        return NextResponse.redirect(new URL('/salas', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
