'use client';

import { useEffect, useState } from 'react';
import { PropertyForm } from './PropertyForm';

import { InlineModal } from './InlineModal';

interface Property {
    id: string;
    name: string;
    address?: string;
    zoneId: string;
    typeId: string;
    ownerId: string;
}

export function PropertyList({ tenantId }: { tenantId: string }) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingProperty, setEditingProperty] = useState<Property | null>(null);

    const fetchProperties = () => {
        setLoading(true);
        fetch(`/api/t/${tenantId}/properties`)
            .then((res) => res.json())
            .then((data) => {
                setProperties(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchProperties();
    }, [tenantId]);

    const handleCreateSuccess = (newProperty: Property) => {
        setProperties([...properties, newProperty]);
        setIsCreating(false);
    };

    const handleEditSuccess = (updatedProperty: Property) => {
        setProperties(properties.map(p => p.id === updatedProperty.id ? updatedProperty : p));
        setEditingProperty(null);
    };

    if (loading) return <div className="text-slate-400">Cargando propiedades...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Propiedades</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    + Nueva Propiedad
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-white/10">
                <table className="min-w-full divide-y divide-white/10 bg-slate-900/50">
                    <thead className="bg-white/5">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Nombre</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Dirección</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {properties.map((property) => (
                            <tr key={property.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{property.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{property.address || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => setEditingProperty(property)}
                                        className="text-indigo-400 hover:text-indigo-300"
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {properties.length === 0 && (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-slate-500 text-sm">
                                    No hay propiedades registradas.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <InlineModal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Nueva Propiedad">
                <PropertyForm
                    tenantId={tenantId}
                    onSuccess={handleCreateSuccess}
                    onCancel={() => setIsCreating(false)}
                />
            </InlineModal>

            <InlineModal isOpen={!!editingProperty} onClose={() => setEditingProperty(null)} title="Editar Propiedad">
                {editingProperty && (
                    <PropertyForm
                        tenantId={tenantId}
                        initialData={editingProperty}
                        onSuccess={handleEditSuccess}
                        onCancel={() => setEditingProperty(null)}
                    />
                )}
            </InlineModal>
        </div>
    );
}
