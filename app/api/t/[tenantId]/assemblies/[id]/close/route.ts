import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function POST(request: Request, { params }: { params: { tenantId: string; id: string } }) {
    try {
        const { tenantId, id: assemblyId } = params;

        await db.collection(`tCollections/${tenantId}/assemblies`).doc(assemblyId).update({
            status: 'CLOSED',
            closedAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error closing assembly:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
