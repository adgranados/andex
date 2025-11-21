'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinPage({ params }: { params: { tenantId: string } }) {
    const [code, setCode] = useState('');
    const [propertyIdentifier, setPropertyIdentifier] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleJoin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`/api/t/${params.tenantId}/assemblies/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, propertyIdentifier })
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Failed to join');
                setLoading(false);
                return;
            }

            // Store session info in localStorage for MVP persistence
            localStorage.setItem(`andex_session_${params.tenantId}`, JSON.stringify({
                assemblyId: data.assemblyId,
                propertyId: data.propertyId,
                propertyName: data.propertyName
            }));

            router.push(`/t/${params.tenantId}/live/${data.assemblyId}`);

        } catch (err) {
            setError('An unexpected error occurred');
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 rounded-xl border border-white/10 p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Unirse a la Asamblea</h1>
                    <p className="text-slate-400">Ingresa el código y tu identificación</p>
                </div>

                {error && (
                    <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleJoin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Código de Asamblea
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            placeholder="EJ: ASM-2025-XXXX"
                            className="w-full bg-slate-800 border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-mono text-center tracking-wider uppercase"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">
                            Nombre de Propiedad / Unidad
                        </label>
                        <input
                            type="text"
                            value={propertyIdentifier}
                            onChange={(e) => setPropertyIdentifier(e.target.value)}
                            placeholder="Ej: Apto 101"
                            className="w-full bg-slate-800 border-white/10 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Verificando...' : 'Ingresar'}
                    </button>
                </form>
            </div>
        </div>
    );
}
