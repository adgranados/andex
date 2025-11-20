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
        const { name, description } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        const docRef = await db.collection(`tCollections/${tenantId}/propertyTypes`).add({
            name,
            description: description || '',
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ id: docRef.id, name, description });
    } catch (error) {
        console.error('Error creating property type:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const body = await request.json();
        const { id, name, description } = body;

        if (!id || !name) {
            return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
        }

        await db.collection(`tCollections/${tenantId}/propertyTypes`).doc(id).update({
            name,
            description: description || ''
        });

        return NextResponse.json({ id, name, description });
    } catch (error) {
        console.error('Error updating property type:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
