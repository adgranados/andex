import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function GET(request: Request, { params }: { params: { tenantId: string; id: string } }) {
    try {
        const { tenantId, id: assemblyId } = params;
        const snapshot = await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/attendance`).get();

        const attendance = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(attendance);
    } catch (error) {
        console.error('Error fetching attendance:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { tenantId: string; id: string } }) {
    try {
        const { tenantId, id: assemblyId } = params;
        const body = await request.json();
        const { propertyId, propertyName, ownerName, coefficient, representative, status } = body;

        if (!propertyId) {
            return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
        }

        // Use propertyId as the document ID to ensure uniqueness per property
        await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/attendance`).doc(propertyId).set({
            propertyId,
            propertyName,
            ownerName,
            coefficient: Number(coefficient) || 0,
            representative: representative || ownerName,
            status: status || 'PRESENT',
            registeredAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error registering attendance:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
