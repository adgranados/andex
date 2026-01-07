'use client';

import { useState, useEffect } from 'react';
import { InlineModal } from '@/app/components/catalog/InlineModal';
import { QuestionCard } from './QuestionCard';

interface Property {
    id: string;
    name: string;
    ownerName: string;
    coefficient: number;
}

interface Question {
    id: string;
    title: string;
    status: string;
    options: any[];
}

export function VotingPanel({ tenantId, assemblyId, properties }: { tenantId: string; assemblyId: string; properties: Property[] }) {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [isCreating, setIsCreating] = useState(false);
    const [newQuestionTitle, setNewQuestionTitle] = useState('');

    // Dynamic Options State
    const [options, setOptions] = useState([
        { id: 'opt1', text: 'Sí', isApproval: true },
        { id: 'opt2', text: 'No', isApproval: false },
        { id: 'opt3', text: 'Abstención', isApproval: false }
    ]);
    const [draggedOptionIndex, setDraggedOptionIndex] = useState<number | null>(null);

    const fetchQuestions = async () => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${tenantId}/assemblies/${assemblyId}/questions`);
        if (res.ok) {
            const data = await res.json();
            setQuestions(data);
        }
    };

    useEffect(() => {
        fetchQuestions();
    }, [tenantId, assemblyId]);

    const handleCreateQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${tenantId}/assemblies/${assemblyId}/questions`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: newQuestionTitle,
                    options: options, // Use dynamic options
                    approvalThresholdType: 'COEFFICIENT',
                    approvalThresholdValue: 50
                })
            });

            if (res.ok) {
                setIsCreating(false);
                setNewQuestionTitle('');
                // Reset options to defaults
                setOptions([
                    { id: 'opt1', text: 'Sí', isApproval: true },
                    { id: 'opt2', text: 'No', isApproval: false },
                    { id: 'opt3', text: 'Abstención', isApproval: false }
                ]);
                fetchQuestions();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleStatusChange = async (questionId: string, newStatus: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${tenantId}/assemblies/${assemblyId}/questions/${questionId}`, {
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

    // Option Management
    const handleAddOption = () => {
        const newId = `opt-${Date.now()}`;
        setOptions([...options, { id: newId, text: '', isApproval: false }]);
    };

    const handleRemoveOption = (id: string) => {
        if (options.length <= 2) {
            alert('Debe haber al menos 2 opciones.');
            return;
        }
        setOptions(options.filter(o => o.id !== id));
    };

    const handleOptionChange = (id: string, text: string) => {
        setOptions(options.map(o => o.id === id ? { ...o, text } : o));
    };

    // Drag and Drop Handlers
    const handleDragStart = (index: number) => {
        setDraggedOptionIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
        if (draggedOptionIndex === null || draggedOptionIndex === index) return;

        const newOptions = [...options];
        const draggedItem = newOptions[draggedOptionIndex];

        // Remove from old position
        newOptions.splice(draggedOptionIndex, 1);
        // Insert at new position
        newOptions.splice(index, 0, draggedItem);

        setOptions(newOptions);
        setDraggedOptionIndex(index);
    };

    const handleDrop = () => {
        setDraggedOptionIndex(null);
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
                        properties={properties}
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
                <form onSubmit={handleCreateQuestion} className="space-y-6">
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

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-2">Opciones de Respuesta</label>
                        <div className="space-y-2">
                            {options.map((option, index) => (
                                <div
                                    key={option.id}
                                    draggable
                                    onDragStart={() => handleDragStart(index)}
                                    onDragOver={(e) => handleDragOver(e, index)}
                                    onDrop={handleDrop}
                                    className={`flex items-center gap-2 p-2 bg-slate-800/50 rounded border border-white/5 group ${draggedOptionIndex === index ? 'opacity-50' : ''}`}
                                >
                                    {/* Drag Handle */}
                                    <div className="cursor-move text-slate-500 hover:text-slate-300 p-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <circle cx="9" cy="12" r="1" />
                                            <circle cx="9" cy="5" r="1" />
                                            <circle cx="9" cy="19" r="1" />
                                            <circle cx="15" cy="12" r="1" />
                                            <circle cx="15" cy="5" r="1" />
                                            <circle cx="15" cy="19" r="1" />
                                        </svg>
                                    </div>

                                    {/* Option Input */}
                                    <input
                                        type="text"
                                        value={option.text}
                                        onChange={(e) => handleOptionChange(option.id, e.target.value)}
                                        className="flex-1 bg-transparent border-none text-sm text-white focus:ring-0 placeholder-slate-600"
                                        placeholder={`Opción ${index + 1}`}
                                        required
                                    />

                                    {/* Delete Button */}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveOption(option.id)}
                                        className="text-slate-500 hover:text-red-400 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        title="Eliminar opción"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M18 6 6 18" />
                                            <path d="m6 6 12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <button
                            type="button"
                            onClick={handleAddOption}
                            className="mt-2 text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M5 12h14" />
                                <path d="M12 5v14" />
                            </svg>
                            Agregar Opción
                        </button>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-white/10">
                        <button type="submit" className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-md text-sm transition-colors">
                            Crear Pregunta
                        </button>
                    </div>
                </form>
            </InlineModal>
        </div>
    );
}
