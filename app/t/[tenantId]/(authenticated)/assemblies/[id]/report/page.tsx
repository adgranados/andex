'use client';

import { useState, useEffect } from 'react';

export default function AssemblyReportPage({ params }: { params: { tenantId: string; id: string } }) {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReport = async () => {
            try {
                const res = await fetch(`/api/t/${params.tenantId}/assemblies/${params.id}/report`);
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        fetchReport();
    }, [params]);

    if (loading) return <div className="p-8 text-center">Generando reporte...</div>;
    if (!data) return <div className="p-8 text-center text-red-500">Error al cargar el reporte</div>;

    const { assembly, attendance, questions } = data;

    return (
        <div className="min-h-screen bg-white text-black p-8 print:p-0">
            {/* Actions (Hidden in Print) */}
            <div className="max-w-4xl mx-auto mb-8 flex justify-end print:hidden">
                <button
                    onClick={() => window.print()}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                    </svg>
                    Imprimir / Guardar PDF
                </button>
            </div>

            {/* Report Content */}
            <div className="max-w-4xl mx-auto bg-white print:w-full">
                {/* Header */}
                <header className="border-b-2 border-black pb-6 mb-8">
                    <div className="flex justify-between items-start">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">{assembly.title}</h1>
                            <p className="text-gray-600">Código: <span className="font-mono font-bold">{assembly.code}</span></p>
                            <p className="text-gray-600">Fecha: {new Date(assembly.date).toLocaleDateString()}</p>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Estado</div>
                            <div className="font-bold uppercase tracking-wider">{assembly.status}</div>
                        </div>
                    </div>
                </header>

                {/* Quorum Summary */}
                <section className="mb-12">
                    <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Resumen de Quórum</h2>
                    <div className="grid grid-cols-2 gap-8">
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">Asistencia (Unidades)</div>
                            <div className="text-2xl font-bold">
                                {attendance.present} / {attendance.total}
                                <span className="text-base font-normal text-gray-500 ml-2">
                                    ({((attendance.present / attendance.total) * 100).toFixed(1)}%)
                                </span>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                            <div className="text-sm text-gray-500 mb-1">Coeficiente Representado</div>
                            <div className="text-2xl font-bold">
                                {attendance.presentCoefficient.toFixed(4)}
                                <span className="text-base font-normal text-gray-500 ml-2">
                                    / {attendance.totalCoefficient.toFixed(4)}
                                </span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Voting Results */}
                <section className="mb-12 break-inside-avoid">
                    <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Resultados de Votaciones</h2>
                    <div className="space-y-8">
                        {questions.map((q: any, idx: number) => (
                            <div key={q.id} className="break-inside-avoid">
                                <div className="flex items-center gap-3 mb-3">
                                    <span className="bg-black text-white w-6 h-6 flex items-center justify-center rounded-full text-sm font-bold">
                                        {idx + 1}
                                    </span>
                                    <h3 className="text-lg font-semibold">{q.title}</h3>
                                </div>

                                <table className="w-full text-sm border-collapse border border-gray-300">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="border border-gray-300 p-2 text-left">Opción</th>
                                            <th className="border border-gray-300 p-2 text-right w-24">Votos</th>
                                            <th className="border border-gray-300 p-2 text-right w-32">Coeficiente</th>
                                            <th className="border border-gray-300 p-2 text-right w-24">% Coef.</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {q.results.map((opt: any) => (
                                            <tr key={opt.id}>
                                                <td className="border border-gray-300 p-2">{opt.text}</td>
                                                <td className="border border-gray-300 p-2 text-right">{opt.count}</td>
                                                <td className="border border-gray-300 p-2 text-right">{opt.coefficientSum.toFixed(4)}</td>
                                                <td className="border border-gray-300 p-2 text-right">
                                                    {q.totalCoefficient > 0
                                                        ? ((opt.coefficientSum / q.totalCoefficient) * 100).toFixed(1)
                                                        : '0.0'}%
                                                </td>
                                            </tr>
                                        ))}
                                        <tr className="bg-gray-50 font-bold">
                                            <td className="border border-gray-300 p-2">Total</td>
                                            <td className="border border-gray-300 p-2 text-right">{q.totalVotes}</td>
                                            <td className="border border-gray-300 p-2 text-right">{q.totalCoefficient.toFixed(4)}</td>
                                            <td className="border border-gray-300 p-2 text-right">100%</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        ))}
                        {questions.length === 0 && (
                            <p className="text-gray-500 italic">No se registraron votaciones.</p>
                        )}
                    </div>
                </section>

                {/* Attendance List */}
                <section className="break-before-page">
                    <h2 className="text-xl font-bold border-b border-gray-300 pb-2 mb-4">Registro de Asistencia</h2>
                    <table className="w-full text-sm border-collapse border border-gray-300">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border border-gray-300 p-2 text-left">Propiedad</th>
                                <th className="border border-gray-300 p-2 text-left">Propietario</th>
                                <th className="border border-gray-300 p-2 text-right">Coeficiente</th>
                                <th className="border border-gray-300 p-2 text-center">Estado</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendance.list.map((p: any) => (
                                <tr key={p.propertyId}>
                                    <td className="border border-gray-300 p-2 font-medium">{p.propertyName}</td>
                                    <td className="border border-gray-300 p-2">{p.ownerName}</td>
                                    <td className="border border-gray-300 p-2 text-right">{p.coefficient.toFixed(4)}</td>
                                    <td className="border border-gray-300 p-2 text-center">
                                        <span className={`px-2 py-0.5 rounded text-xs font-bold ${p.status === 'PRESENT' ? 'bg-green-100 text-green-800' : 'bg-red-50 text-red-800'
                                            }`}>
                                            {p.status === 'PRESENT' ? 'PRESENTE' : 'AUSENTE'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </section>
            </div>
        </div>
    );
}
