import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function POST(request: Request, { params }: { params: { tenantId: string; id: string } }) {
    try {
        const { tenantId, id } = params;

        await db.collection(`tCollections/${tenantId}/assemblies`).doc(id).update({
            status: 'OPEN'
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error starting assembly:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
