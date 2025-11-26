'use client';

import { useState, useEffect } from 'react';
import { db } from '@/src/client/firebaseClient';
import { collection, onSnapshot, query } from 'firebase/firestore';

interface Option {
    id: string;
    text: string;
    isApproval: boolean;
}

interface Question {
    id: string;
    title: string;
    status: string;
    options: Option[];
}

interface QuestionCardProps {
    question: Question;
    tenantId: string;
    assemblyId: string;
    onStatusChange: (questionId: string, newStatus: string) => Promise<void>;
}

interface ResultData {
    optionId: string;
    count: number;
    coefficientSum: number;
}

export function QuestionCard({ question, tenantId, assemblyId, onStatusChange }: QuestionCardProps) {
    const [isFlipped, setIsFlipped] = useState(false);
    const [results, setResults] = useState<ResultData[]>([]);
    const [totalVotes, setTotalVotes] = useState(0);
    const [totalCoefficient, setTotalCoefficient] = useState(0);
    const [loadingResults, setLoadingResults] = useState(false);

    // Listen for real-time results
    useEffect(() => {
        const streamUrl = `/api/t/${tenantId}/assemblies/${assemblyId}/questions/${question.id}/votes/stream`;
        console.log("Connecting to vote stream:", streamUrl);

        const eventSource = new EventSource(streamUrl);

        eventSource.onmessage = (event) => {
            try {
                const votes = JSON.parse(event.data);
                console.log("Vote stream update:", votes.length, "votes");

                // Calculate results
                const newResults = question.options.map(opt => {
                    const optVotes = votes.filter((v: any) => v.optionId === opt.id);
                    return {
                        optionId: opt.id,
                        count: optVotes.length,
                        coefficientSum: optVotes.reduce((sum: number, v: any) => sum + (v.coefficient || 0), 0)
                    };
                });

                setResults(newResults);
                setTotalVotes(votes.length);
                setTotalCoefficient(votes.reduce((sum: number, v: any) => sum + (v.coefficient || 0), 0));
                setLoadingResults(false);
            } catch (err) {
                console.error('SSE parsing error:', err);
            }
        };

        eventSource.onerror = (error) => {
            console.error('SSE connection error:', error);
            eventSource.close();
            // Optional: Retry logic could go here, but for now let's just log it.
            // A simple reload might be too aggressive.
        };

        return () => {
            eventSource.close();
        };
    }, [tenantId, assemblyId, question.id, question.options]);

    const handleStatusToggle = async (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent flip when clicking button
        let nextStatus = '';
        if (question.status === 'DRAFT') nextStatus = 'OPEN';
        else if (question.status === 'OPEN') nextStatus = 'CLOSED';

        if (nextStatus) {
            await onStatusChange(question.id, nextStatus);
        }
    };

    return (
        <div className="relative w-full h-80 perspective-1000 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
            <div className={`relative w-full h-full transition-all duration-500 transform preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>

                {/* Front Face */}
                <div className="absolute w-full h-full backface-hidden bg-slate-900 border border-white/10 rounded-xl p-6 flex flex-col justify-between shadow-xl">
                    <div>
                        <div className="flex justify-between items-start mb-4">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${question.status === 'OPEN' ? 'bg-green-900/50 text-green-400 border border-green-500/30 animate-pulse' :
                                question.status === 'CLOSED' ? 'bg-red-900/20 text-red-400 border border-red-500/30' :
                                    'bg-slate-700 text-slate-300'
                                }`}>
                                {question.status === 'DRAFT' ? 'BORRADOR' :
                                    question.status === 'OPEN' ? 'EN VIVO' : 'CERRADA'}
                            </span>
                            <div className="text-slate-400 text-xs flex items-center gap-1">
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11.25a.75.75 0 00-1.5 0v2.5h-2.5a.75.75 0 000 1.5h2.5v2.5a.75.75 0 001.5 0v-2.5h2.5a.75.75 0 000-1.5h-2.5v-2.5z" clipRule="evenodd" />
                                </svg>
                                Click para ver resultados
                            </div>
                        </div>

                        <h3 className="text-xl font-semibold text-white leading-tight">
                            {question.title}
                        </h3>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between text-sm text-slate-300 bg-slate-800/50 p-3 rounded-lg">
                            <span>Votos recibidos:</span>
                            <span className="font-mono font-bold text-indigo-400 text-lg">{totalVotes}</span>
                        </div>

                        {question.status !== 'CLOSED' && (
                            <button
                                onClick={handleStatusToggle}
                                className={`w-full py-3 rounded-lg font-medium text-sm transition-all transform hover:scale-[1.02] active:scale-[0.98] ${question.status === 'DRAFT'
                                    ? 'bg-green-600 hover:bg-green-500 text-white shadow-lg shadow-green-900/20'
                                    : 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-900/20'
                                    }`}
                            >
                                {question.status === 'DRAFT' ? 'Publicar Pregunta' : 'Cerrar Votación'}
                            </button>
                        )}
                        {question.status === 'CLOSED' && (
                            <div className="w-full py-3 text-center text-slate-500 text-sm font-medium bg-slate-800 rounded-lg border border-slate-700">
                                Votación Finalizada
                            </div>
                        )}
                    </div>
                </div>

                {/* Back Face */}
                <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-slate-800 border border-white/10 rounded-xl p-6 flex flex-col shadow-xl">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-white/10">
                        <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider">Resultados</h4>
                        <button
                            onClick={(e) => { e.stopPropagation(); setIsFlipped(false); }}
                            className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                                <path fillRule="evenodd" d="M7.793 2.232a.75.75 0 01-.025 1.06L3.622 7.25h10.003a5.375 5.375 0 010 10.75H10.75a.75.75 0 010-1.5h2.875a3.875 3.875 0 000-7.75H3.622l4.146 3.957a.75.75 0 01-1.036 1.085l-5.5-5.25a.75.75 0 010-1.085l5.5-5.25a.75.75 0 011.06.025z" clipRule="evenodd" />
                            </svg>
                            Volver
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {question.options.map((opt) => {
                            const result = results.find(r => r.optionId === opt.id);
                            const count = result?.count || 0;
                            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;

                            return (
                                <div key={opt.id}>
                                    <div className="flex justify-between text-sm mb-1">
                                        <span className="text-white font-medium">{opt.text}</span>
                                        <span className="text-slate-400">{count} ({percentage.toFixed(1)}%)</span>
                                    </div>
                                    <div className="w-full bg-slate-700/50 rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="bg-indigo-500 h-full rounded-full transition-all duration-500 ease-out"
                                            style={{ width: `${percentage}%` }}
                                        ></div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-4 pt-4 border-t border-white/10 flex justify-between text-xs text-slate-500">
                        <span>Total Votos: {totalVotes}</span>
                        <span>Coef: {totalCoefficient.toFixed(4)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
