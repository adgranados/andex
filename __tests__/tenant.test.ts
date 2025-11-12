import { describe, it, expect, vi } from 'vitest';

const tenants = {
  acme: {
    id: 'acme',
    name: 'Acme Inc',
    logoUrl: 'https://acme/logo.png',
    primaryColor: '#ff5733',
    subdomains: ['acme'],
    emailDomains: ['acme.com']
  },
  globex: {
    id: 'globex',
    name: 'Globex',
    logoUrl: '',
    primaryColor: '#00ff99',
    subdomains: ['globex'],
    emailDomains: ['globex.com']
  }
};

vi.mock('@/src/server/firebaseAdmin', () => ({
  db: {
    collection: () => ({
      where: (field: string, _op: string, value: string) => ({
        limit: () => ({
          async get() {
            const match = Object.values(tenants).find((tenant) => tenant[field as 'subdomains' | 'emailDomains']?.includes(value));
            if (!match) return { empty: true, docs: [] };
            return {
              empty: false,
              docs: [
                {
                  id: match.id,
                  data: () => match
                }
              ]
            };
          }
        })
      })
    })
  }
}));

import { extractSubdomain, resolveTenantByHost, resolveTenantByEmailDomain } from '@/src/lib/tenant';

describe('tenant helpers', () => {
  it('detecta subdominio en entornos localhost', () => {
    expect(extractSubdomain('acme.localhost:3000')).toBe('acme');
    expect(extractSubdomain('localhost:3000')).toBeNull();
  });

  it('resuelve tenant por host', async () => {
    const { tenantId } = await resolveTenantByHost('acme.miapp.com');
    expect(tenantId).toBe('acme');
  });

  it('resuelve tenant por dominio de email', async () => {
    const { tenantId } = await resolveTenantByEmailDomain('user@globex.com');
    expect(tenantId).toBe('globex');
  });
});
