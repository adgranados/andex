'use client';

import { AttendancePanel } from './AttendancePanel';
import { VotingPanel } from './VotingPanel';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface AssemblyConsoleLayoutProps {
    tenantId: string;
    assemblyId: string;
    assemblyTitle: string;
    assemblyCode: string;
    initialStatus: string;
}

export interface Property {
    id: string;
    name: string;
    ownerName: string;
    coefficient: number;
}

export function AssemblyConsoleLayout({ tenantId, assemblyId, assemblyTitle, assemblyCode, initialStatus }: AssemblyConsoleLayoutProps) {
    const router = useRouter();
    const [status, setStatus] = useState(initialStatus);
    const [properties, setProperties] = useState<Property[]>([]);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const propsRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${tenantId}/properties`);
                if (propsRes.ok) {
                    setProperties(await propsRes.json());
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
            }
        };
        fetchProperties();
    }, [tenantId]);

    const handleStartAssembly = async () => {
        if (!confirm('¿Estás seguro de que deseas iniciar la asamblea? Los asistentes podrán unirse.')) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${tenantId}/assemblies/${assemblyId}/start`, {
                method: 'POST'
            });

            if (res.ok) {
                setStatus('OPEN');
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCloseAssembly = async () => {
        if (!confirm('¿Estás seguro de que deseas finalizar la asamblea? Esta acción no se puede deshacer.')) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${tenantId}/assemblies/${assemblyId}/close`, {
                method: 'POST'
            });

            if (res.ok) {
                setStatus('CLOSED');
                router.push(`/t/${tenantId}/assemblies`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}${process.env.NEXT_PUBLIC_BASE_PATH || ''}/t/${tenantId}/join`;
        const text = `Únete a la asamblea aquí: ${url}\nCódigo: ${assemblyCode}`;
        navigator.clipboard.writeText(text);
        alert('Link copiado al portapapeles');
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
                <div>
                    <div className="flex items-center gap-3">
                        <h1 className="text-xl font-bold text-white">{assemblyTitle}</h1>
                        {status === 'DRAFT' && <span className="px-2 py-0.5 rounded-full bg-slate-700 text-slate-300 text-xs font-medium">Borrador</span>}
                        {status === 'OPEN' && <span className="px-2 py-0.5 rounded-full bg-green-900 text-green-300 text-xs font-medium animate-pulse">En Vivo</span>}
                        {status === 'CLOSED' && <span className="px-2 py-0.5 rounded-full bg-red-900 text-red-300 text-xs font-medium">Finalizada</span>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-slate-400">
                        <div className="flex items-center gap-2">
                            <span>Código de acceso:</span>
                            <span className="font-mono text-indigo-400 font-bold text-lg tracking-wider">{assemblyCode}</span>
                        </div>
                        <button
                            onClick={handleCopyLink}
                            className="text-xs bg-slate-800 hover:bg-slate-700 text-indigo-300 px-2 py-1 rounded border border-slate-700 transition-colors flex items-center gap-1"
                            title="Copiar información de acceso"
                        >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                            </svg>
                            Copiar Información de Acceso Asamblea
                        </button>
                    </div>
                </div>
                <div>
                    {status === 'DRAFT' && (
                        <button
                            onClick={handleStartAssembly}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors shadow-lg shadow-green-900/20"
                        >
                            Iniciar Asamblea
                        </button>
                    )}
                    {status === 'OPEN' && (
                        <button
                            onClick={handleCloseAssembly}
                            className="bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 px-4 py-2 rounded-md text-sm transition-colors"
                        >
                            Finalizar Asamblea
                        </button>
                    )}
                    {status === 'CLOSED' && (
                        <button
                            disabled
                            className="bg-slate-800 text-slate-500 border border-slate-700 px-4 py-2 rounded-md text-sm cursor-not-allowed"
                        >
                            Asamblea Finalizada
                        </button>
                    )}
                </div>
            </header>

            {/* Main Content - Split View */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel - Attendance (30%) */}
                <div className="w-[30%] min-w-[300px] h-full">
                    <AttendancePanel tenantId={tenantId} assemblyId={assemblyId} properties={properties} />
                </div>

                {/* Right Panel - Voting (70%) */}
                <div className="flex-1 h-full border-l border-white/10">
                    <VotingPanel tenantId={tenantId} assemblyId={assemblyId} properties={properties} />
                </div>
            </div>
        </div>
    );
}
