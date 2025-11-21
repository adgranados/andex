import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function GET(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { searchParams } = new URL(request.url);
        const code = searchParams.get('code');

        if (!code) {
            return NextResponse.json({ error: 'Assembly code is required' }, { status: 400 });
        }

        const { tenantId } = params;

        // 1. Validate Assembly Code
        const assembliesSnapshot = await db.collection(`tCollections/${tenantId}/assemblies`)
            .where('code', '==', code)
            .limit(1)
            .get();

        if (assembliesSnapshot.empty) {
            return NextResponse.json({ error: 'Invalid assembly code' }, { status: 404 });
        }

        // 2. Fetch Properties
        const propertiesSnapshot = await db.collection(`tCollections/${tenantId}/properties`).get();
        const properties = propertiesSnapshot.docs.map(doc => ({
            id: doc.id,
            name: doc.data().name
        })).sort((a, b) => a.name.localeCompare(b.name));

        return NextResponse.json(properties);

    } catch (error) {
        console.error('Error fetching properties:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
