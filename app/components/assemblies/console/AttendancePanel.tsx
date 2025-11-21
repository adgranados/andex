'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/src/client/firebaseClient';
import { collection, onSnapshot } from 'firebase/firestore';

interface Property {
    id: string;
    name: string;
    ownerName: string;
    coefficient: number;
}

interface AttendanceRecord {
    propertyId: string;
    status: string;
}

export function AttendancePanel({ tenantId, assemblyId }: { tenantId: string; assemblyId: string }) {
    const [properties, setProperties] = useState<Property[]>([]);
    const [attendance, setAttendance] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Fetch properties (static) and subscribe to attendance (real-time)
    useEffect(() => {
        const fetchData = async () => {
            try {
                const propsRes = await fetch(`/api/t/${tenantId}/properties`);
                if (propsRes.ok) {
                    setProperties(await propsRes.json());
                }
            } catch (error) {
                console.error('Error fetching properties:', error);
            } finally {
                // Only set loading to false if we're not waiting for attendance (which is handled by onSnapshot)
                // But we want to show the UI as soon as properties are loaded, even if attendance is still syncing.
                setLoading(false); // Set loading to false after initial properties and attendance are fetched
            }
        };

        // Initial fetch
        fetchData();

        // Polling every 3 seconds to ensure updates without relying on Firestore rules
        const intervalId = setInterval(() => {
            fetch(`/api/t/${tenantId}/assemblies/${assemblyId}/attendance`)
                .then(res => {
                    if (res.ok) return res.json();
                    throw new Error('Failed to fetch');
                })
                .then((data: AttendanceRecord[]) => {
                    const attMap: Record<string, string> = {};
                    data.forEach(r => attMap[r.propertyId] = r.status);
                    setAttendance(attMap);
                })
                .catch(err => console.error('Polling error:', err));
        }, 3000);

        return () => clearInterval(intervalId);
    }, [tenantId, assemblyId]);

    const handleToggleAttendance = async (property: Property) => {
        const isPresent = attendance[property.id] === 'PRESENT';

        if (isPresent) return; // Already present

        try {
            // We still use the API to write, to keep logic centralized (and maybe for server-side validation/logging)
            // Or we could write directly to Firestore since we are using client SDK.
            // Using API is safer for business logic.
            const res = await fetch(`/api/t/${tenantId}/assemblies/${assemblyId}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: property.id,
                    propertyName: property.name,
                    ownerName: property.ownerName,
                    coefficient: property.coefficient,
                    representative: 'Admin Manual'
                })
            });

            if (!res.ok) {
                console.error('Failed to mark attendance');
            }
            // No need to manually update state, onSnapshot will handle it
        } catch (error) {
            console.error(error);
        }
    };

    const filteredProperties = properties.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.ownerName && p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalCoefficient = properties.reduce((sum, p) => sum + (p.coefficient || 0), 0);
    const presentCoefficient = properties.reduce((sum, p) => {
        return attendance[p.id] === 'PRESENT' ? sum + (p.coefficient || 0) : sum;
    }, 0);

    const quorumPercentage = totalCoefficient > 0 ? (presentCoefficient / totalCoefficient) * 100 : 0;

    const handleManualRefresh = async () => {
        console.log('Manual refresh clicked');
        console.log('Current User:', auth.currentUser);
        if (auth.currentUser) {
            const token = await auth.currentUser.getIdTokenResult();
            console.log('Claims:', token.claims);
        }

        try {
            const res = await fetch(`/api/t/${tenantId}/assemblies/${assemblyId}/attendance`);
            if (res.ok) {
                const data: AttendanceRecord[] = await res.json();
                console.log('API Attendance Data:', data);
                const attMap: Record<string, string> = {};
                data.forEach(r => attMap[r.propertyId] = r.status);
                setAttendance(attMap);
            }
        } catch (error) {
            console.error('Manual fetch error:', error);
        }
    };

    if (loading) return <div className="text-slate-400">Cargando asistencia...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-white/10">
            <div className="p-4 border-b border-white/10 bg-slate-800/50">
                <div className="flex justify-between items-center mb-2">
                    <h3 className="text-lg font-semibold text-white">Quórum</h3>
                    <button onClick={handleManualRefresh} className="text-xs text-indigo-400 hover:text-indigo-300">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 inline-block mr-1">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.181m0 0l-3.181 3.182M16.023 9.348L12.842 6.167m0 0l3.181-3.182A4.5 4.5 0 0118.905 4.5H21.5a3 3 0 013 3v.585M2.985 19.644A4.5 4.5 0 005.09 21.5h.585a3 3 0 003-3v-.585m-4.992 0l3.181-3.181M12.842 6.167L9.66 2.985M9.66 2.985A4.5 4.5 0 007.5 4.5H4.5a3 3 0 00-3 3v.585m4.992 0l-3.181 3.181M12.842 6.167L9.66 2.985" />
                        </svg>
                        Refrescar
                    </button>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-4 mb-1">
                    <div
                        className="bg-green-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${quorumPercentage}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-slate-400">
                    <span>{presentCoefficient.toFixed(4)} Presente</span>
                    <span>{quorumPercentage.toFixed(2)}% Total</span>
                </div>
            </div>

            <div className="p-4 border-b border-white/10">
                <input
                    type="text"
                    placeholder="Buscar propiedad..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-800 border-white/10 rounded-md text-sm text-white px-3 py-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>

            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                {filteredProperties.map(property => {
                    const isPresent = attendance[property.id] === 'PRESENT';
                    return (
                        <div
                            key={property.id}
                            onClick={() => handleToggleAttendance(property)}
                            className={`p-3 rounded-md cursor-pointer flex justify-between items-center transition-colors ${isPresent ? 'bg-green-900/20 border border-green-500/30' : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div>
                                <div className="text-sm font-medium text-white">{property.name}</div>
                                <div className="text-xs text-slate-400">{property.ownerName}</div>
                            </div>
                            <div className={`w-3 h-3 rounded-full ${isPresent ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
