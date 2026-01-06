import { NextRequest } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { tenantId: string; id: string } }
) {
    const { tenantId, id: assemblyId } = params;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            // Send initial connection confirmation (optional but good for debugging)
            // controller.enqueue(encoder.encode('event: connected\ndata: "connected"\n\n'));

            let assemblyData: any = { status: 'DRAFT' };
            let questionsData: any[] = [];

            const sendUpdate = () => {
                const data = {
                    status: assemblyData?.status || 'DRAFT',
                    questions: questionsData
                };
                try {
                    controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                    );
                } catch (error) {
                    // Controller might be closed
                }
            };

            // Set up real-time listener for assembly status
            const unsubscribeAssembly = db
                .collection(`tCollections/${tenantId}/assemblies`)
                .doc(assemblyId)
                .onSnapshot(
                    (doc) => {
                        assemblyData = doc.data() || { status: 'DRAFT' };
                        sendUpdate();
                    },
                    (error) => {
                        console.error('Firestore snapshot error:', error);
                    }
                );

            // Set up real-time listener for questions
            const unsubscribeQuestions = db
                .collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions`)
                .onSnapshot(
                    (snapshot) => {
                        questionsData = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));
                        sendUpdate();
                    },
                    (error) => {
                        console.error('Firestore questions snapshot error:', error);
                    }
                );

            // Clean up on client disconnect
            request.signal.addEventListener('abort', () => {
                unsubscribeAssembly();
                unsubscribeQuestions();
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no',
        },
    });
}
