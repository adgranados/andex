import { AssemblyConsoleLayout } from '@/app/components/assemblies/console/AssemblyConsoleLayout';
import { db } from '@/src/server/firebaseAdmin';

async function getAssembly(tenantId: string, assemblyId: string) {
    const doc = await db.collection(`tCollections/${tenantId}/assemblies`).doc(assemblyId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
}

export default async function AssemblyConsolePage({ params }: { params: { tenantId: string; id: string } }) {
    const assembly = await getAssembly(params.tenantId, params.id);

    if (!assembly) {
        return <div className="text-white p-10">Asamblea no encontrada</div>;
    }

    return (
        <AssemblyConsoleLayout
            tenantId={params.tenantId}
            assemblyId={params.id}
            assemblyTitle={assembly.title}
            assemblyCode={assembly.code}
        />
    );
}
