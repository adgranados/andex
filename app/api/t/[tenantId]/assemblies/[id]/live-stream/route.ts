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
            // Send initial data
            try {
                // Get assembly status
                const assemblyDoc = await db
                    .collection(`tCollections/${tenantId}/assemblies`)
                    .doc(assemblyId)
                    .get();

                const assemblyData = assemblyDoc.data();

                // Get questions
                const questionsSnapshot = await db
                    .collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions`)
                    .get();

                const questions = questionsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                const initialData = {
                    status: assemblyData?.status || 'DRAFT',
                    questions
                };

                controller.enqueue(
                    encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`)
                );
            } catch (error) {
                console.error('Error fetching initial assembly data:', error);
            }

            // Set up real-time listener for assembly status
            const unsubscribeAssembly = db
                .collection(`tCollections/${tenantId}/assemblies`)
                .doc(assemblyId)
                .onSnapshot(
                    async (doc) => {
                        try {
                            const assemblyData = doc.data();

                            // Also get questions
                            const questionsSnapshot = await db
                                .collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions`)
                                .get();

                            const questions = questionsSnapshot.docs.map(qDoc => ({
                                id: qDoc.id,
                                ...qDoc.data()
                            }));

                            const data = {
                                status: assemblyData?.status || 'DRAFT',
                                questions
                            };

                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                            );
                        } catch (error) {
                            console.error('Error in assembly snapshot:', error);
                        }
                    },
                    (error) => {
                        console.error('Firestore snapshot error:', error);
                        controller.enqueue(
                            encoder.encode(`event: error\ndata: ${JSON.stringify({ error: error.message })}\n\n`)
                        );
                    }
                );

            // Set up real-time listener for questions
            const unsubscribeQuestions = db
                .collection(`tCollections/${tenantId}/assemblies/${assemblyId}/questions`)
                .onSnapshot(
                    async (snapshot) => {
                        try {
                            const questions = snapshot.docs.map(doc => ({
                                id: doc.id,
                                ...doc.data()
                            }));

                            // Get current assembly status
                            const assemblyDoc = await db
                                .collection(`tCollections/${tenantId}/assemblies`)
                                .doc(assemblyId)
                                .get();

                            const data = {
                                status: assemblyDoc.data()?.status || 'DRAFT',
                                questions
                            };

                            controller.enqueue(
                                encoder.encode(`data: ${JSON.stringify(data)}\n\n`)
                            );
                        } catch (error) {
                            console.error('Error in questions snapshot:', error);
                        }
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
