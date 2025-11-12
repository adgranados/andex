import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { resolveTenantByHost } from '@/src/lib/tenant';

export async function middleware(req: NextRequest) {
  const host = req.headers.get('host') || '';
  let tenantId: string | undefined;
  try {
    const { tenantId: resolved } = await resolveTenantByHost(host);
    tenantId = resolved;
  } catch (error) {
    console.error('[middleware] tenant resolve failed', error);
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
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
