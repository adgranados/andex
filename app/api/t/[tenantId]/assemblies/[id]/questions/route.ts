import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function GET(request: Request, { params }: { params: { tenantId: string; id: string } }) {
    try {
        const { tenantId, id: assemblyId } = params;
        const snapshot = await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions`)
            .orderBy('createdAt', 'desc')
            .get();

        const questions = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(questions);
    } catch (error) {
        console.error('Error fetching questions:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function POST(request: Request, { params }: { params: { tenantId: string; id: string } }) {
    try {
        const { tenantId, id: assemblyId } = params;
        const body = await request.json();
        const { title, description, options, approvalThresholdType, approvalThresholdValue } = body;

        if (!title || !options || options.length === 0) {
            return NextResponse.json({ error: 'Invalid question data' }, { status: 400 });
        }

        const docRef = await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions`).add({
            title,
            description: description || '',
            options, // Array of { id, text, isApproval }
            approvalThresholdType: approvalThresholdType || 'NOMINAL',
            approvalThresholdValue: Number(approvalThresholdValue) || 50,
            status: 'DRAFT',
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ id: docRef.id });
    } catch (error) {
        console.error('Error creating question:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
