import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';
import { getTenantById } from '@/src/lib/tenant';

export async function PUT(
    request: Request,
    { params }: { params: { tenantId: string } }
) {
    try {
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const tenantId = params.tenantId;

        // Verify tenant exists
        const tenant = await getTenantById(tenantId);
        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        // Update tenant name
        await db.collection('tenants').doc(tenantId).update({
            name: name
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('[settings/update] error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
