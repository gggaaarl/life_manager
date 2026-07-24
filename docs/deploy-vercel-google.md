# Google Auth + Vercel (web)

La web vive en `apps/web` (Next.js). Auth = **Supabase + Google OAuth**. Deploy = **Vercel**.

## 1. Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **Credentials**
2. **Create Credentials** → **OAuth client ID** → tipo **Web application**
3. Nombre: `Life Manager Web`
4. **Authorized JavaScript origins**
   - `http://localhost:3000`
   - `https://TU-DOMINIO.vercel.app` (cuando exista)
5. **Authorized redirect URIs** (importante: el callback de Supabase, no el de Next):
   - `https://edbgqpebcfpytyqwaaqd.supabase.co/auth/v1/callback`
6. Copia **Client ID** y **Client Secret**

## 2. Supabase → activar Google

1. Dashboard → **Authentication** → **Providers** → **Google** → Enable
2. Pega Client ID + Client Secret
3. **Authentication** → **URL Configuration**
   - Site URL (dev): `http://localhost:3000`
   - Site URL (prod): `https://TU-DOMINIO.vercel.app`
   - Redirect URLs (agrega ambas):
     - `http://localhost:3000/auth/callback`
     - `https://TU-DOMINIO.vercel.app/auth/callback`

## 3. Probar en local

```powershell
cd apps/web
npm run dev
```

Abre `http://localhost:3000/login` → **Continuar con Google**.

Si falla redirect: revisa Site URL / Redirect URLs en Supabase y el Client OAuth en Google.

## 4. Publicar en Vercel

### Opción A — Dashboard

1. [vercel.com](https://vercel.com) → **Add New Project** → importa `gggaaarl/life_manager`
2. **Root Directory**: `apps/web`
3. Framework: Next.js (auto)
4. Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://edbgqpebcfpytyqwaaqd.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = tu publishable/anon key
5. Deploy
6. Copia la URL `*.vercel.app` y vuelve al paso 1–2 para añadirla en Google + Supabase

### Opción B — CLI

```powershell
npm i -g vercel
cd apps/web
vercel
```

Luego `vercel env add` para las dos variables `NEXT_PUBLIC_*`.

## 5. Flujo de auth (cómo queda)

```text
Login (web) → Google → Supabase callback
  → /auth/callback (Next intercambia code)
  → /home
  → trigger crea fila en profiles
```

## Checklist rápido

- [ ] OAuth Client Google creado
- [ ] Redirect URI de Supabase en Google
- [ ] Provider Google ON en Supabase
- [ ] Redirect URLs localhost + Vercel en Supabase
- [ ] Env vars en Vercel
- [ ] Root Directory = `apps/web`
- [ ] Login con Google funciona en local y en prod
