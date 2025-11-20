'use client';

import { useEffect, useState } from 'react';
import { InlineModal } from './InlineModal';
import { ZoneForm, TypeForm, OwnerForm } from './QuickCreateForms';

interface PropertyFormProps {
    tenantId: string;
    onSuccess: () => void;
    onCancel: () => void;
}

export function PropertyForm({ tenantId, onSuccess, onCancel }: PropertyFormProps) {
    const [formData, setFormData] = useState({
        address: '',
        coefficient: '',
        typeId: '',
        zoneId: '',
        ownerId: '',
    });

    const [zones, setZones] = useState<any[]>([]);
    const [types, setTypes] = useState<any[]>([]);
    const [owners, setOwners] = useState<any[]>([]);

    const [modalOpen, setModalOpen] = useState<'zone' | 'type' | 'owner' | null>(null);
    const [loading, setLoading] = useState(false);

    // Fetch dependencies
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [z, t, o] = await Promise.all([
                    fetch(`/api/t/${tenantId}/zones`).then(r => r.json()),
                    fetch(`/api/t/${tenantId}/property-types`).then(r => r.json()),
                    fetch(`/api/t/${tenantId}/owners`).then(r => r.json())
                ]);
                setZones(z);
                setTypes(t);
                setOwners(o);
            } catch (e) {
                console.error('Error fetching dependencies', e);
            }
        };
        fetchData();
    }, [tenantId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/t/${tenantId}/properties`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...formData,
                    coefficient: Number(formData.coefficient)
                }),
            });
            if (res.ok) {
                onSuccess();
            } else {
                alert('Error creating property');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectChange = (field: string, value: string) => {
        if (value === 'NEW_ZONE') {
            setModalOpen('zone');
        } else if (value === 'NEW_TYPE') {
            setModalOpen('type');
        } else if (value === 'NEW_OWNER') {
            setModalOpen('owner');
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleNewItemCreated = (type: 'zone' | 'type' | 'owner', item: any) => {
        if (type === 'zone') {
            setZones(prev => [...prev, item]);
            setFormData(prev => ({ ...prev, zoneId: item.id }));
        } else if (type === 'type') {
            setTypes(prev => [...prev, item]);
            setFormData(prev => ({ ...prev, typeId: item.id }));
        } else if (type === 'owner') {
            setOwners(prev => [...prev, item]);
            setFormData(prev => ({ ...prev, ownerId: item.id }));
        }
        setModalOpen(null);
    };

    return (
        <div className="bg-slate-900 p-6 rounded-lg border border-white/10">
            <h2 className="text-xl font-semibold text-white mb-6">Nueva Propiedad</h2>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400">Dirección / Nomenclatura *</label>
                    <input
                        type="text"
                        required
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                    />
                </div>

                {/* Coefficient */}
                <div>
                    <label className="block text-sm font-medium text-slate-400">Coeficiente *</label>
                    <input
                        type="number"
                        step="0.0001"
                        required
                        value={formData.coefficient}
                        onChange={e => setFormData({ ...formData, coefficient: e.target.value })}
                        className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                    />
                </div>

                {/* Property Type */}
                <div>
                    <label className="block text-sm font-medium text-slate-400">Tipo de Inmueble *</label>
                    <select
                        required
                        value={formData.typeId}
                        onChange={e => handleSelectChange('typeId', e.target.value)}
                        className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                    >
                        <option value="">Seleccionar...</option>
                        {types.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                        <option value="NEW_TYPE" className="font-bold text-indigo-400">+ Crear nuevo tipo...</option>
                    </select>
                </div>

                {/* Zone */}
                <div>
                    <label className="block text-sm font-medium text-slate-400">Zona *</label>
                    <select
                        required
                        value={formData.zoneId}
                        onChange={e => handleSelectChange('zoneId', e.target.value)}
                        className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                    >
                        <option value="">Seleccionar...</option>
                        {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                        <option value="NEW_ZONE" className="font-bold text-indigo-400">+ Crear nueva zona...</option>
                    </select>
                </div>

                {/* Owner */}
                <div className="col-span-2">
                    <label className="block text-sm font-medium text-slate-400">Propietario *</label>
                    <select
                        required
                        value={formData.ownerId}
                        onChange={e => handleSelectChange('ownerId', e.target.value)}
                        className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 px-3 py-2"
                    >
                        <option value="">Seleccionar...</option>
                        {owners.map(o => <option key={o.id} value={o.id}>{o.name} {o.identificationNumber ? `(${o.identificationNumber})` : ''}</option>)}
                        <option value="NEW_OWNER" className="font-bold text-indigo-400">+ Crear nuevo propietario...</option>
                    </select>
                </div>

                {/* Actions */}
                <div className="col-span-2 flex justify-end space-x-4 pt-4 border-t border-white/10">
                    <button type="button" onClick={onCancel} className="text-slate-400 hover:text-white">Cancelar</button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-md font-medium disabled:opacity-50"
                    >
                        {loading ? 'Guardando...' : 'Guardar Propiedad'}
                    </button>
                </div>
            </form>

            {/* Modals */}
            <InlineModal isOpen={modalOpen === 'zone'} onClose={() => setModalOpen(null)} title="Nueva Zona">
                <ZoneForm tenantId={tenantId} onSuccess={(item) => handleNewItemCreated('zone', item)} onCancel={() => setModalOpen(null)} />
            </InlineModal>

            <InlineModal isOpen={modalOpen === 'type'} onClose={() => setModalOpen(null)} title="Nuevo Tipo de Propiedad">
                <TypeForm tenantId={tenantId} onSuccess={(item) => handleNewItemCreated('type', item)} onCancel={() => setModalOpen(null)} />
            </InlineModal>

            <InlineModal isOpen={modalOpen === 'owner'} onClose={() => setModalOpen(null)} title="Nuevo Propietario">
                <OwnerForm tenantId={tenantId} onSuccess={(item) => handleNewItemCreated('owner', item)} onCancel={() => setModalOpen(null)} />
            </InlineModal>
        </div>
    );
}
