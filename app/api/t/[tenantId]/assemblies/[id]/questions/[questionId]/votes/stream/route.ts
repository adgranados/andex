import { NextRequest } from 'next/server';
import { db } from '@/src/server/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: { tenantId: string; id: string; questionId: string } }
) {
    const { tenantId, id: assemblyId, questionId } = params;

    const encoder = new TextEncoder();

    const stream = new ReadableStream({
        async start(controller) {
            // Set up real-time listener
            const unsubscribe = db
                .collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions/${questionId}/votes`)
                .onSnapshot(
                    (snapshot) => {
                        const data = snapshot.docs.map(doc => ({
                            id: doc.id,
                            ...doc.data()
                        }));

                        try {
                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                            );
                        } catch (error) {
                            console.error('Error sending SSE update:', error);
                        }
                    },
                    (error) => {
                        console.error('Firestore snapshot error:', error);
                        controller.enqueue(
                            encoder.encode(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`)
                        );
                    }
                );

            // Clean up on client disconnect
            request.signal.addEventListener('abort', () => {
                unsubscribe();
                controller.close();
            });
        },
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
            'X-Accel-Buffering': 'no', // Disable nginx buffering
        },
    });
}
