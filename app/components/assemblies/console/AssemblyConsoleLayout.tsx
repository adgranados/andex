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

    return (
        <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
            {/* Header */}
            <header className="h-16 bg-slate-900 border-b border-white/10 flex items-center justify-between px-6 shrink-0">
                <div>
                    <h1 className="text-xl font-bold text-white">{assemblyTitle}</h1>
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                        <span>Código de acceso:</span>
                        <span className="font-mono text-indigo-400 font-bold text-lg tracking-wider">{assemblyCode}</span>
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
