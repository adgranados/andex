'use client';

import { InlineModal } from '@/app/components/catalog/InlineModal';

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
    onToggleAttendance: (property: Property) => void;
}

export function PropertyDetailsModal({ isOpen, onClose, property, isPresent, onToggleAttendance }: PropertyDetailsModalProps) {
    if (!property) return null;

    return (
        <InlineModal isOpen={isOpen} onClose={onClose} title="Detalles de Propiedad">
            <div className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Propiedad / Unidad</label>
                        <div className="text-xl font-bold text-white">{property.name}</div>
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Propietario</label>
                        <div className="text-lg text-white">{property.ownerName || 'Sin nombre registrado'}</div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Coeficiente</label>
                            <div className="text-white font-mono">{property.coefficient?.toFixed(4) || '0.0000'}</div>
                        </div>
                        {property.address && (
                            <div>
                                <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Ubicación</label>
                                <div className="text-white">{property.address}</div>
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="text-xs font-medium text-slate-500 uppercase tracking-wider">Estado de Asistencia</label>
                        <div className={`mt-1 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${isPresent ? 'bg-green-900/50 text-green-300 border border-green-800' : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                            <span className={`w-2 h-2 rounded-full mr-2 ${isPresent ? 'bg-green-500' : 'bg-slate-500'}`}></span>
                            {isPresent ? 'Presente' : 'Ausente'}
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-white/10">
                    <button
                        onClick={() => {
                            onToggleAttendance(property);
                            // Optional: Close modal on action? Or keep open to see status change?
                            // Let's keep it open so they see the status update.
                        }}
                        className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${isPresent
                                ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                : 'bg-green-600 text-white hover:bg-green-700 shadow-lg shadow-green-900/20'
                            }`}
                    >
                        {isPresent ? 'Marcar como Ausente' : 'Marcar como Presente'}
                    </button>
                </div>
            </div>
        </InlineModal>
    );
}
