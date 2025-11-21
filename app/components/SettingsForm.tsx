'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface SettingsFormProps {
    tenantId: string;
    initialName: string;
    initialSlug: string;
}

export function SettingsForm({ tenantId, initialName, initialSlug }: SettingsFormProps) {
    const router = useRouter();
    const [name, setName] = useState(initialName);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await fetch(`/api/t/${tenantId}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to update settings');
            }

            setSuccess(true);
            router.refresh(); // Refresh server components to show new name in sidebar
        } catch (err) {
            console.error('Settings update error:', err);
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl">
            <div className="space-y-2">
                <label htmlFor="tenantName" className="text-sm font-medium text-slate-300">
                    Workspace Name
                </label>
                <input
                    id="tenantName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-white/20 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                />
            </div>

            <div className="space-y-2">
                <label htmlFor="slug" className="text-sm font-medium text-slate-300">
                    Workspace URL
                </label>
                <div className="flex rounded-xl border border-white/10 bg-white/5 px-4 py-3 opacity-60 cursor-not-allowed">
                    <span className="text-slate-500 select-none">app.domain.com/t/</span>
                    <input
                        id="slug"
                        type="text"
                        value={initialSlug}
                        disabled
                        className="flex-1 bg-transparent text-slate-400 focus:outline-none ml-1 cursor-not-allowed"
                    />
                </div>
                <p className="text-xs text-slate-500">The workspace URL cannot be changed.</p>
            </div>

            {error && (
                <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20">
                    {error}
                </div>
            )}

            {success && (
                <div className="rounded-lg bg-emerald-500/10 p-3 text-sm text-emerald-400 border border-emerald-500/20">
                    Settings updated successfully.
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Saving...' : 'Save Changes'}
            </button>
        </form>
    );
}
