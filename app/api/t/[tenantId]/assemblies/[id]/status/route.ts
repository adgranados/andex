import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function GET(request: Request, { params }: { params: { tenantId: string; id: string } }) {
    try {
        const { tenantId, id } = params;
        const doc = await db.collection(`tCollections/${tenantId}/assemblies`).doc(id).get();

        if (!doc.exists) {
            return NextResponse.json({ error: 'Not Found' }, { status: 404 });
        }

        return NextResponse.json({ status: doc.data()?.status });
    } catch (error) {
        console.error('Error fetching status:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
