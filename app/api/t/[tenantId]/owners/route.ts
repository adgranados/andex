import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function GET(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const snapshot = await db.collection(`tCollections/${tenantId}/owners`).get();
        const owners = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(owners);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch owners' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const body = await request.json();
        const { name, identificationNumber } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Basic validation for uniqueness of ID if provided could be added here, 
        // but for now we stick to the basic requirement.

        const docRef = await db.collection(`tCollections/${tenantId}/owners`).add({
            ...body,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ id: docRef.id, ...body });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create owner' }, { status: 500 });
    }
}
