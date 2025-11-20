import { Sidebar } from '@/app/components/Sidebar';
import { getTenantById } from '@/src/lib/tenant';

export default async function TenantLayout({
    children,
    params,
}: {
    children: React.ReactNode;
    params: { tenantId: string };
}) {
    const tenant = await getTenantById(params.tenantId);

    return (
        <div className="flex min-h-screen bg-slate-950 text-slate-100">
            <Sidebar tenantId={params.tenantId} tenantName={tenant?.name} />
            <div className="ml-64 flex-1 p-8">
                {children}
            </div>
        </div>
    );
}
