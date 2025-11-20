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
        { href: `/t/${tenantId}/settings`, label: 'Settings', icon: 'Settings' },
    ];

    const handleLogout = async () => {
        await signOut(auth);
        window.location.href = '/login';
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

                <ul className="space-y-2 font-medium flex-1">
                    {links.map((link) => {
                        const isActive = pathname === link.href;
                        return (
                            <li key={link.href}>
                                <Link
                                    href={link.href}
                                    className={`flex items-center rounded-lg p-2 text-white hover:bg-white/10 group ${isActive ? 'bg-white/10' : ''
                                        }`}
                                >
                                    <span className="ml-3">{link.label}</span>
                                </Link>
                            </li>
                        );
                    })}
                </ul>

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
