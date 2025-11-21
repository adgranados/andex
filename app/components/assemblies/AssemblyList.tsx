'use client';

import { useState, useEffect } from 'react';
import { InlineModal } from '@/app/components/catalog/InlineModal';
import { AssemblyForm } from './AssemblyForm';

interface Assembly {
    id: string;
    title: string;
    date: string;
    startTime: string;
    endTime?: string;
    location: string;
    type: string;
    status: string;
    code: string;
}

export function AssemblyList({ tenantId }: { tenantId: string }) {
    const [assemblies, setAssemblies] = useState<Assembly[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);

    const fetchAssemblies = () => {
        setLoading(true);
        fetch(`/api/t/${tenantId}/assemblies`)
            .then((res) => res.json())
            .then((data) => {
                setAssemblies(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchAssemblies();
    }, [tenantId]);

    const handleCreateSuccess = (newAssembly: Assembly) => {
        setAssemblies([newAssembly, ...assemblies]);
        setIsCreating(false);
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'DRAFT':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-700 text-slate-300">Borrador</span>;
            case 'ACTIVE':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-900 text-green-300">Activa</span>;
            case 'CLOSED':
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-900 text-red-300">Cerrada</span>;
            default:
                return <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-700 text-slate-300">{status}</span>;
        }
    };

    const getTypeBadge = (type: string) => {
        return type === 'ORDINARIA'
            ? <span className="text-indigo-400 font-medium">{type}</span>
            : <span className="text-amber-400 font-medium">{type}</span>;
    };

    if (loading) return <div className="text-slate-400">Cargando asambleas...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-white">Mis Asambleas</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    + Nueva Asamblea
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-white/10">
                <table className="min-w-full divide-y divide-white/10 bg-slate-900/50">
                    <thead className="bg-white/5">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Título / Código</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Fecha y Hora</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Lugar</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Tipo</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Estado</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {assemblies.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                                    No hay asambleas registradas. Crea una nueva para comenzar.
                                </td>
                            </tr>
                        ) : (
                            assemblies.map((assembly) => (
                                <tr key={assembly.id} className="hover:bg-white/5 transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm font-medium text-white">{assembly.title}</div>
                                        <div className="text-xs text-slate-500 font-mono">{assembly.code}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="text-sm text-slate-300">{assembly.date}</div>
                                        <div className="text-xs text-slate-500">{assembly.startTime} - {assembly.endTime || '?'}</div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{assembly.location}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{getTypeBadge(assembly.type)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(assembly.status)}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <a
                                            href={`/t/${tenantId}/assemblies/${assembly.id}/console`}
                                            className="text-indigo-400 hover:text-indigo-300 mr-4"
                                        >
                                            Gestionar
                                        </a>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <InlineModal
                isOpen={isCreating}
                onClose={() => setIsCreating(false)}
                title="Nueva Asamblea"
            >
                <AssemblyForm
                    tenantId={tenantId}
                    onSuccess={handleCreateSuccess}
                    onCancel={() => setIsCreating(false)}
                />
            </InlineModal>
        </div>
    );
}
