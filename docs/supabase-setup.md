# Configurar Supabase

## Ya está en el repo

- CLI local: `npx supabase` (devDependency)
- Migración inicial: `supabase/migrations/20260724215308_init_profiles_player_citas.sql`
  - `profiles` (usuarios)
  - `player_citas`
  - `player_citas_comentarios`
  - enums de categorías PLAYER
  - RLS (cada usuario solo ve lo suyo)
  - trigger: al crear usuario en Auth → fila en `profiles`
  - trigger: calcula `puntaje_promedio` al insertar/actualizar citas

## 1. Crear proyecto en Supabase

1. Entra a [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **New project** → nombre `life_manager` (o el que quieras)
3. Elige region cercana y guarda la DB password
4. Espera a que el proyecto quede **Healthy**

## 2. Login CLI y vincular

En la carpeta del repo (`life_manager`):

```powershell
npx supabase login
```

Se abre el navegador para autenticarte.

Luego vincula el proyecto (te pedirá el project ref del dashboard → Settings → General):

```powershell
npx supabase link --project-ref edbgqpebcfpytyqwaaqd
```

Project ref de este repo: `edbgqpebcfpytyqwaaqd`  
URL: `https://edbgqpebcfpytyqwaaqd.supabase.co`

## 3. Aplicar migraciones (crear tablas en la nube)

```powershell
npm run db:push
```

Equivale a `npx supabase db push`. Sube el SQL de `supabase/migrations/` a tu proyecto remoto.

Verifica en el Dashboard → **Table Editor**: deben aparecer `profiles`, `player_citas`, `player_citas_comentarios`.

## 4. Activar Google Auth

1. Dashboard → **Authentication** → **Providers** → **Google** → Enable
2. En [Google Cloud Console](https://console.cloud.google.com/) crea OAuth Client ID (Web)
3. Authorized redirect URI de Supabase (la muestra el propio panel de Google provider)
4. Pega Client ID y Client Secret en Supabase

## 5. Variables de entorno (apps)

Copia `.env.example` → `.env.local` y completa con:

- Dashboard → **Project Settings** → **API**
  - Project URL
  - `anon` `public` key

## Scripts npm

| Script | Acción |
|---|---|
| `npm run db:login` | Login CLI |
| `npm run db:link` | Ayuda: ver comando link |
| `npm run db:push` | Aplicar migraciones al remoto |
| `npm run db:pull` | Traer esquema remoto (si editas en dashboard) |
| `npm run db:types` | Generar tipos TypeScript |

## Desarrollo local (opcional)

Requiere [Docker Desktop](https://www.docker.com/products/docker-desktop/).

```powershell
npx supabase start
npx supabase db reset   # aplica migraciones en local
```

## Control desde Cursor

| Quieres… | Haces… |
|---|---|
| Nueva columna / tabla | Nuevo archivo en `supabase/migrations/` o `npx supabase migration new nombre` |
| Subir cambios | `npm run db:push` |
| Tipos TS actualizados | `npm run db:types` |
| Ver datos | Dashboard → Table Editor, o Studio local |

Más adelante se puede sumar **Drizzle** encima de este Postgres para definir esquema también en TypeScript.
