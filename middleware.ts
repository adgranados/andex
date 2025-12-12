import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  let tenantId: string | undefined;

  if (host) {
    try {
      // Use 127.0.0.1 and fixed port 3000 (or PORT env) to fetch from the local API
      // This avoids issues with SSL termination proxies or docker port mappings
      // where req.nextUrl.origin might differ from the actual listening address.
      const port = process.env.PORT || '3000';
      const lookupUrl = new URL(`http://127.0.0.1:${port}/api/tenants/resolve`);
      lookupUrl.searchParams.set('host', host);
      const response = await fetch(lookupUrl, {
        headers: {
          'x-tenant-lookup': 'middleware',
          accept: 'application/json'
        },
        cache: 'no-store'
      });
      if (response.ok) {
        const data = (await response.json()) as { tenantId?: string };
        tenantId = data?.tenantId;
      }
    } catch (error) {
      console.error('[middleware] tenant resolve fetch failed', error);
    }
  }

  if (tenantId) {
    const res = NextResponse.next();
    res.cookies.set('tenantId', tenantId, {
      httpOnly: true,
      secure: true,
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24
    });
    return res;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/tenants/resolve).*)']
};
