'use client';

import { useEffect, useState } from 'react';
import { InlineModal } from './InlineModal';
import { TypeForm } from './QuickCreateForms';

interface PropertyType {
    id: string;
    name: string;
    description?: string;
}

export function TypeList({ tenantId }: { tenantId: string }) {
    const [types, setTypes] = useState<PropertyType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingType, setEditingType] = useState<PropertyType | null>(null);

    const fetchTypes = () => {
        setLoading(true);
        fetch(`/api/t/${tenantId}/property-types`)
            .then((res) => res.json())
            .then((data) => {
                setTypes(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchTypes();
    }, [tenantId]);

    const handleCreateSuccess = (newType: PropertyType) => {
        setTypes([...types, newType]);
        setIsCreating(false);
    };

    const handleEditSuccess = (updatedType: PropertyType) => {
        setTypes(types.map(t => t.id === updatedType.id ? updatedType : t));
        setEditingType(null);
    };

    if (loading) return <div className="text-slate-400">Cargando tipos...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Tipos de Propiedad</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    + Nuevo Tipo
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-white/10">
                <table className="min-w-full divide-y divide-white/10 bg-slate-900/50">
                    <thead className="bg-white/5">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Nombre</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Descripción</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {types.map((type) => (
                            <tr key={type.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{type.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{type.description || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => setEditingType(type)}
                                        className="text-indigo-400 hover:text-indigo-300"
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {types.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-sm">
                                    No hay tipos registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <InlineModal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Nuevo Tipo de Propiedad">
                <TypeForm
                    tenantId={tenantId}
                    onSuccess={handleCreateSuccess}
                    onCancel={() => setIsCreating(false)}
                />
            </InlineModal>

            <InlineModal isOpen={!!editingType} onClose={() => setEditingType(null)} title="Editar Tipo de Propiedad">
                {editingType && (
                    <TypeForm
                        tenantId={tenantId}
                        initialData={editingType}
                        onSuccess={handleEditSuccess}
                        onCancel={() => setEditingType(null)}
                    />
                )}
            </InlineModal>
        </div>
    );
}
