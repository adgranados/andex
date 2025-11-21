'use client';

import { useState, useEffect } from 'react';
import { db } from '@/src/client/firebaseClient';
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
                // However, for quorum calculation we need both.
                // Let's keep loading true until we get the first snapshot?
                // Actually, onSnapshot fires pretty quickly.
            }
        };

        fetchData();

        // Real-time attendance listener
        const attendanceRef = collection(db, `tCollections/${tenantId}/assemblies/${assemblyId}/attendance`);
        const unsubscribe = onSnapshot(attendanceRef, (snapshot) => {
            const attMap: Record<string, string> = {};
            snapshot.forEach((doc) => {
                const data = doc.data() as AttendanceRecord;
                // Ensure we use the document ID or the propertyId field. 
                // The API saves it with doc(propertyId), so doc.id is the propertyId.
                attMap[doc.id] = data.status || 'PRESENT';
            });
            setAttendance(attMap);
            setLoading(false);
        }, (error) => {
            console.error("Error listening to attendance:", error);
            setLoading(false);
        });

        return () => unsubscribe();
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

    if (loading) return <div className="text-slate-400">Cargando asistencia...</div>;

    return (
        <div className="flex flex-col h-full bg-slate-900 border-r border-white/10">
            <div className="p-4 border-b border-white/10 bg-slate-800/50">
                <h3 className="text-lg font-semibold text-white mb-2">Quórum</h3>
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
