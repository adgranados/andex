# Multi-tenant Next.js + Firebase Starter

Next.js 14 (App Router) + Tailwind + Firebase Authentication/Firestore starter that implements multi-tenancy resolved via subdominio o dominio de email.

## Características
- Resolución automática de tenant por subdominio (`acme.miapp.com`) o dominio de email (`@acme.com`).
- Login elegante con glassmorphism, Google Sign-In y email/password.
- Persistencia de `tenantId` en `users/{uid}` y custom claims para aislar datos en Firestore.
- Middleware que detecta el tenant desde el host y lo expone mediante cookie segura.
- Dashboard server-side (`/t/[tenantId]/dashboard`) que consulta datos filtrados por `tenantId`.
- Helpers compartidos (`src/lib/tenant.ts`) con pruebas básicas en Vitest.
- Firebase Admin/Client inicializados por separado.

## Requisitos previos
- Node.js 18+
- Proyecto de Firebase con Authentication y Firestore habilitados.

## Instalación
```bash
npm install
```

## Variables de entorno
Crea `.env.local` (puedes partir de `.env.local.example`) con:
```
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=...
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account", ...}
```
> La variable `FIREBASE_SERVICE_ACCOUNT_JSON` debe contener el JSON del service account (una sola línea, puedes usar `cat key.json | tr -d '\n'`).

## Scripts
- `npm run dev` – inicia Next.js en modo desarrollo.
- `npm run build` / `npm run start` – build y servidor productivo.
- `npm run test` – ejecuta las pruebas de `src/lib/tenant.ts` con Vitest.

## Firebase
1. Ejecuta `firebase login` y `firebase init firestore` si no lo hiciste antes.
2. Copia `firestore.rules` al proyecto de Firebase (`firebase deploy --only firestore:rules`).
3. Habilita Authentication con Email/Password y Google.

### Colecciones
`tenants` documentos con:
```json
{
  "name": "Acme",
  "logoUrl": "https://...",
  "primaryColor": "#7c3aed",
  "subdomains": ["acme"],
  "emailDomains": ["acme.com"]
}
```

`users/{uid}` incluye `tenantId` tras el login.

`tCollections/{tenantId}/widgets/*` es un ejemplo de datos aislados que se renderizan en el dashboard.

### Siembra rápida de tenants
Crea `scripts/seedTenants.ts` (o usa Firebase console) con objetos tipo:
```json
acme: {
  "name": "Acme",
  "logoUrl": "https://dummyimage.com/96x96/7c3aed/ffffff&text=A",
  "primaryColor": "#7c3aed",
  "subdomains": ["acme"],
  "emailDomains": ["acme.com"]
}
```
```json
globex: {
  "name": "Globex",
  "logoUrl": "https://dummyimage.com/96x96/0ea5e9/ffffff&text=G",
  "primaryColor": "#0ea5e9",
  "subdomains": ["globex"],
  "emailDomains": ["globex.com"]
}
```

## Flujo de autenticación
1. `middleware.ts` lee `host`, resuelve el tenant por subdominio y guarda `tenantId` en cookie segura.
2. `/login` detecta el tenant (cookie o host) y muestra branding dinámico.
3. Tras login (Google/email), el cliente llama a `/api/auth/ensure-claims`.
4. Este endpoint persiste `tenantId` en `users/{uid}`, asigna custom claims y revoca tokens para forzar refresh.
5. El usuario es redirigido a `/t/<tenantId>/dashboard`. Las reglas de Firestore sólo permiten datos con el mismo claim.

## Aceptación
- `https://acme.localhost:3000/login` → redirige a `/t/acme/dashboard` tras login.
- `http://localhost:3000/login` + `juan@globex.com` → detecta `globex` por dominio.
- Reglas de Firestore del archivo `firestore.rules` bloquean accesos cruzados.

## Notas de DX
- `src/client/firebaseClient.ts` y `src/server/firebaseAdmin.ts` aíslan dependencias.
- Helpers en `src/lib/tenant.ts` cubren subdominios y dominios; las pruebas (`__tests__/tenant.test.ts`) validan los casos principales.
- `TenantBranding` sincroniza los colores del tenant con CSS variables consumidas por Tailwind.

Listo para personalizar rutas adicionales (`/api/*`, server actions, dashboards) manteniendo el aislamiento multi-tenant.
