import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function POST(request: Request, { params }: { params: { tenantId: string; id: string } }) {
    try {
        const { tenantId, id: assemblyId } = params;
        const body = await request.json();
        const { questionId, propertyId, optionId, coefficient } = body;

        if (!questionId || !propertyId || !optionId) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Check if question is OPEN
        const questionDoc = await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions`).doc(questionId).get();
        if (!questionDoc.exists || questionDoc.data()?.status !== 'OPEN') {
            return NextResponse.json({ error: 'Question is not open for voting' }, { status: 400 });
        }

        // Check if already voted
        const voteQuery = await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions/${questionId}/votes`)
            .where('propertyId', '==', propertyId)
            .get();

        if (!voteQuery.empty) {
            return NextResponse.json({ error: 'Already voted' }, { status: 400 });
        }

        // Record Vote
        await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions/${questionId}/votes`).add({
            propertyId,
            optionId,
            coefficient: Number(coefficient) || 0,
            timestamp: new Date().toISOString()
        });

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error recording vote:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
