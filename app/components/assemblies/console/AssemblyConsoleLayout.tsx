'use client';

import { AttendancePanel } from './AttendancePanel';
import { VotingPanel } from './VotingPanel';
import { useRouter } from 'next/navigation';

interface AssemblyConsoleLayoutProps {
    tenantId: string;
    assemblyId: string;
    assemblyTitle: string;
    assemblyCode: string;
}

export function AssemblyConsoleLayout({ tenantId, assemblyId, assemblyTitle, assemblyCode }: AssemblyConsoleLayoutProps) {
    const router = useRouter();

    const handleCloseAssembly = async () => {
        if (!confirm('¿Estás seguro de que deseas finalizar la asamblea? Esta acción no se puede deshacer.')) return;

        try {
            const res = await fetch(`/api/t/${tenantId}/assemblies/${assemblyId}/close`, {
                method: 'POST'
            });

            if (res.ok) {
                router.push(`/t/${tenantId}/assemblies`);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleCopyLink = () => {
        const url = `${window.location.origin}/t/${tenantId}/join`;
        const text = `Únete a la asamblea aquí: ${url}\nCódigo: ${assemblyCode}`;
        navigator.clipboard.writeText(text);
        alert('Link copiado al portapapeles');
    };

    return (
        <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-white">{assemblyTitle}</h1>
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
                            Copiar Link
                        </button>
                    </div>
                </div>
                <div>
                    <button
                        onClick={handleCloseAssembly}
                        className="bg-red-900/50 hover:bg-red-900 text-red-200 border border-red-800 px-4 py-2 rounded-md text-sm transition-colors"
                    >
                        Finalizar Asamblea
                    </button>
                </div>
            </header>

            {/* Main Content - Split View */}
            <div className="flex flex-1 overflow-hidden">
                {/* Left Panel - Attendance (30%) */}
                <div className="w-[30%] min-w-[300px] h-full">
                    <AttendancePanel tenantId={tenantId} assemblyId={assemblyId} />
                </div>

                {/* Right Panel - Voting (70%) */}
                <div className="flex-1 h-full border-l border-white/10">
                    <VotingPanel tenantId={tenantId} assemblyId={assemblyId} />
                </div>
            </div>
        </div>
    );
}
