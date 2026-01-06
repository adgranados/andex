'use client';

import { useEffect, useState } from 'react';
import { InlineModal } from './InlineModal';
import { ZoneForm, TypeForm, OwnerForm } from './QuickCreateForms';

interface BaseFormProps {
    tenantId: string;
    onSuccess: (item?: any) => void;
    onCancel: () => void;
}

interface PropertyFormProps extends BaseFormProps {
    initialData?: {
        id: string;
        name: string;
        zoneId: string;
        typeId: string;
        ownerId: string;
        address?: string;
        coefficient?: number;
    };
}

export function PropertyForm({ tenantId, onSuccess, onCancel, initialData }: PropertyFormProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [zoneId, setZoneId] = useState(initialData?.zoneId || '');
    const [typeId, setTypeId] = useState(initialData?.typeId || '');
    const [ownerId, setOwnerId] = useState(initialData?.ownerId || '');
    const [address, setAddress] = useState(initialData?.address || '');
    const [coefficient, setCoefficient] = useState(initialData?.coefficient?.toString() || '');

    const [zones, setZones] = useState<{ id: string; name: string }[]>([]);
    const [types, setTypes] = useState<{ id: string; name: string }[]>([]);
    const [owners, setOwners] = useState<{ id: string; name: string }[]>([]);

    const [loading, setLoading] = useState(false);
    const [fetchingDeps, setFetchingDeps] = useState(true);

    // Modal states for inline creation
    const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
    const [isTypeModalOpen, setIsTypeModalOpen] = useState(false);
    const [isOwnerModalOpen, setIsOwnerModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [zonesRes, typesRes, ownersRes] = await Promise.all([
                    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${tenantId}/zones`),
                    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${tenantId}/property-types`),
                    fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${tenantId}/owners`)
                ]);

                if (zonesRes.ok) setZones(await zonesRes.json());
                if (typesRes.ok) setTypes(await typesRes.json());
                if (ownersRes.ok) setOwners(await ownersRes.json());
            } catch (error) {
                console.error('Error fetching dependencies:', error);
            } finally {
                setFetchingDeps(false);
            }
        };
        fetchData();
    }, [tenantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const method = initialData ? 'PUT' : 'POST';
            const body = initialData
                ? { id: initialData.id, name, zoneId, typeId, ownerId, address, coefficient: parseFloat(coefficient) || 0 }
                : { name, zoneId, typeId, ownerId, address, coefficient: parseFloat(coefficient) || 0 };

            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${tenantId}/properties`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                const newItem = await res.json();
                onSuccess(newItem);
            } else {
                console.error('Failed to save property');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleZoneCreated = (newZone: any) => {
        setZones([...zones, newZone]);
        setZoneId(newZone.id);
        setIsZoneModalOpen(false);
    };

    const handleTypeCreated = (newType: any) => {
        setTypes([...types, newType]);
        setTypeId(newType.id);
        setIsTypeModalOpen(false);
    };

    const handleOwnerCreated = (newOwner: any) => {
        setOwners([...owners, newOwner]);
        setOwnerId(newOwner.id);
        setIsOwnerModalOpen(false);
    };

    if (fetchingDeps) return <div className="text-slate-400">Cargando datos...</div>;

    return (
        <>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-slate-400">Nombre de la Propiedad</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        required
                    />
                </div>

                {/* Zone Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-400">Zona</label>
                    <div className="flex gap-2">
                        <select
                            value={zoneId}
                            onChange={(e) => setZoneId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                            required
                        >
                            <option value="">Seleccionar Zona</option>
                            {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                        </select>
                        <button
                            type="button"
                            onClick={() => setIsZoneModalOpen(true)}
                            className="mt-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Type Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-400">Tipo de Propiedad</label>
                    <div className="flex gap-2">
                        <select
                            value={typeId}
                            onChange={(e) => setTypeId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                            required
                        >
                            <option value="">Seleccionar Tipo</option>
                            {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        </select>
                        <button
                            type="button"
                            onClick={() => setIsTypeModalOpen(true)}
                            className="mt-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm"
                        >
                            +
                        </button>
                    </div>
                </div>

                {/* Owner Selection */}
                <div>
                    <label className="block text-sm font-medium text-slate-400">Propietario</label>
                    <div className="flex gap-2">
                        <select
                            value={ownerId}
                            onChange={(e) => setOwnerId(e.target.value)}
                            className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                            required
                        >
                            <option value="">Seleccionar Propietario</option>
                            {owners.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                        </select>
                        <button
                            type="button"
                            onClick={() => setIsOwnerModalOpen(true)}
                            className="mt-1 px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md text-sm"
                        >
                            +
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Dirección</label>
                        <input
                            type="text"
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-400">Coeficiente</label>
                        <input
                            type="number"
                            step="0.0001"
                            value={coefficient}
                            onChange={(e) => setCoefficient(e.target.value)}
                            className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm disabled:opacity-50 transition-colors"
                    >
                        {loading ? 'Guardando...' : 'Guardar Propiedad'}
                    </button>
                </div>
            </form>

            {/* Inline Modals */}
            <InlineModal isOpen={isZoneModalOpen} onClose={() => setIsZoneModalOpen(false)} title="Nueva Zona">
                <ZoneForm tenantId={tenantId} onSuccess={handleZoneCreated} onCancel={() => setIsZoneModalOpen(false)} />
            </InlineModal>

            <InlineModal isOpen={isTypeModalOpen} onClose={() => setIsTypeModalOpen(false)} title="Nuevo Tipo">
                <TypeForm tenantId={tenantId} onSuccess={handleTypeCreated} onCancel={() => setIsTypeModalOpen(false)} />
            </InlineModal>

            <InlineModal isOpen={isOwnerModalOpen} onClose={() => setIsOwnerModalOpen(false)} title="Nuevo Propietario">
                <OwnerForm tenantId={tenantId} onSuccess={handleOwnerCreated} onCancel={() => setIsOwnerModalOpen(false)} />
            </InlineModal>
        </>
    );
}
