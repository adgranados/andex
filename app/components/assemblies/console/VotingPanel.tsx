'use client';

import { useState, useEffect } from 'react';
import { InlineModal } from '@/app/components/catalog/InlineModal';
import { QuestionCard } from './QuestionCard';

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
            const data = await res.json();
            // Sort by createdAt desc (newest first)
            // Assuming the API returns them sorted or we sort here. 
            // The API code I saw earlier does `.orderBy('createdAt', 'desc')`, so it should be fine.
            setQuestions(data);
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
                <h2 className="text-lg font-semibold text-white">Votaciones</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-md text-sm transition-colors shadow-lg shadow-indigo-900/20"
                >
                    + Nueva Pregunta
                </button>
            </div>

            <div className="p-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 overflow-y-auto">
                {questions.map(q => (
                    <QuestionCard
                        key={q.id}
                        question={q}
                        tenantId={tenantId}
                        assemblyId={assemblyId}
                        onStatusChange={handleStatusChange}
                    />
                ))}

                {questions.length === 0 && (
                    <div className="col-span-full flex flex-col items-center justify-center h-64 text-slate-500 border-2 border-dashed border-slate-800 rounded-xl">
                        <p>No hay preguntas creadas aún.</p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="mt-2 text-indigo-400 hover:text-indigo-300 text-sm"
                        >
                            Crear la primera pregunta
                        </button>
                    </div>
                )}
            </div>

            <InlineModal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Nueva Pregunta">
                <form onSubmit={handleCreateQuestion} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Título de la Pregunta</label>
                        <input
                            type="text"
                            value={newQuestionTitle}
                            onChange={(e) => setNewQuestionTitle(e.target.value)}
                            className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                            required
                            placeholder="Ej: Aprobación de Estados Financieros"
                        />
                    </div>
                    <div className="text-xs text-slate-500 bg-slate-800/50 p-2 rounded">
                        * Por defecto se crearán las opciones: Sí, No, Abstención.
                    </div>
                    <div className="flex justify-end pt-4">
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm transition-colors">
                            Crear Borrador
                        </button>
                    </div>
                </form>
            </InlineModal>
        </div>
    );
}
