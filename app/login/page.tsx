import { cookies, headers } from 'next/headers';
import { LoginCard } from './LoginCard';
import { TenantBranding } from '@/src/components/TenantBranding';
import { getTenantById, resolveTenantByHost, tenantBrandingStyles } from '@/src/lib/tenant';

export default async function LoginPage() {
  const cookieStore = cookies();
  const tenantCookie = cookieStore.get('tenantId')?.value;
  const host = headers().get('host') || '';

  let tenant = await getTenantById(tenantCookie);
  if (!tenant) {
    const resolved = await resolveTenantByHost(host);
    tenant = resolved.tenant;
  }

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white flex flex-col items-center justify-center px-6 py-10 relative overflow-hidden"
      style={tenantBrandingStyles(tenant)}
    >
      <div className="absolute inset-0 bg-radial-glow pointer-events-none" />
      <section className="relative z-10 flex flex-col items-center gap-6 text-center mb-10">
        <TenantBranding tenant={tenant} />
        <p className="text-white/60 max-w-xl">
          Acceso seguro y aislado por tenant. Inicia sesión con Google o tu cuenta corporativa.
        </p>
      </section>
      <LoginCard tenantName={tenant?.name} tenantLogo={tenant?.logoUrl} />
    </main>
  );
}
