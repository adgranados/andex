import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function GET(request: Request, { params }: { params: { tenantId: string; id: string } }) {
    try {
        const { tenantId, id: assemblyId } = params;

        // 1. Get Assembly Details
        const assemblyDoc = await db.collection(`tCollections/${tenantId}/assemblies`).doc(assemblyId).get();
        if (!assemblyDoc.exists) {
            return NextResponse.json({ error: 'Assembly not found' }, { status: 404 });
        }
        const assembly = { id: assemblyDoc.id, ...assemblyDoc.data() };

        // 2. Get Attendance
        const attendanceSnapshot = await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/attendance`).get();
        const attendance = attendanceSnapshot.docs.map(doc => doc.data());

        const totalCoefficient = attendance.reduce((sum, p) => sum + (p.coefficient || 0), 0);
        const presentCount = attendance.filter(p => p.status === 'PRESENT').length;
        const presentCoefficient = attendance
            .filter(p => p.status === 'PRESENT')
            .reduce((sum, p) => sum + (p.coefficient || 0), 0);

        // 3. Get Questions and Results
        const questionsSnapshot = await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions`).orderBy('createdAt', 'asc').get();
        const questions = await Promise.all(questionsSnapshot.docs.map(async (doc) => {
            const qData = doc.data();
            const votesSnapshot = await db.collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions/${doc.id}/votes`).get();
            const votes = votesSnapshot.docs.map(v => v.data());

            const results = (qData.options || []).map((opt: any) => {
                const optVotes = votes.filter((v: any) => v.optionId === opt.id);
                return {
                    id: opt.id,
                    text: opt.text,
                    count: optVotes.length,
                    coefficientSum: optVotes.reduce((sum: number, v: any) => sum + (v.coefficient || 0), 0)
                };
            });

            const isVoided = qData.status === 'VOIDED';

            return {
                id: doc.id,
                ...qData,
                title: isVoided ? `[ANULADA] ${qData.title}` : qData.title,
                isVoided,
                totalVotes: votes.length,
                totalCoefficient: votes.reduce((sum, v) => sum + (v.coefficient || 0), 0),
                results
            };
        }));

        return NextResponse.json({
            assembly,
            attendance: {
                total: attendance.length,
                present: presentCount,
                totalCoefficient,
                presentCoefficient,
                list: attendance
            },
            questions
        });

    } catch (error) {
        console.error('Error generating report:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
