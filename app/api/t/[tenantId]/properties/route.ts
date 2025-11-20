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
        const { name, address, typeId, zoneId, ownerId, coefficient } = body;

        if (!name || !typeId || !zoneId || !ownerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const docRef = await db.collection(`tCollections/${tenantId}/properties`).add({
            name,
            zoneId,
            typeId,
            ownerId,
            address: address || '',
            coefficient: coefficient || 0,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ id: docRef.id, name, zoneId, typeId, ownerId, address, coefficient: coefficient || 0 });
    } catch (error) {
        console.error('Error creating property:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const body = await request.json();
        const { id, name, zoneId, typeId, ownerId, address, coefficient } = body;

        if (!id || !name || !zoneId || !typeId || !ownerId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        await db.collection(`tCollections/${tenantId}/properties`).doc(id).update({
            name,
            zoneId,
            typeId,
            ownerId,
            address: address || '',
            coefficient: coefficient || 0
        });

        return NextResponse.json({ id, name, zoneId, typeId, ownerId, address, coefficient: coefficient || 0 });
    } catch (error) {
        console.error('Error updating property:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
