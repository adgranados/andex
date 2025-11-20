import { NextResponse } from 'next/server';
import { adminAuth, db } from '@/src/server/firebaseAdmin';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { uid, email, tenantName, slug } = body;

        if (!uid || !email || !tenantName || !slug) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Check if slug is available
        const existingTenant = await db.collection('tenants').where('subdomains', 'array-contains', slug).get();
        if (!existingTenant.empty) {
            return NextResponse.json({ error: 'Subdomain already taken' }, { status: 409 });
        }

        // 2. Create tenant
        const tenantRef = db.collection('tenants').doc();
        const tenantId = tenantRef.id;

        await tenantRef.set({
            name: tenantName,
            subdomains: [slug],
            emails: [email],
            createdAt: new Date().toISOString(),
            ownerId: uid,
            users: [uid]
        });

        // 3. Update user with tenantId
        await db.collection('users').doc(uid).set({ tenantId }, { merge: true });

        // 4. Set custom claims
        await adminAuth.setCustomUserClaims(uid, { tenantId });

        return NextResponse.json({ tenantId, slug });
    } catch (error) {
        console.error('[tenants/create] error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
