'use client';

import { useState, useEffect } from 'react';

interface Property {
    id: string;
    name: string;
    ownerName: string;
    coefficient: number;
    address?: string;
}

interface PropertyDetailsModalProps {
    isOpen: boolean;
    onClose: () => void;
    property: Property | null;
    isPresent: boolean;
    currentRepresentative?: string;
    onUpdateAttendance: (property: Property, status: string, representative?: string) => void;
}

export function PropertyDetailsModal({ isOpen, onClose, property, isPresent, currentRepresentative, onUpdateAttendance }: PropertyDetailsModalProps) {
    const [isProxy, setIsProxy] = useState(false);
    const [proxyName, setProxyName] = useState('');

    useEffect(() => {
        if (isOpen) {
            const hasRepresentative = !!currentRepresentative && currentRepresentative !== property?.ownerName;
            setIsProxy(hasRepresentative);
            setProxyName(hasRepresentative ? currentRepresentative || '' : '');
        }
    }, [isOpen, currentRepresentative, property]);

    if (!isOpen || !property) return null;

    const handleToggleStatus = () => {
        if (isPresent) {
            onUpdateAttendance(property, 'ABSENT');
        } else {
            // If marking present, check if proxy is active in form? 
            // User instruction says "Toggle ... alternar el estado".
            // If I just toggle to Present, I'll assume Owner unless they use the Proxy save button.
            // Or should I preserve the proxy form state? 
            // Safest is to just mark present (Defaults to owner). User can then add proxy.
            onUpdateAttendance(property, 'PRESENT');
        }
    };

    const handleSaveProxy = () => {
        if (proxyName.trim()) {
            onUpdateAttendance(property, 'PRESENT', proxyName);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            {/* Click outside to close */}
            <div className="absolute inset-0" onClick={onClose}></div>

            <div className="relative bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden w-full max-w-md animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-800 flex justify-between items-start bg-slate-900/50">
                    <div>
                        <h2 className="text-lg font-bold text-white tracking-tight">Detalles de Propiedad</h2>
                        <p className="text-xs text-slate-400">Gestión de asamblea</p>
                    </div>

                    <div className="flex items-center gap-2 bg-slate-800/80 p-1.5 rounded-lg border border-slate-700">
                        <div className={`text-xs font-bold px-3 py-1.5 rounded-md flex items-center gap-2 border ${isPresent
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-slate-700/50 text-slate-400 border-slate-600/50'
                            }`}>
                            <span className={`relative flex h-2 w-2`}>
                                {isPresent && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>}
                                <span className={`relative inline-flex rounded-full h-2 w-2 ${isPresent ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                            </span>
                            {isPresent ? 'Presente' : 'Ausente'}
                        </div>

                        <button
                            onClick={handleToggleStatus}
                            title={isPresent ? "Marcar como Ausente" : "Marcar como Presente"}
                            className={`p-1.5 rounded-md transition-colors ${isPresent
                                ? 'text-slate-400 hover:text-red-400 hover:bg-red-400/10'
                                : 'text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10'
                                }`}
                        >
                            {isPresent ? (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                            ) : (
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path></svg>
                            )}
                        </button>
                    </div>
                </div>

                {/* Body */}
                <div className="p-6 space-y-6">
                    {/* Property Cards */}
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Propietario</label>
                            <div className="text-xl font-bold text-white mt-1">{property.ownerName || 'Sin propietario'}</div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Unidad</label>
                                <div className="text-white font-medium">{property.name}</div>
                            </div>
                            <div className="bg-slate-800/50 p-3 rounded-lg border border-slate-700/50">
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider block mb-1">Coeficiente</label>
                                <div className="text-white font-mono">{property.coefficient?.toFixed(4) || '0.0000'}</div>
                            </div>
                        </div>
                    </div>

                    <div className="h-px bg-slate-800 w-full"></div>

                    {/* Proxy Logic */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-sm text-slate-300 font-medium">Asiste mediante Apoderado</label>
                            {/* Toggle Switch */}
                            <button
                                onClick={() => {
                                    const nextState = !isProxy;
                                    setIsProxy(nextState);
                                    if (!nextState) {
                                        setProxyName('');
                                        if (isPresent) {
                                            onUpdateAttendance(property, 'PRESENT', undefined);
                                        }
                                    }
                                }}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 ${isProxy ? 'bg-indigo-600' : 'bg-slate-700'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isProxy ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>

                        {isProxy && (
                            <div className="flex gap-2 animate-in slide-in-from-top-2 fade-in duration-200">
                                <input
                                    type="text"
                                    value={proxyName}
                                    onChange={(e) => setProxyName(e.target.value)}
                                    className="flex-1 px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white text-sm focus:ring-2 focus:ring-indigo-500 outline-none placeholder:text-slate-600"
                                    placeholder="Nombre del apoderado"
                                    autoFocus
                                />

                                <button
                                    onClick={handleSaveProxy}
                                    disabled={!proxyName.trim()}
                                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:hover:bg-indigo-600 text-white rounded-lg text-sm font-medium transition shadow-lg shadow-indigo-500/20 flex items-center gap-2 whitespace-nowrap"
                                >
                                    <span>Guardar</span>
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
