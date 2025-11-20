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
        const { name, identificationNumber, email, phone } = body;

        if (!name) {
            return NextResponse.json({ error: 'Name is required' }, { status: 400 });
        }

        // Basic validation for uniqueness of ID if provided could be added here, 
        // but for now we stick to the basic requirement.

        const docRef = await db.collection(`tCollections/${tenantId}/owners`).add({
            name,
            identificationNumber: identificationNumber || '',
            email: email || '',
            phone: phone || '',
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ id: docRef.id, name, identificationNumber, email, phone });
    } catch (error) {
        console.error('Error creating owner:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PUT(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const body = await request.json();
        const { id, name, identificationNumber, email, phone } = body;

        if (!id || !name) {
            return NextResponse.json({ error: 'ID and Name are required' }, { status: 400 });
        }

        await db.collection(`tCollections/${tenantId}/owners`).doc(id).update({
            name,
            identificationNumber: identificationNumber || '',
            email: email || '',
            phone: phone || ''
        });

        return NextResponse.json({ id, name, identificationNumber, email, phone });
    } catch (error) {
        console.error('Error updating owner:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
