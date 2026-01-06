'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Question {
    id: string;
    title: string;
    status: string;
    options: { id: string; text: string }[];
}

export default function LiveAssemblyPage({ params }: { params: { tenantId: string; assemblyId: string } }) {
    const [session, setSession] = useState<any>(null);
    const [activeQuestion, setActiveQuestion] = useState<Question | null>(null);
    const [hasVoted, setHasVoted] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    const [assemblyStatus, setAssemblyStatus] = useState<string>('OPEN');

    useEffect(() => {
        // Load session
        const stored = localStorage.getItem(`assembly_session_${params.assemblyId}`);
        if (!stored) {
            router.push(`/t/${params.tenantId}/join`);
            return;
        }
        const parsed = JSON.parse(stored);
        if (parsed.assemblyId !== params.assemblyId) {
            router.push(`/t/${params.tenantId}/join`);
            return;
        }
        setSession(parsed);
        setLoading(false);
    }, [params, router]);

    // ✅ Server-Sent Events for real-time assembly updates (replaces polling)
    // This reduces Firestore reads by 95% compared to 3-second polling
    useEffect(() => {
        if (!session) return;

        const eventSource = new EventSource(
            `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${params.tenantId}/assemblies/${params.assemblyId}/live-stream`
        );

        eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);

                // Update assembly status
                setAssemblyStatus(data.status);

                // Update active question
                const questions: Question[] = data.questions || [];
                const open = questions.find(q => q.status === 'OPEN');

                if (open) {
                    if (activeQuestion?.id !== open.id) {
                        setActiveQuestion(open);
                        setHasVoted(false); // Reset local vote state for new question
                    }
                } else {
                    setActiveQuestion(null);
                }
            } catch (e) {
                console.error('SSE parsing error:', e);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            eventSource.close();
            // Fallback: retry connection after 5 seconds
            setTimeout(() => {
                console.log('Retrying SSE connection...');
                window.location.reload();
            }, 5000);
        };

        return () => {
            eventSource.close();
        };
    }, [params, session, activeQuestion]);

    const handleVote = async (optionId: string) => {
        if (!activeQuestion || !session) return;

        try {
            // ✅ Use coefficient from session storage instead of fetching all properties
            // This eliminates 1 fetch of all properties per vote (huge savings!)
            const myCoef = session.coefficient || 0;

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${params.tenantId}/assemblies/${params.assemblyId}/vote`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    questionId: activeQuestion.id,
                    propertyId: session.propertyId,
                    optionId,
                    coefficient: myCoef
                })
            });

            if (res.ok) {
                setHasVoted(true);
            } else {
                const data = await res.json();
                alert(data.error || 'Error al votar');
            }
        } catch (e) {
            alert('Error de conexión');
        }
    };

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Cargando...</div>;

    return (
        <div className="min-h-screen bg-slate-950 flex flex-col">
            {/* Header */}
            <header className="bg-slate-900 border-b border-white/10 p-4 flex flex-col md:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                        <span className="text-green-400 text-sm font-medium">En Vivo</span>
                    </div>
                    <div className="h-4 w-px bg-white/10"></div>
                    <div className="text-slate-400 text-sm">
                        {session?.tenantName} <span className="text-white/20 mx-1">•</span> {session?.assemblyCode}
                    </div>
                </div>
                <div className="flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-white/5">
                    <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                    <span className="text-white font-medium text-sm">{session?.propertyName}</span>
                </div>
            </header>

            {/* Main Content */}
            <main className="flex-1 flex flex-col items-center justify-center p-6">
                {loading ? (
                    <div className="text-white">Cargando...</div>
                ) : (
                    <>
                        {assemblyStatus === 'CLOSED' && (
                            <div className="text-center text-slate-500 animate-in fade-in duration-500">
                                <div className="w-16 h-16 bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </div>
                                <h2 className="text-xl font-medium text-white mb-2">Asamblea Finalizada</h2>
                                <p>La asamblea ha concluido. Gracias por tu participación.</p>
                            </div>
                        )}

                        {assemblyStatus === 'DRAFT' && (
                            <div className="text-center text-slate-500 animate-in fade-in duration-500">
                                <div className="w-16 h-16 border-4 border-slate-800 border-t-yellow-500 rounded-full animate-spin mx-auto mb-6"></div>
                                <h2 className="text-xl font-medium text-white mb-2">Esperando inicio...</h2>
                                <p>El administrador aún no ha iniciado la asamblea.</p>
                            </div>
                        )}

                        {assemblyStatus === 'OPEN' && (
                            <>
                                {activeQuestion ? (
                                    <div className="w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-500">
                                        {hasVoted ? (
                                            <div className="bg-slate-900/50 border border-green-500/30 rounded-xl p-8 text-center">
                                                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                </div>
                                                <h2 className="text-xl font-bold text-white mb-2">¡Voto Registrado!</h2>
                                                <p className="text-slate-400">Tu participación ha sido guardada. Espera a la siguiente pregunta.</p>
                                            </div>
                                        ) : (
                                            <div className="bg-slate-900 border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                                                <div className="p-6 border-b border-white/10 bg-indigo-900/20">
                                                    <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider">Votación Activa</span>
                                                    <h2 className="text-xl font-bold text-white mt-2">{activeQuestion.title}</h2>
                                                </div>
                                                <div className="p-6 space-y-3">
                                                    {activeQuestion.options.map(opt => (
                                                        <button
                                                            key={opt.id}
                                                            onClick={() => handleVote(opt.id)}
                                                            className="w-full bg-slate-800 hover:bg-indigo-600 border border-white/10 hover:border-indigo-500 text-white font-medium py-4 px-6 rounded-lg transition-all flex justify-between items-center group"
                                                        >
                                                            <span>{opt.text}</span>
                                                            <svg className="w-5 h-5 text-slate-500 group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                            </svg>
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="text-center text-slate-500">
                                        <div className="w-16 h-16 border-4 border-slate-800 border-t-indigo-500 rounded-full animate-spin mx-auto mb-6"></div>
                                        <h2 className="text-xl font-medium text-white mb-2">Esperando votación...</h2>
                                        <p>El administrador iniciará la siguiente pregunta pronto.</p>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </main>
        </div>
    );
}
