import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function GET(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const snapshot = await db.collection(`tCollections/${tenantId}/propertyTypes`).get();
        const types = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(types);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch property types' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const body = await request.json();
        const { name } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const docRef = await db.collection(`tCollections/${tenantId}/propertyTypes`).add({
            name,
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ id: docRef.id, name });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create property type' }, { status: 500 });
    }
}
