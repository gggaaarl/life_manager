# Historial del setup — del cero al login funcionando

Documento maestro de lo hecho hasta ahora (2026-07-24).  
Estado final verificado: **login con Google OK** (local) + web en Vercel + DB con profiles y jobs.

---

## Resumen ejecutivo

| Área | Estado |
|---|---|
| Repo GitHub | ✅ [gggaaarl/life_manager](https://github.com/gggaaarl/life_manager) |
| Supabase proyecto | ✅ `edbgqpebcfpytyqwaaqd` Healthy |
| Tablas | ✅ `profiles`, `player_citas`, `player_citas_comentarios`, `jobs`, `user_jobs` |
| Auth Google | ✅ Local funcionando |
| Web Next.js | ✅ `apps/web` |
| Vercel | ✅ `https://life-manager-tau.vercel.app` (Framework Next.js) |
| App móvil | ⏳ Pendiente (Expo) |

---

## 1. Inicio del repo

1. Carpeta local `life_manager` creada y vinculada a GitHub.
2. `git init`, remote `origin`, rama `main`.
3. Primer push del código al repo (antes vacío).

## 2. Decisiones de arquitectura

| Decisión | Elección | Por qué |
|---|---|---|
| Estructura | Monorepo | Web + móvil + tipos/reglas compartidas |
| Backend / DB | **Supabase (Postgres)** | Catálogo alimentos, logs, reportes, costo predecible |
| Alternativa descartada | Convex | Peor para SQL/relacional y escala de logs |
| Auth | Google vía Supabase Auth | Misma identidad en web y (luego) app |
| ORM futuro | Drizzle (opcional) | Control de esquema desde Cursor/TS |

## 3. Supabase — base de datos

### 3.1 Proyecto
- Nombre: `life_manager`
- URL: `https://edbgqpebcfpytyqwaaqd.supabase.co`
- Password de DB: generada al crear el proyecto (guardar offline; no en git)

### 3.2 CLI
```powershell
npm install supabase --save-dev
npx supabase login
npx supabase link --project-ref edbgqpebcfpytyqwaaqd
npm run db:push
```

### 3.3 Migración 1 — profiles + PLAYER
Archivo: `supabase/migrations/20260724215308_init_profiles_player_citas.sql`

- `profiles` (1:1 con `auth.users`)
- `player_citas` + promedio automático
- `player_citas_comentarios` (N por cita, FK `cita_id`)
- Enums categoría color / contextura / talla
- RLS: cada usuario solo ve lo suyo
- Trigger: signup → insert en `profiles`

### 3.4 Migración 2 — JOBS
Archivo: `supabase/migrations/20260725000101_jobs_user_jobs_trainee_driver_player.sql`

- `jobs` (catálogo)
- `user_jobs` (N jobs por usuario) — **no** columna en `profiles`
- Seed:
  | # | code | status inicial al signup |
  |---|---|---|
  | 1 | `TRAINEE` | `active` |
  | 2 | `DRIVER` | `locked` |
  | 3 | `PLAYER` | `locked` |
- Trigger `handle_new_user` actualizado: crea `profiles` + 3 filas `user_jobs`

## 4. Web (`apps/web`)

- Next.js 16 + Tailwind + Syne / DM Sans
- Login (layout tipo referencia MyFitnessPal, marca Life Manager)
- Rutas:
  - `/login` — formulario + Continuar con Google
  - `/auth/callback` — intercambia `code` por sesión
  - `/home` — post-login
  - `/` — si llega `?code=` lo reenvía a `/auth/callback`; si no, manda a login/home
- Cliente Supabase: `@supabase/ssr` (browser + server + middleware)

## 5. Google OAuth (configuración final)

### Google Cloud — Cliente “Life Manager Web”
**Orígenes JS**
- `http://localhost:3000`
- `https://life-manager-tau.vercel.app`

**Redirect URI** (solo Supabase; no cambia con Vercel)
- `https://edbgqpebcfpytyqwaaqd.supabase.co/auth/v1/callback`

Consentimiento: **Usuarios externos** + emails en usuarios de prueba mientras esté en Testing.

### Supabase — Provider Google
- Enabled + Client ID + Client Secret

### Supabase — URL Configuration (estado configurado)
- Site URL: `http://localhost:3000` (dev; se puede cambiar a Vercel para prod-first)
- Redirect URLs:
  - `http://localhost:3000/auth/callback`
  - `https://life-manager-tau.vercel.app/auth/callback`

## 6. Vercel — deploy y errores resueltos

### Config correcta
- Proyecto: `life-manager` (único; el proyecto accidental `web` se eliminó)
- Root Directory: `apps/web`
- Framework Preset: **Next.js** (en Build and Deployment)
- Env vars:
  | Key | Value |
  |---|---|
  | `NEXT_PUBLIC_SUPABASE_URL` | `https://edbgqpebcfpytyqwaaqd.supabase.co` |
  | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `sb_publishable_...` |

### Errores y causas

| Error | Causa | Fix |
|---|---|---|
| Env var inválida al crear proyecto | URL puesta en el campo **Key** | Key = nombre; Value = valor |
| `404 NOT_FOUND` | Framework = **Other**, build 0 ms | Framework → **Next.js** + Redeploy |
| `500 MIDDLEWARE_INVOCATION_FAILED` | Faltaba `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Agregar anon key + Redeploy |
| Login → `/?code=...` + Runtime Error | Callback no usaba `/auth/callback` | Redirect URLs OK + `page.tsx` reenvía `code` |
| URL preview pide login Vercel | Deployment Protection | Usar `life-manager-tau.vercel.app` |

### URLs
- Producción: https://life-manager-tau.vercel.app  
- Preview git: https://life-manager-git-main-james-f8d4.vercel.app  

## 7. Flujo de auth (funcionando)

```text
Usuario → Continuar con Google
  → Google
  → Supabase /auth/v1/callback
  → App /auth/callback?code=...  (o /?code= → reenvío)
  → exchangeCodeForSession
  → /home
  → profiles (+ user_jobs si es usuario nuevo)
```

## 8. Lecciones aprendidas

1. Monorepo en Vercel: Root `apps/web` + Framework **Next.js**.
2. Env vars: Key = nombre, Value = contenido; hacen falta URL **y** ANON KEY.
3. Google Redirect URI = siempre Supabase; orígenes JS = localhost + Vercel.
4. Supabase Redirect URLs = callbacks de la app (`/auth/callback`).
5. Jobs = tabla `user_jobs`, no columna en `profiles`.
6. Cambios en Google/Supabase URL config **no** requieren redeploy; cambios de código sí (push).

## 9. Checklist actual

- [x] Repo + monorepo base  
- [x] Supabase link + migraciones profiles/citas  
- [x] Migración jobs (TRAINEE / DRIVER / PLAYER)  
- [x] Google OAuth local OK  
- [x] Orígenes JS + Redirects para Vercel  
- [x] Deploy Vercel Next.js OK  
- [x] Env vars Vercel completas  
- [x] Documentación de dominio / setup / historial  
- [ ] UI hub de jobs en `/home`  
- [ ] CRUD PLAYER (citas) en web  
- [ ] App móvil Expo  
- [ ] Nutrición / rutinas / rehab / psicología / finanzas  

## 10. Dónde está cada cosa en el repo

| Qué | Dónde |
|---|---|
| App web | `apps/web/` |
| Migraciones SQL | `supabase/migrations/` |
| Docs índice | `docs/README.md` |
| Este historial | `docs/historial-setup.md` |
| Jobs | `docs/jobs.md` |
| PLAYER citas | `docs/job-player-citas.md` |
| Esquema DB | `docs/esquema-db.md` |
| Auth Google | `docs/auth-google.md` |
| Deploy Vercel | `docs/deploy-vercel-google.md` |
| Env ejemplo | `.env.example`, `apps/web/.env.example` |
