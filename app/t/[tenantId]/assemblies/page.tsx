import { AssemblyList } from '@/app/components/assemblies/AssemblyList';

export default function AssembliesPage({ params }: { params: { tenantId: string } }) {
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
