import { AssemblyList } from '@/app/components/assemblies/AssemblyList';
import { db } from '@/src/server/firebaseAdmin';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function AssembliesPage({ params }: { params: { tenantId: string } }) {
    // Check if there is at least one property
    const propertiesSnapshot = await db
        .collection(`tCollections/${params.tenantId}/properties`)
        .limit(1)
        .get();

    const hasProperties = !propertiesSnapshot.empty;

    if (!hasProperties) {
        return (
            <div className="p-6">
                <div className="mb-8">
                    <h1 className="text-2xl font-bold text-white">Gestión de Asambleas</h1>
                    <p className="text-slate-400 mt-1">Programa y administra las asambleas de copropietarios.</p>
                </div>

                <div className="flex flex-col items-center justify-center py-20 bg-slate-900/50 rounded-xl border border-white/5">
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h2 className="text-xl font-medium text-white mb-2">No hay propiedades registradas</h2>
                    <p className="text-slate-400 text-center max-w-md mb-6">
                        Para crear y gestionar asambleas, primero necesitas registrar las propiedades (unidades) del conjunto.
                    </p>
                    <Link
                        href={`/t/${params.tenantId}/catalog?tab=properties`}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                    >
                        Ir a crear propiedades
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-white">Gestión de Asambleas</h1>
                <p className="text-slate-400 mt-1">Programa y administra las asambleas de copropietarios.</p>
            </div>

            <AssemblyList tenantId={params.tenantId} />
        </div>
    );
}
