'use client';

import { useState } from 'react';

interface BaseFormProps {
    tenantId: string;
    onSuccess: (newItem: any) => void;
    onCancel: () => void;
}

interface ZoneFormProps extends BaseFormProps {
    initialData?: { id: string; name: string; description?: string };
}

export function ZoneForm({ tenantId, onSuccess, onCancel, initialData }: ZoneFormProps) {
    const [name, setName] = useState(initialData?.name || '');
    const [description, setDescription] = useState(initialData?.description || '');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const method = initialData ? 'PUT' : 'POST';
            const body = initialData ? { id: initialData.id, name, description } : { name, description };

            const res = await fetch(`/api/t/${tenantId}/zones`, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (res.ok) {
                const newItem = await res.json();
                onSuccess(newItem);
            } else {
                console.error('Failed to save zone');
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-400">Nombre de la Zona *</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400">Descripción</label>
                <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="text-slate-400 hover:text-white">Cancelar</button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : 'Guardar Zona'}
                </button>
            </div>
        </form>
    );
}

export function TypeForm({ tenantId, onSuccess, onCancel }: BaseFormProps) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/t/${tenantId}/property-types`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });
            if (res.ok) {
                const newItem = await res.json();
                onSuccess(newItem);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-400">Nombre del Tipo *</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej: APTO, CASA, LOCAL"
                    className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="text-slate-400 hover:text-white">Cancelar</button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : 'Guardar Tipo'}
                </button>
            </div>
        </form>
    );
}

export function OwnerForm({ tenantId, onSuccess, onCancel }: BaseFormProps) {
    const [name, setName] = useState('');
    const [identificationNumber, setIdentificationNumber] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/t/${tenantId}/owners`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, identificationNumber, email, phone }),
            });
            if (res.ok) {
                const newItem = await res.json();
                onSuccess(newItem);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-400">Nombre Completo / Razón Social *</label>
                <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400">Número de Identificación</label>
                <input
                    type="text"
                    value={identificationNumber}
                    onChange={(e) => setIdentificationNumber(e.target.value)}
                    className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400">Correo Electrónico</label>
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-400">Teléfono de Contacto</label>
                <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="mt-1 block w-full rounded-md border-white/10 bg-slate-800 text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2"
                />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
                <button type="button" onClick={onCancel} className="text-slate-400 hover:text-white">Cancelar</button>
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50"
                >
                    {loading ? 'Guardando...' : 'Guardar Propietario'}
                </button>
            </div>
        </form>
    );
}
