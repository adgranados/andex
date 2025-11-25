'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { PropertyForm } from './PropertyForm';

import { InlineModal } from './InlineModal';

interface Property {
    id: string;
    name: string;
    address?: string;
    zoneId: string;
    typeId: string;
    ownerId: string;
    ownerName?: string; // ✅ Added ownerName
    coefficient?: number;
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
        // Refresh list to get owner name properly resolved from server if needed, 
        // or just add it. For now, let's refresh to be safe as ownerName comes from server resolution.
        fetchProperties();
        setIsCreating(false);
    };

    const handleEditSuccess = (updatedProperty: Property) => {
        fetchProperties();
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
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Propietario</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Dirección</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Coeficiente</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {properties.map((property) => (
                            <tr key={property.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{property.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">
                                    {property.ownerId ? (
                                        <Link
                                            href={`/t/${tenantId}/catalog?tab=owners&ownerId=${property.ownerId}`}
                                            className="text-indigo-400 hover:text-indigo-300 hover:underline"
                                        >
                                            {property.ownerName || 'Sin nombre'}
                                        </Link>
                                    ) : (
                                        <span className="text-slate-500">Sin propietario</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{property.address || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{property.coefficient || '-'}</td>
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
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
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
