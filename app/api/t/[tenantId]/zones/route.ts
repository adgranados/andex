import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function GET(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const snapshot = await db.collection(`tCollections/${tenantId}/zones`).get();
        const zones = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        return NextResponse.json(zones);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch zones' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const body = await request.json();
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const docRef = await db.collection(`tCollections/${tenantId}/zones`).add({
            name,
            description: description || '',
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ id: docRef.id, name, description });
    } catch (error) {
        return NextResponse.json({ error: 'Failed to create zone' }, { status: 500 });
    }
}
