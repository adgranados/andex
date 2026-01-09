'use client';

import { useState, useEffect } from 'react';
import { db, auth } from '@/src/client/firebaseClient';
import { collection, onSnapshot } from 'firebase/firestore';

import { PropertyDetailsModal } from './PropertyDetailsModal';

interface Property {
    id: string;
    name: string;
    ownerName: string;
    coefficient: number;
}

interface AttendanceRecord {
    propertyId: string;
    status: string;
    representative?: string;
}

export function AttendancePanel({ tenantId, assemblyId, properties }: { tenantId: string; assemblyId: string; properties: Property[] }) {
    const [attendance, setAttendance] = useState<Record<string, { status: string; representative?: string }>>({});
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);

    // Subscribe to attendance (real-time)
    useEffect(() => {
        let eventSource: EventSource | null = null; // Declare eventSource here

        const connectToSseStream = () => {
            eventSource = new EventSource(
                `${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${tenantId}/assemblies/${assemblyId}/attendance/stream`
            );

            eventSource.onmessage = (event) => {
                try {
                    const data: AttendanceRecord[] = JSON.parse(event.data);
                    const attMap: Record<string, { status: string; representative?: string }> = {};
                    data.forEach(r => attMap[r.propertyId] = { status: r.status, representative: r.representative });
                    setAttendance(attMap);
                    setLoading(false);
                } catch (err) {
                    console.error('SSE parsing error:', err);
                }
            };

            eventSource.onerror = (error) => {
                console.error('SSE connection error. Retrying in 5s...', error);
                eventSource?.close(); // Close current connection if it exists
                setTimeout(connectToSseStream, 5000); // Attempt to reconnect
            };
        };

        // Initial connection
        connectToSseStream();

        return () => {
            eventSource?.close(); // Close on unmount
        };
    }, [tenantId, assemblyId]);

    const handleUpdateAttendance = async (property: Property, status: string, representative?: string) => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${tenantId}/assemblies/${assemblyId}/attendance`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    propertyId: property.id,
                    propertyName: property.name,
                    ownerName: property.ownerName,
                    coefficient: property.coefficient,
                    representative,
                    status
                })
            });

            if (!res.ok) {
                console.error('Failed to mark attendance');
            }
        } catch (error) {
            console.error(error);
        }
    };
    // ...


    const filteredProperties = properties.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.ownerName && p.ownerName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const totalCoefficient = properties.reduce((sum, p) => sum + (p.coefficient || 0), 0);
    const presentCoefficient = properties.reduce((sum, p) => {
        return attendance[p.id]?.status === 'PRESENT' ? sum + (p.coefficient || 0) : sum;
    }, 0);

    const quorumPercentage = totalCoefficient > 0 ? (presentCoefficient / totalCoefficient) * 100 : 0;

    const handleManualRefresh = async () => {
        console.log('Manual refresh clicked');
        // Removed unused auth context logging for clarity

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_PATH || ''}/api/t/${tenantId}/assemblies/${assemblyId}/attendance`);
            if (res.ok) {
                const data: AttendanceRecord[] = await res.json();
                console.log('API Attendance Data:', data);
                const attMap: Record<string, { status: string; representative?: string }> = {};
                data.forEach(r => attMap[r.propertyId] = { status: r.status, representative: r.representative });
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
                    const record = attendance[property.id];
                    const isPresent = record?.status === 'PRESENT';
                    const representative = record?.representative;
                    const isProxy = !!representative && representative !== property.ownerName;

                    return (
                        <div
                            key={property.id}
                            onClick={() => setSelectedProperty(property)}
                            className={`p-3 rounded-md cursor-pointer flex justify-between items-center transition-colors ${isPresent ? 'bg-green-900/20 border border-green-500/30' : 'hover:bg-white/5 border border-transparent'
                                }`}
                        >
                            <div className="overflow-hidden">
                                <div className="text-sm font-bold text-white truncate">{property.name}</div>
                                <div className="text-xs text-slate-300 truncate flex flex-col gap-0.5">
                                    <div className="flex items-center gap-1">
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 opacity-70">
                                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-5.5-2.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0zM10 12a5.99 5.99 0 00-4.793 2.39A9.916 9.916 0 0010 18c2.314 0 4.438-.784 6.131-2.1.04-.05.099-.066.145-.04a5.99 5.99 0 00-4.793-2.39z" clipRule="evenodd" />
                                        </svg>
                                        {property.ownerName || 'Sin propietario'}
                                    </div>
                                    {isPresent && isProxy && (
                                        <div className="flex items-center gap-1 text-indigo-300">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                                <path d="M7 8a3 3 0 100-6 3 3 0 000 6zM14.5 9a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM1.615 16.428a1.224 1.224 0 01-.569-1.175 6.002 6.002 0 0111.908 0c.058.467-.172.92-.57 1.174A9.953 9.953 0 017 18a9.953 9.953 0 01-5.385-1.572zM14.5 16h-.106c.07-.297.088-.611.048-.933a7.47 7.47 0 00-1.588-3.755 4.502 4.502 0 015.874 2.636.818.818 0 01-.36.98A7.465 7.465 0 0114.5 16z" />
                                            </svg>
                                            Apoderado: {representative}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={`w-3 h-3 rounded-full shrink-0 ${isPresent ? 'bg-green-500' : 'bg-slate-600'}`}></div>
                        </div>
                    );
                })}
            </div>

            <PropertyDetailsModal
                isOpen={!!selectedProperty}
                onClose={() => setSelectedProperty(null)}
                property={selectedProperty}
                isPresent={selectedProperty ? attendance[selectedProperty.id]?.status === 'PRESENT' : false}
                currentRepresentative={selectedProperty ? attendance[selectedProperty.id]?.representative : undefined}
                onUpdateAttendance={handleUpdateAttendance}
            />
        </div>
    );
}
