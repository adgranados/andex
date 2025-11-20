import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function GET(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const snapshot = await db.collection(`tCollections/${tenantId}/properties`).get();
        const properties = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(properties);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch properties' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const body = await request.json();
        const { address, coefficient, typeId, zoneId, ownerId } = body;

        if (!address || !typeId || !zoneId || !ownerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        if (coefficient <= 0) {
            return NextResponse.json({ error: 'Coefficient must be greater than 0' }, { status: 400 });
        }

        const docRef = await db.collection(`tCollections/${tenantId}/properties`).add({
            ...body,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ id: docRef.id, ...body });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create property' }, { status: 500 });
    }
}
