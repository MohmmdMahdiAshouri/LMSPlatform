import { NextResponse, type NextRequest } from 'next/server';

const PROTECTED_PATHS = ['/dashboard'];
const AUTH_PATHS = ['/auth'];

export function proxy(req: NextRequest) {
    const { pathname } = req.nextUrl;
    const hasRefreshCookie = Boolean(req.cookies.get('refreshToken')?.value);

    if (PROTECTED_PATHS.some((p) => pathname.startsWith(p))) {
        if (!hasRefreshCookie) {
            const url = req.nextUrl.clone();
            url.pathname = '/auth';
            url.searchParams.set('next', pathname);
            return NextResponse.redirect(url);
        }
    }

    if (AUTH_PATHS.some((p) => pathname.startsWith(p)) && hasRefreshCookie) {
        // const url = req.nextUrl.clone();
        // url.pathname = '/dashboard';
        // url.search = '';
        return NextResponse.next();
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/auth/:path*'],
};
