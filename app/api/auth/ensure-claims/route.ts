import { NextResponse } from 'next/server';
import { adminAuth, db } from '@/src/server/firebaseAdmin';
import { resolveTenantByEmailDomain } from '@/src/lib/tenant';

export async function POST(request: Request) {
  const body = await request.json();
  const { uid, email, cookieTenantId } = body as { uid?: string; email?: string; cookieTenantId?: string };

  if (!uid) {
    return NextResponse.json({ error: 'UID requerido' }, { status: 400 });
  }

  let tenantId = cookieTenantId;

  if (!tenantId && email) {
    const resolved = await resolveTenantByEmailDomain(email);
    tenantId = resolved.tenantId;
  }

  if (!tenantId) {
    return NextResponse.json({ error: 'Tenant no detectado' }, { status: 400 });
  }

  try {
    await db.collection('users').doc(uid).set({ tenantId }, { merge: true });
    await adminAuth.setCustomUserClaims(uid, { tenantId });
    await adminAuth.revokeRefreshTokens(uid);
  } catch (error) {
    console.error('[ensure-claims] error persisting tenant', error);
    return NextResponse.json({ error: 'No se pudo guardar tenant' }, { status: 500 });
  }

  return NextResponse.json({ tenantId });
}
