import { NextResponse } from 'next/server';
import { resolveTenantByHost } from '@/src/lib/tenant';

export const runtime = 'nodejs';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const hostFromQuery = searchParams.get('host');
  const host = hostFromQuery || request.headers.get('host') || '';

  if (!host) {
    return NextResponse.json({ tenantId: undefined }, { status: 200 });
  }

  try {
    const { tenantId } = await resolveTenantByHost(host);
    return NextResponse.json({ tenantId }, { status: 200 });
  } catch (error) {
    console.error('[api/tenants/resolve] failed', error);
    return NextResponse.json({ tenantId: undefined }, { status: 500 });
  }
}
