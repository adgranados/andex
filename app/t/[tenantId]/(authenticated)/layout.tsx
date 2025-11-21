import { Sidebar } from '@/app/components/Sidebar';
import { AuthGuard } from '@/app/components/AuthGuard';
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
        <AuthGuard>
            <div className="flex min-h-screen bg-slate-950 text-slate-100 print:bg-white print:text-black">
                <div className="print:hidden">
                    <Sidebar tenantId={params.tenantId} tenantName={tenant?.name} />
                </div>
                <div className="ml-64 flex-1 p-8 print:ml-0 print:p-0">
                    {children}
                </div>
            </div>
        </AuthGuard>
    );
}
