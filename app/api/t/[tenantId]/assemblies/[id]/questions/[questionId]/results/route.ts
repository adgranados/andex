import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function GET(request: Request, { params }: { params: { tenantId: string; id: string; questionId: string } }) {
    try {
        const { tenantId, id: assemblyId, questionId } = params;

        // 1. Get Question to know options
        const questionDoc = await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions`).doc(questionId).get();
        if (!questionDoc.exists) {
            return NextResponse.json({ error: 'Question not found' }, { status: 404 });
        }
        const questionData = questionDoc.data();
        const options = questionData?.options || [];

        // 2. Get all votes
        const votesSnapshot = await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions/${questionId}/votes`).get();

        const votes = votesSnapshot.docs.map(doc => doc.data());

        // 3. Calculate Results
        const results = options.map((opt: any) => {
            const optVotes = votes.filter((v: any) => v.optionId === opt.id);
            return {
                id: opt.id,
                text: opt.text,
                count: optVotes.length,
                coefficientSum: optVotes.reduce((sum: number, v: any) => sum + (v.coefficient || 0), 0)
            };
        });

        const totalVotes = votes.length;
        const totalCoefficient = votes.reduce((sum: number, v: any) => sum + (v.coefficient || 0), 0);

        // 4. Get Total Assembly Coefficient (Quorum Base)
        // Ideally we cache this or calculate from properties, but for now let's sum attendance
        const attendanceSnapshot = await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/attendance`).get();
        const presentCoefficient = attendanceSnapshot.docs.reduce((sum, doc) => sum + (doc.data().coefficient || 0), 0);

        return NextResponse.json({
            questionId,
            totalVotes,
            totalCoefficient,
            presentCoefficient,
            results
        });

    } catch (error) {
        console.error('Error calculating results:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
