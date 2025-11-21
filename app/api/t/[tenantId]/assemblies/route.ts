import { NextResponse } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export async function POST(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const body = await request.json();
        const { title, date, startTime, endTime, location, type } = body;

        if (!title || !date || !startTime || !location || !type) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Generate a simple unique code: ASM-YYYY-XXXX
        const year = new Date().getFullYear();
        const randomSuffix = Math.floor(1000 + Math.random() * 9000);
        const code = `ASM-${year}-${randomSuffix}`;

        const docRef = await db.collection(`tCollections/${tenantId}/assemblies`).add({
            title,
            date,
            startTime,
            endTime: endTime || '',
            location,
            type,
            code,
            status: 'DRAFT',
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({
            id: docRef.id,
            title,
            date,
            startTime,
            endTime,
            location,
            type,
            code,
            status: 'DRAFT'
        });
    } catch (error) {
        console.error('Error creating assembly:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request: Request, { params }: { params: { tenantId: string } }) {
    try {
        const { tenantId } = params;
        const snapshot = await db.collection(`tCollections/${tenantId}/assemblies`)
            .orderBy('date', 'desc')
            .get();

        const assemblies = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        return NextResponse.json(assemblies);
    } catch (error) {
        console.error('Error fetching assemblies:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
