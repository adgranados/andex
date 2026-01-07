import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function PUT(request: Request, { params }: { params: { tenantId: string; id: string; questionId: string } }) {
    try {
        const { tenantId, id: assemblyId, questionId } = params;
        const body = await request.json();
        const { status } = body;

        if (!status) {
            return NextResponse.json({ error: 'Status is required' }, { status: 400 });
        }

        const updateData: any = { status };

        // If closing, we might want to trigger result calculation here or in a separate process.
        // For now, we just update the status.
        if (status === 'CLOSED') {
            updateData.closedAt = new Date().toISOString();
        } else if (status === 'VOIDED') {
            updateData.voidedAt = new Date().toISOString();
        }

        await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions`).doc(questionId).update(updateData);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating question:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
