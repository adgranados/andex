import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { db } from '@/src/server/firebaseAdmin';
import { getTenantById, tenantBrandingStyles } from '@/src/lib/tenant';

async function fetchTenantWidgets(tenantId: string) {
  if (!db?.collection) return [];
  const snapshot = await db
    .collection('tCollections')
    .doc(tenantId)
    .collection('widgets')
    .limit(5)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Record<string, unknown>) }));
}

export default async function DashboardPage({ params }: { params: { tenantId: string } }) {
  const { tenantId } = params;
  const cookieTenantId = cookies().get('tenantId')?.value;

  if (cookieTenantId && cookieTenantId !== tenantId) {
    redirect(`/t/${cookieTenantId}/dashboard`);
  }

  const tenant = await getTenantById(tenantId);
  if (!tenant) {
    notFound();
  }

  const widgets = await fetchTenantWidgets(tenantId);

  return (
    <main className="min-h-screen bg-slate-950 text-white px-6 py-12" style={tenantBrandingStyles(tenant)}>
      <div className="mx-auto flex max-w-4xl flex-col gap-8">
        <header>
          <p className="text-sm uppercase tracking-[0.2em] text-white/50">Dashboard</p>
          <h1 className="mt-2 text-4xl font-semibold" style={{ color: 'var(--brand-color)' }}>
            {tenant.name}
          </h1>
          <p className="text-white/60">Datos aislados mediante reglas de Firestore. Cada consulta filtra por tenantId.</p>
        </header>
        <section className="grid gap-6 md:grid-cols-2">
          {widgets.length === 0 ? (
            <p className="text-white/50">No hay widgets aún. Agrega datos en la colección tCollections/{tenantId}/widgets.</p>
          ) : (
            widgets.map((widget) => (
              <div key={widget.id} className="rounded-2xl border border-white/5 bg-white/5 p-6">
                <p className="text-sm text-white/60">Widget</p>
                <pre className="mt-3 text-xs text-white/80">{JSON.stringify(widget, null, 2)}</pre>
              </div>
            ))
          )}
        </section>
      </div>
    </main>
  );
}
