'use client';

import { useState, useEffect } from 'react';
import { InlineModal } from '@/app/components/catalog/InlineModal';

interface Question {
    id: string;
    title: string;
    status: string;
    options: any[];
}

export function VotingPanel({ tenantId, assemblyId }: { tenantId: string; assemblyId: string }) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newQuestionTitle, setNewQuestionTitle] = useState('');

    // Simple options for MVP
    const defaultOptions = [
        { id: 'opt1', text: 'Sí', isApproval: true },
        { id: 'opt2', text: 'No', isApproval: false },
        { id: 'opt3', text: 'Abstención', isApproval: false }
    ];

    const fetchQuestions = async () => {
        const res = await fetch(`/api/t/${tenantId}/assemblies/${assemblyId}/questions`);
        if (res.ok) {
            setQuestions(await res.json());
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [tenantId, assemblyId]);

    const handleCreateQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/t/${tenantId}/assemblies/${assemblyId}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newQuestionTitle,
                    options: defaultOptions,
                    approvalThresholdType: 'COEFFICIENT',
                    approvalThresholdValue: 50
                })
            });

            if (res.ok) {
                setIsCreating(false);
                setNewQuestionTitle('');
                fetchQuestions();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusChange = async (questionId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/t/${tenantId}/assemblies/${assemblyId}/questions/${questionId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });

            if (res.ok) {
                fetchQuestions();
            }
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="flex flex-col h-full bg-slate-950">
            <div className="p-4 border-b border-white/10 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">Votaciones</h3>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm"
                >
                    + Nueva Pregunta
                </button>
            </div>

            <div className="p-4 grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto">
                {questions.map(q => (
                    <div key={q.id} className="bg-slate-900 border border-white/10 rounded-lg p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-2">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${q.status === 'OPEN' ? 'bg-green-900 text-green-300' :
                                        q.status === 'CLOSED' ? 'bg-red-900 text-red-300' :
                                            'bg-slate-700 text-slate-300'
                                    }`}>
                                    {q.status}
                                </span>
                            </div>
                            <h4 className="text-white font-medium mb-4">{q.title}</h4>
                        </div>

                        <div className="flex gap-2 mt-2">
                            {q.status === 'DRAFT' && (
                                <button
                                    onClick={() => handleStatusChange(q.id, 'OPEN')}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-1.5 rounded text-sm"
                                >
                                    Publicar
                                </button>
                            )}
                            {q.status === 'OPEN' && (
                                <button
                                    onClick={() => handleStatusChange(q.id, 'CLOSED')}
                                    className="flex-1 bg-red-600 hover:bg-red-700 text-white py-1.5 rounded text-sm"
                                >
                                    Cerrar
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <InlineModal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Nueva Pregunta">
                <form onSubmit={handleCreateQuestion} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Título de la Pregunta</label>
                        <input
                            type="text"
                            value={newQuestionTitle}
                            onChange={(e) => setNewQuestionTitle(e.target.value)}
                            className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm px-3 py-2"
                            required
                        />
                    </div>
                    <div className="text-xs text-slate-500">
                        * Por defecto se crearán las opciones: Sí, No, Abstención.
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm">
                            Crear Borrador
                        </button>
                    </div>
                </form>
            </InlineModal>
        </div>
    );
}
