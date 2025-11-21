import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function POST(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const body = await request.json();
        const { code, propertyIdentifier } = body;

        if (!code || !propertyIdentifier) {
            return NextResponse.json({ error: 'Code and Property Identifier are required' }, { status: 400 });
        }

        // 1. Find Assembly by Code
        const assembliesSnapshot = await db.collection(`tCollections/${tenantId}/assemblies`)
            .where('code', '==', code)
            .limit(1)
            .get();

        if (assembliesSnapshot.empty) {
            return NextResponse.json({ error: 'Invalid Assembly Code' }, { status: 404 });
        }

        const assemblyDoc = assembliesSnapshot.docs[0];
        const assemblyId = assemblyDoc.id;
        const assemblyData = assemblyDoc.data();

        if (assemblyData.status === 'CLOSED') {
            return NextResponse.json({ error: 'Assembly is closed' }, { status: 400 });
        }

        // 2. Find Property by Name (or ID if we were strict, but Name for MVP as per plan)
        // We'll search for a property where name matches propertyIdentifier (case-insensitive ideally, but exact for now)
        // Firestore doesn't do case-insensitive easily without extra fields. Let's try exact match first.
        const propertiesSnapshot = await db.collection(`tCollections/${tenantId}/properties`)
            .where('name', '==', propertyIdentifier)
            .limit(1)
            .get();

        if (propertiesSnapshot.empty) {
            return NextResponse.json({ error: 'Property not found' }, { status: 404 });
        }

        const propertyDoc = propertiesSnapshot.docs[0];
        const propertyId = propertyDoc.id;
        const propertyData = propertyDoc.data();

        // 3. Register Attendance (Auto-join)
        // We reuse the logic or just write directly. Let's write directly for speed.
        await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/attendance`).doc(propertyId).set({
            propertyId,
            propertyName: propertyData.name,
            ownerName: propertyData.ownerName || 'Unknown',
            coefficient: Number(propertyData.coefficient) || 0,
            representative: 'Self-Joined',
            status: 'PRESENT',
            registeredAt: new Date().toISOString()
        });

        // 4. Get Tenant Name
        const tenantDoc = await db.collection('tenants').doc(tenantId).get();
        const tenantName = tenantDoc.exists ? tenantDoc.data()?.name : 'Unknown Tenant';

        return NextResponse.json({
            success: true,
            assemblyId,
            assemblyCode: assemblyData.code,
            propertyId,
            propertyName: propertyData.name,
            tenantName
        });

    } catch (error) {
        console.error('Error joining assembly:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
