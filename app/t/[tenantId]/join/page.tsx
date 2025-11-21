'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function JoinAssemblyPage({ params }: { params: { tenantId: string } }) {
    const [code, setCode] = useState('');
    const [propertyIdentifier, setPropertyIdentifier] = useState('');
    const [properties, setProperties] = useState<{ id: string; name: string }[]>([]);
    const [loadingProperties, setLoadingProperties] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Fetch properties when code changes (debounced or on blur could be better, but effect is simple for now)
    // Let's use a manual trigger or effect with debounce. For simplicity, let's fetch when code length is sufficient (e.g. > 5 chars)
    useEffect(() => {
        const fetchProperties = async () => {
            if (code.length < 5) {
                setProperties([]);
                return;
            }

            setLoadingProperties(true);
            try {
                const res = await fetch(`/api/t/${params.tenantId}/assemblies/properties?code=${code}`);
                if (res.ok) {
                    const data = await res.json();
                    setProperties(data);
                } else {
                    setProperties([]);
                }
            } catch (err) {
                console.error(err);
                setProperties([]);
            } finally {
                setLoadingProperties(false);
            }
        };

        const timeoutId = setTimeout(fetchProperties, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [code, params.tenantId]);

    const handleJoin = async (e?: any) => {
        if (e && e.preventDefault) e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`/api/t/${params.tenantId}/assemblies/join`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code, propertyIdentifier }),
            });

            if (res.ok) {
                const data = await res.json();
                // Save session
                localStorage.setItem(`assembly_session_${data.assemblyId}`, JSON.stringify({
                    assemblyId: data.assemblyId,
                    propertyId: data.propertyId,
                    propertyName: data.propertyName
                }));
                router.push(`/t/${params.tenantId}/live/${data.assemblyId}`);
            } else {
                const err = await res.json();
                setError(err.error || 'Error al ingresar');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-slate-900 rounded-lg shadow-xl p-8 border border-white/10">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Unirse a la Asamblea</h1>
                    <p className="text-slate-400">Ingresa el código y selecciona tu propiedad</p>
                </div>

                <div className="space-y-6">
                    {error && (
                        <div className="bg-red-900/50 text-red-200 p-3 rounded border border-red-800 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            Código de Asamblea
                        </label>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleJoin(e)}
                            className="w-full bg-slate-800 border border-white/10 rounded px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-600"
                            placeholder="Ej: ASM-2025-1234"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-400 mb-1">
                            Propiedad / Unidad
                        </label>
                        {properties.length > 0 ? (
                            <select
                                value={propertyIdentifier}
                                onChange={(e) => setPropertyIdentifier(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleJoin(e)}
                                className="w-full bg-slate-800 border border-white/10 rounded px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                required
                            >
                                <option value="">Selecciona tu propiedad...</option>
                                {properties.map(p => (
                                    <option key={p.id} value={p.name}>{p.name}</option>
                                ))}
                            </select>
                        ) : (
                            <div className="relative">
                                <input
                                    type="text"
                                    value={propertyIdentifier}
                                    onChange={(e) => setPropertyIdentifier(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleJoin(e)}
                                    className="w-full bg-slate-800 border border-white/10 rounded px-3 py-2 text-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent placeholder-slate-600 disabled:opacity-50"
                                    placeholder={loadingProperties ? "Buscando propiedades..." : "Ingresa el nombre de tu propiedad"}
                                    required
                                    disabled={loadingProperties}
                                />
                                {loadingProperties && (
                                    <div className="absolute right-3 top-2.5">
                                        <div className="animate-spin h-5 w-5 border-2 border-indigo-500 rounded-full border-t-transparent"></div>
                                    </div>
                                )}
                            </div>
                        )}
                        {code.length > 4 && properties.length === 0 && !loadingProperties && (
                            <p className="text-xs text-yellow-500 mt-1">
                                No se encontraron propiedades o el código es inválido. Puedes escribir el nombre manualmente si estás seguro.
                            </p>
                        )}
                    </div>

                    <button
                        type="button"
                        onClick={handleJoin}
                        disabled={loading || loadingProperties}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Ingresando...' : 'Ingresar'}
                    </button>
                </div>
            </div>
        </div>
    );
}
