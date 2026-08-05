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

### 3.5 Migración 3 — presión
Archivo: `supabase/migrations/20260805150000_player_citas_presion.sql`

- Enum `player_presion` (`cocomordan`, `regular`)
- Columna `presion` en `player_citas`, default `regular`

### 3.6 Migración 4 — puntaje manual + belleza/top/bottom/paciencia
Archivo: `supabase/migrations/20260805160000_player_citas_puntaje_manual.sql`

- Se elimina el trigger que calculaba `puntaje_promedio` automático y las columnas de score individuales (`puntaje_tightening`, `puntaje_bottom`, `puntaje_top`, `puntaje_belleza`, `puntaje_paciencia`, `puntaje_promedio`).
- `belleza`, `top`, `bottom` dejan de ser scores 1–100 y pasan a ser catálogos fijos:
  - `belleza`: `regular` / `modelo`
  - `top`: `regular` / `mega`
  - `bottom`: `regular` / `mega`
  - default `regular` en los tres
- `paciencia_minutos` (smallint, minutos, default 0) reemplaza el score de paciencia.
- `puntaje` (smallint 1–100) es ahora el único puntaje, asignado a mano por el usuario en el formulario — no se recalcula.

## 4. Web (`apps/web`)

- Next.js 16 + Tailwind + Syne / DM Sans
- Login (layout tipo referencia MyFitnessPal, marca Life Manager)
- Rutas:
  - `/login` — formulario + Continuar con Google
  - `/auth/callback` — intercambia `code` por sesión
  - `/home` — post-login
  - `/` — si llega `?code=` lo reenvía a `/auth/callback`; si no, manda a login/home
  - `/player/citas` — historial de "Salidas" del job PLAYER
- Cliente Supabase: `@supabase/ssr` (browser + server + middleware)
- `AppHeader` (`src/components/layout/app-header.tsx`): header global con nav (Hub, Salidas) y "Cerrar sesión"; en desktop es una barra, en mobile es un menú hamburguesa de 3 líneas.
- Edición de "Salidas": ícono de lápiz por fila abre un modal (`EditCitaModal`) con todos los campos editables, incluyendo comentarios. Los cambios **no** se guardan solos — hay que dar clic en "Guardar cambios" / "Guardar salida".
- Comentarios: cada comentario tiene un botón de eliminar (ícono de basura) con confirmación (`¿Eliminar comentario?`) antes de quitarlo de la lista; el borrado real en base de datos ocurre al guardar el formulario.

### 4.1 No usamos ORM — tipos generados desde Supabase

No hay Prisma ni Drizzle. La app habla con Supabase vía `@supabase/supabase-js` (`@supabase/ssr`), que llama a la API REST que Supabase expone sobre Postgres (PostgREST). Los `.select("col1, col2")` son strings; si una columna no existe en la base, antes solo se veía en producción como error de Supabase en tiempo de ejecución.

Para evitar eso:

- `apps/web/src/lib/supabase/database.types.ts` — tipos generados con `npm run db:types` (`supabase gen types typescript --linked`). Se versiona en git y se regenera cada vez que cambia el esquema (después de cada `db:push`).
- `client.ts` y `server.ts` ahora usan `createBrowserClient<Database>` / `createServerClient<Database>`.
- Con esto, `npm run build:web` (TypeScript) marca error si el código pide una columna que no existe en la tabla — se confirmó forzando `puntaje_promedio` en el `.select()` de `/player/citas` y el build falló como se esperaba, antes de llegar a producción.

Flujo recomendado después de cualquier migración: `npm run db:push` → `npm run db:types` → `npm run build:web` para confirmar que el código sigue alineado con el esquema.

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
- [x] Header web (desktop + hamburguesa) con cerrar sesión  
- [x] PLAYER: vista Salidas + columna presión + edición con lápiz  
- [ ] UI hub de jobs más completa  
- [ ] CRUD PLAYER restante (filtros / detalle)  
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
