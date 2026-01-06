'use client';

import { useState, useEffect } from 'react';
import { auth } from '@/src/client/firebaseClient';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function OnboardingPage() {
    const [user, setUser] = useState<User | null>(null);
    const [tenantName, setTenantName] = useState('');
    const [slug, setSlug] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
            } else {
                // Redirect to login if not authenticated
                window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/login`;
                return;
            }
        });
        return () => unsubscribe();
    }, []);

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const name = e.target.value;
        setTenantName(name);
        // Auto-generate slug from name
        const generatedSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        setSlug(generatedSlug);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/tenants/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    uid: user.uid,
                    email: user.email,
                    tenantName,
                    slug
                })
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || 'Failed to create workspace');
            }

            const data = await response.json();
            // Force token refresh to get new claims
            await user.getIdToken(true);

            // Redirect to new tenant dashboard
            window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/t/${data.tenantId}/dashboard`;

        } catch (err) {
            console.error('Onboarding error:', err);
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    };

    if (!user) return null; // Or a loading spinner

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 text-slate-100 p-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight">Welcome!</h1>
                    <p className="mt-2 text-slate-400">Let&apos;s set up your new workspace.</p>
                </div>

                <div className="rounded-3xl bg-white/5 p-8 shadow-2xl border border-white/10 backdrop-blur-xl">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <p className="text-slate-400 mb-6">
                            Para comenzar, necesitamos configurar tu primer &quot;Inquilino&quot; (Tenant).
                            Este será el espacio de trabajo para tu copropiedad.
                        </p>
                        <div className="space-y-2">
                            <label htmlFor="tenantName" className="text-sm font-medium text-slate-300">
                                Workspace Name
                            </label>
                            <input
                                id="tenantName"
                                type="text"
                                value={tenantName}
                                onChange={handleNameChange}
                                required
                                placeholder="Acme Corp"
                                className="w-full rounded-xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-white/20 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 transition"
                            />
                        </div>

                        <div className="space-y-2">
                            <label htmlFor="slug" className="text-sm font-medium text-slate-300">
                                Workspace URL
                            </label>
                            <div className="flex rounded-xl border border-white/10 bg-black/20 px-4 py-3 focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition">
                                <span className="text-slate-500 select-none">app.domain.com/t/</span>
                                <input
                                    id="slug"
                                    type="text"
                                    value={slug}
                                    onChange={(e) => setSlug(e.target.value)}
                                    required
                                    className="flex-1 bg-transparent text-white placeholder-white/20 focus:outline-none ml-1"
                                />
                            </div>
                            <p className="text-xs text-slate-500">This will be your unique workspace identifier.</p>
                        </div>

                        {error && (
                            <div className="rounded-lg bg-rose-500/10 p-3 text-sm text-rose-400 border border-rose-500/20">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full rounded-xl bg-indigo-600 py-3 font-semibold text-white shadow-lg transition hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Creating Workspace...' : 'Create Workspace'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
