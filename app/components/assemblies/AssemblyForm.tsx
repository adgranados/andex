'use client';

import { useState } from 'react';

interface AssemblyFormProps {
    tenantId: string;
    onSuccess: (assembly: any) => void;
    onCancel: () => void;
}

export function AssemblyForm({ tenantId, onSuccess, onCancel }: AssemblyFormProps) {
    const [title, setTitle] = useState('');
    const [location, setLocation] = useState('');
    const [type, setType] = useState('ORDINARIA');
    const [date, setDate] = useState('');
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${tenantId}/assemblies`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    location,
                    type,
                    date,
                    startTime,
                    endTime
                }),
            });

            if (res.ok) {
                const newAssembly = await res.json();
                onSuccess(newAssembly);
            } else {
                console.error('Failed to create assembly');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-400">Título de la Asamblea</label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    required
                    placeholder="Ej: Asamblea General 2024"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400">Lugar</label>
                <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    required
                    placeholder="Ej: Salón Comunal / Virtual"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-400">Tipo</label>
                <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                >
                    <option value="ORDINARIA">ORDINARIA</option>
                    <option value="EXTRAORDINARIA">EXTRAORDINARIA</option>
                </select>
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400">Fecha</label>
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400">Hora Inicio</label>
                    <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400">Hora Fin (Est.)</label>
                    <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                    />
                </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
                <button
                    type="button"
                    onClick={onCancel}
                    className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                    Cancelar
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
                >
                    {loading ? 'Guardando...' : 'Crear Asamblea'}
                </button>
            </div>
        </form>
    );
}
