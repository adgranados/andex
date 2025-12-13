'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { auth } from '@/src/client/firebaseClient';
import { signOut } from 'firebase/auth';

interface SidebarProps {
    tenantId: string;
    tenantName?: string;
}

export function Sidebar({ tenantId, tenantName }: SidebarProps) {
    const pathname = usePathname();

    const links = [
        { href: `/t/${tenantId}/dashboard`, label: 'Dashboard', icon: 'Home' },
        { href: `/t/${tenantId}/catalog`, label: 'Catálogo', icon: 'Folder' }, // Added based on existing Link below
        { href: `/t/${tenantId}/assemblies`, label: 'Asambleas', icon: 'UserGroup' }, // New link
        { href: `/t/${tenantId}/settings`, label: 'Settings', icon: 'Settings' },
    ];

    const handleLogout = async () => {
        await signOut(auth);
tvcsx        window.location.href = `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/login`;
    };

    return (
        <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-white/10 bg-slate-950/50 backdrop-blur-xl transition-transform">
            <div className="flex h-full flex-col px-3 py-4">
                <div className="mb-5 flex items-center pl-2.5">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white font-bold">
                        {tenantName?.[0] || 'T'}
                    </div>
                    <span className="ml-3 self-center whitespace-nowrap text-xl font-semibold text-white">
                        {tenantName || 'Workspace'}
                    </span>
                </div>

                <nav className="flex-1 space-y-1 px-2 py-4">
                    <Link
                        href={`/t/${tenantId}/dashboard`}
                        className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${pathname.endsWith('/dashboard')
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        Dashboard
                    </Link>
                    <Link
                        href={`/t/${tenantId}/catalog`}
                        className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${pathname.includes('/catalog')
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        Catálogo Maestro
                    </Link>
                    <Link
                        href={`/t/${tenantId}/assemblies`}
                        className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${pathname.includes('/assemblies')
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        Asambleas
                    </Link>
                    <Link
                        href={`/t/${tenantId}/settings`}
                        className={`group flex items-center rounded-md px-2 py-2 text-sm font-medium ${pathname.endsWith('/settings')
                            ? 'bg-indigo-500/10 text-indigo-400'
                            : 'text-slate-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        Settings
                    </Link>
                </nav>

                <div className="mt-auto border-t border-white/10 pt-4">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center rounded-lg p-2 text-white hover:bg-white/10 group"
                    >
                        <span className="ml-3">Sign Out</span>
                    </button>
                </div>
            </div>
        </aside>
    );
}
