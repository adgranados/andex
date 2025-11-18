'use client';

import { useState } from 'react';
import { auth, googleProvider } from '@/src/client/firebaseClient';
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User
} from 'firebase/auth';
import { getCookie } from '@/src/lib/cookies';

async function ensureClaims(user: User) {
  const cookieTenantId = getCookie('tenantId');
  const payload = {
    uid: user.uid,
    email: user.email,
    cookieTenantId
  };
  const response = await fetch('/api/auth/ensure-claims', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    let data: any = null;
    let rawText: string | null = null;
    const contentType = response.headers.get('content-type') || '';

    if (contentType.includes('application/json')) {
      data = await response.json();
    } else {
      // Si no es JSON, lo leemos como texto por si queremos loguearlo
      rawText = await response.text();
    }
    const backendMessage =
      data?.message ||
      rawText ||
      `HTTP ${response.status} ${response.statusText}(${ rawText })`;

    throw new Error('No se pudo asignar el tenant. ' + backendMessage);   
  }

  const data = await response.json();
  await user.getIdToken(true);
  const destinationTenant = data.tenantId || cookieTenantId;
  if (!destinationTenant) {
    throw new Error('Tenant no resuelto');
  }
  window.location.href = `/t/${destinationTenant}/dashboard`;
}

export function LoginCard({ tenantName, tenantLogo }: { tenantName?: string; tenantLogo?: string }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (action: () => Promise<{ user: User }>) => {
    setLoading(true);
    setError(null);
    try {
      const { user } = await action();
      await ensureClaims(user);
    } catch (err) {
      console.error('login error', err);
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full max-w-md rounded-3xl glass-panel backdrop-blur-xl p-8 shadow-2xl">
      <header className="mb-8 text-center space-y-3">
        {tenantLogo ? (
          <img src={tenantLogo} alt={tenantName} className="mx-auto h-12 w-12 rounded-full object-contain border border-white/20" />
        ) : (
          <div className="mx-auto h-12 w-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl">
            {tenantName?.[0] ?? 'T'}
          </div>
        )}
        <div>
          <p className="text-sm text-white/60">{tenantName ? `Bienvenido a ${tenantName}` : 'Bienvenido a la plataforma'}</p>
          <h1 className="text-3xl font-semibold tracking-tight">Inicia sesión</h1>
        </div>
      </header>

      <div className="space-y-4">
        <button
          type="button"
          onClick={() => handleAuth(() => signInWithPopup(auth, googleProvider))}
          disabled={loading}
          className="w-full rounded-2xl border border-white/15 py-3 font-medium transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Continuar con Google
        </button>

        <div className="space-y-3" aria-live="polite">
          <div className="space-y-1">
            <label htmlFor="email" className="text-sm text-white/70">
              Email corporativo
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
            />
          </div>
          <div className="space-y-1">
            <label htmlFor="password" className="text-sm text-white/70">
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/40 focus:border-white/40 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={() => handleAuth(() => signInWithEmailAndPassword(auth, email, password))}
            disabled={loading}
            className="w-full rounded-2xl bg-white py-3 font-semibold text-black transition hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Entrar
          </button>
          <button
            type="button"
            onClick={() => handleAuth(() => createUserWithEmailAndPassword(auth, email, password))}
            disabled={loading}
            className="w-full rounded-2xl border border-white/15 py-3 font-medium text-white/90 transition hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Crear cuenta
          </button>
        </div>
        {error ? <p className="text-sm text-rose-400" role="alert">{error}</p> : null}
      </div>

      <footer className="mt-8 text-center text-xs text-white/50">© {new Date().getFullYear()} Multi-tenant SaaS</footer>

      {loading && (
        <div className="absolute inset-0 rounded-3xl bg-black/40 backdrop-blur-sm flex items-center justify-center text-sm">
          Procesando...
        </div>
      )}
    </div>
  );
}
