import { NextResponse } from 'next/server';
import { adminAuth, db } from '@/src/server/firebaseAdmin';
import { resolveTenantByEmail } from '@/src/lib/tenant';

export async function POST(request: Request) {
  const body = await request.json();
  const { uid, email, cookieTenantId } = body as { uid?: string; email?: string; cookieTenantId?: string };
  console.log('[ensure-claims] request body:', body);
  if (!uid) {
    console.error('[ensure-claims] missing uid in request body');
    return NextResponse.json({ error: 'UID requerido' }, { status: 400 });
  }

  let tenantId = cookieTenantId;

  if (!tenantId && email) {
    const resolved = await resolveTenantByEmail(email);
    if(!resolved.tenantId){
      console.error('[ensure-claims] no se pudo resolver el tenant por email:', email);
      return NextResponse.json({ error: 'No se pudo resolver el tenant por email' }, { status: 400 });
    }
    tenantId = resolved.tenantId;
  }

  if (!tenantId) {
    console.error('[ensure-claims] tenantId no detectado para uid:', uid);
    return NextResponse.json({ error: 'Tenant no detectado' }, { status: 400 });
  }

  try {
    await db.collection('users').doc(uid).set({ tenantId }, { merge: true });
    await adminAuth.setCustomUserClaims(uid, { tenantId });
    // await adminAuth.revokeRefreshTokens(uid);
  } catch (error) {
    console.error('[ensure-claims] error persisting tenant', error);
    return NextResponse.json({ error: 'No se pudo guardar tenant' }, { status: 500 });
  }

  return NextResponse.json({ tenantId });
}
