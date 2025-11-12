'use client';

import { useEffect } from 'react';
import type { Tenant } from '@/src/types';

export function TenantBranding({ tenant }: { tenant?: Tenant }) {
  useEffect(() => {
    if (!tenant?.primaryColor) return;
    document.documentElement.style.setProperty('--brand-color', tenant.primaryColor);
    document.documentElement.style.setProperty('--brand-foreground', '#ffffff');
  }, [tenant?.primaryColor]);

  if (!tenant) return null;

  return (
    <div className="flex items-center gap-3">
      {tenant.logoUrl ? (
        <img src={tenant.logoUrl} alt={tenant.name} className="h-10 w-10 rounded-full border border-white/20 object-cover" />
      ) : null}
      <div>
        <p className="text-sm text-white/60">Conectado con</p>
        <p className="text-lg font-semibold" style={{ color: 'var(--brand-color)' }}>
          {tenant.name}
        </p>
      </div>
    </div>
  );
}
