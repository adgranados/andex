'use client';

import { useEffect, useState } from 'react';
import { InlineModal } from './InlineModal';
import { OwnerForm } from './QuickCreateForms';

interface Owner {
    id: string;
    name: string;
    identificationNumber?: string;
    email?: string;
    phone?: string;
}

export function OwnerList({ tenantId }: { tenantId: string }) {
    const [owners, setOwners] = useState<Owner[]>([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [editingOwner, setEditingOwner] = useState<Owner | null>(null);

    const fetchOwners = () => {
        setLoading(true);
        fetch(`/api/t/${tenantId}/owners`)
            .then((res) => res.json())
            .then((data) => {
                setOwners(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error(err);
                setLoading(false);
            });
    };

    useEffect(() => {
        fetchOwners();
    }, [tenantId]);

    const handleCreateSuccess = (newOwner: Owner) => {
        setOwners([...owners, newOwner]);
        setIsCreating(false);
    };

    const handleEditSuccess = (updatedOwner: Owner) => {
        setOwners(owners.map(o => o.id === updatedOwner.id ? updatedOwner : o));
        setEditingOwner(null);
    };

    if (loading) return <div className="text-slate-400">Cargando propietarios...</div>;

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white">Propietarios</h2>
                <button
                    onClick={() => setIsCreating(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
                >
                    + Nuevo Propietario
                </button>
            </div>

            <div className="overflow-hidden rounded-lg border border-white/10">
                <table className="min-w-full divide-y divide-white/10 bg-slate-900/50">
                    <thead className="bg-white/5">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Nombre / Razón Social</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Identificación</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Email</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Teléfono</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Acciones</span></th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                        {owners.map((owner) => (
                            <tr key={owner.id} className="hover:bg-white/5 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">{owner.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{owner.identificationNumber || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{owner.email || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">{owner.phone || '-'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => setEditingOwner(owner)}
                                        className="text-indigo-400 hover:text-indigo-300"
                                    >
                                        Editar
                                    </button>
                                </td>
                            </tr>
                        ))}
                        {owners.length === 0 && (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">
                                    No hay propietarios registrados.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <InlineModal isOpen={isCreating} onClose={() => setIsCreating(false)} title="Nuevo Propietario">
                <OwnerForm
                    tenantId={tenantId}
                    onSuccess={handleCreateSuccess}
                    onCancel={() => setIsCreating(false)}
                />
            </InlineModal>

            <InlineModal isOpen={!!editingOwner} onClose={() => setEditingOwner(null)} title="Editar Propietario">
                {editingOwner && (
                    <OwnerForm
                        tenantId={tenantId}
                        initialData={editingOwner}
                        onSuccess={handleEditSuccess}
                        onCancel={() => setEditingOwner(null)}
                    />
                )}
            </InlineModal>
        </div>
    );
}
