import { getTenantById } from '@/src/lib/tenant';
import { SettingsForm } from '@/app/components/SettingsForm';
import { notFound } from 'next/navigation';

export default async function SettingsPage({
    params,
}: {
    params: { tenantId: string };
}) {
    const tenant = await getTenantById(params.tenantId);

    if (!tenant) {
        notFound();
    }

    // Assuming the first subdomain is the slug, or we use the ID if no subdomain (though onboarding enforces slug)
    // The onboarding saves `subdomains: [slug]`.
    const slug = tenant.subdomains?.[0] || '';

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
                <p className="text-slate-400">Manage your workspace settings.</p>
            </div>

            <div className="rounded-3xl bg-white/5 p-8 shadow-2xl border border-white/10 backdrop-blur-xl">
                <SettingsForm
                    tenantId={params.tenantId}
                    initialName={tenant.name || ''}
                    initialSlug={slug}
                />
            </div>
        </div>
    );
}
