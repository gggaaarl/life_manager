# Google Auth + Vercel (web)

La web vive en `apps/web` (Next.js). Auth = **Supabase + Google OAuth**. Deploy = **Vercel**.

## 1. Google Cloud Console

1. Ve a [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → **Credentials**
2. **Create Credentials** → **OAuth client ID** → tipo **Web application**
3. Nombre: `Life Manager Web`
4. **Authorized JavaScript origins** (puedes tener varios; local + Vercel):
   - `http://localhost:3000`
   - `https://life-manager-tau.vercel.app`
5. **Authorized redirect URIs** — **solo el de Supabase** (no cambia con Vercel):
   - `https://edbgqpebcfpytyqwaaqd.supabase.co/auth/v1/callback`
6. Copia **Client ID** y **Client Secret**

> Google no redirige a tu app Next: redirige a Supabase.  
> Tu app recibe el `code` en `/auth/callback` (local o Vercel).

## 2. Supabase → activar Google

1. Dashboard → **Authentication** → **Providers** → **Google** → Enable
2. Pega Client ID + Client Secret
3. **Authentication** → **URL Configuration**
   - **Site URL** (principal): `https://life-manager-tau.vercel.app` en prod  
     (en desarrollo diario puedes dejar `http://localhost:3000`)
   - **Redirect URLs** (lista — agrega todas las que uses):
     - `http://localhost:3000/auth/callback`
     - `https://life-manager-tau.vercel.app/auth/callback`
     - (opcional) `http://localhost:3000/**` si tu panel lo permite

> Si el `code` cae en `http://localhost:3000/?code=...` y no en `/auth/callback`,  
> falta esa Redirect URL en Supabase. La app también reenvía `/?code=` → `/auth/callback`.

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

- [x] OAuth Client Google creado
- [x] Redirect URI de Supabase en Google
- [x] Provider Google ON en Supabase
- [x] Redirect URLs localhost + Vercel en Supabase
- [x] Orígenes JS: localhost + `life-manager-tau.vercel.app`
- [x] Env vars en Vercel (URL + ANON KEY)
- [x] Root Directory = `apps/web` + Framework Next.js
- [x] Login con Google funciona en local
- [ ] Confirmar login Google también en URL de producción Vercel

Historia completa: [historial-setup.md](./historial-setup.md).
