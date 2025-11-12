import type { CSSProperties } from 'react';
import { db } from '@/src/server/firebaseAdmin';
import type { Tenant } from '@/src/types';

export function extractSubdomain(host: string | null): string | null {
  if (!host) return null;
  const hostname = host.split(':')[0];
  const segments = hostname.split('.');
  if (segments.length >= 3) {
    const subdomain = segments[0];
    if (!subdomain || ['www'].includes(subdomain)) {
      return null;
    }
    return subdomain;
  }

  const [maybeSubdomain, root] = segments;
  if (root === 'localhost' && maybeSubdomain && maybeSubdomain !== 'www') {
    return maybeSubdomain;
  }
  return null;
}

export function extractDomainFromEmail(email: string): string | null {
  const parts = email?.split('@');
  if (parts.length !== 2) return null;
  return parts[1].toLowerCase();
}

export async function resolveTenantByHost(host: string): Promise<{ tenantId?: string; tenant?: Tenant }> {
  const sub = extractSubdomain(host);
  if (!sub || !db?.collection) return {};
  const q = await db.collection('tenants').where('subdomains', 'array-contains', sub).limit(1).get();
  if (!q.empty) {
    const doc = q.docs[0];
    return { tenantId: doc.id, tenant: { id: doc.id, ...(doc.data() as Tenant) } };
  }
  return {};
}

export async function resolveTenantByEmailDomain(email: string): Promise<{ tenantId?: string; tenant?: Tenant }> {
  const domain = extractDomainFromEmail(email);
  if (!domain || !db?.collection) return {};
  const q = await db.collection('tenants').where('emailDomains', 'array-contains', domain).limit(1).get();
  if (!q.empty) {
    const doc = q.docs[0];
    return { tenantId: doc.id, tenant: { id: doc.id, ...(doc.data() as Tenant) } };
  }
  return {};
}

export async function getTenantById(id?: string): Promise<Tenant | undefined> {
  if (!id || !db?.collection) return undefined;
  const doc = await db.collection('tenants').doc(id).get();
  if (!doc.exists) return undefined;
  return { id: doc.id, ...(doc.data() as Tenant) };
}

export function tenantBrandingStyles(tenant?: Tenant): CSSProperties {
  if (!tenant) return {};
  return {
    '--brand-color': tenant.primaryColor || '#6366f1',
    '--brand-foreground': '#ffffff'
  } as React.CSSProperties;
}
