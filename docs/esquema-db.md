# Esquema de base de datos (Postgres / Supabase)

## Diagrama (relaciones)

```text
auth.users
    │
    │ 1
    ▼
public.profiles ─────────────────────────────┐
    │                                        │
    │ 1                                      │
    ▼                                        │
public.user_jobs                             │
    │                                        │
    │ n                                      │
    ▼                                        │
public.jobs                                  │
                                             │
                     ┌───────────────────────┘
                     │ user_id
                     ▼
              public.player_citas
                     │
                     │ 1
                     ▼
         public.player_citas_comentarios
```

## Enums

```sql
-- Jobs
create type public.job_status as enum ('locked', 'unlocked', 'active');

-- PLAYER — categorías
create type public.player_categoria_color as enum (
  'blanca_palida',
  'blanca_perla',
  'chocolate_claro',
  'chocolate_oscuro',
  'marron'
);

create type public.player_categoria_contextura as enum (
  'bbw',
  'chubby',
  'vedette',
  'fit',
  'flaca'
);

create type public.player_categoria_talla as enum (
  'caballona',
  'mediana',
  'chata'
);
```

## Tablas

### `profiles`

Perfil de app ligado a Supabase Auth (`auth.users`).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | = `auth.users.id` |
| `email` | text | desde Google |
| `display_name` | text | nombre visible |
| `avatar_url` | text | foto Google |
| `created_at` | timestamptz | default `now()` |
| `updated_at` | timestamptz | |

### `jobs`

Catálogo global de jobs.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `code` | text UNIQUE | `DRIVER`, `PLAYER` |
| `name` | text | |
| `description` | text | |
| `sort_order` | int | orden en UI |
| `is_active` | boolean | job disponible en el producto |
| `created_at` | timestamptz | |

Seed inicial:

| code | name |
|---|---|
| `DRIVER` | Driver |
| `PLAYER` | Player |

### `user_jobs`

Jobs desbloqueados / activos por usuario.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | |
| `job_id` | uuid FK → jobs | |
| `status` | job_status | `locked` / `unlocked` / `active` |
| `unlocked_at` | timestamptz | null si locked |
| `activated_at` | timestamptz | null si no active |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

Constraints:

- `unique (user_id, job_id)`
- Index: `(user_id, status)`

### `player_citas`

Historial de citas del job PLAYER.

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | dueño del registro |
| `fecha` | timestamptz | fecha/hora de la cita |
| `lugar` | text | |
| `codigo_identificador` | text | persona lógica |
| `nombre` | text | |
| `descripcion` | text | nullable |
| `categoria_1` | player_categoria_color | |
| `categoria_2` | player_categoria_contextura | |
| `categoria_3` | player_categoria_talla | |
| `puntaje_tightening` | smallint | 1–100 |
| `puntaje_bottom` | smallint | 1–100 |
| `puntaje_top` | smallint | 1–100 |
| `puntaje_belleza` | smallint | 1–100 |
| `puntaje_paciencia` | smallint | 1–100 |
| `puntaje_promedio` | numeric(5,2) | calculado |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

Checks:

```sql
puntaje_tightening between 1 and 100
puntaje_bottom between 1 and 100
puntaje_top between 1 and 100
puntaje_belleza between 1 and 100
puntaje_paciencia between 1 and 100
```

Trigger sugerido (before insert/update):

```sql
NEW.puntaje_promedio := round((
  NEW.puntaje_tightening
  + NEW.puntaje_bottom
  + NEW.puntaje_top
  + NEW.puntaje_belleza
  + NEW.puntaje_paciencia
) / 5.0, 2);
```

Indexes sugeridos:

- `(user_id, fecha desc)`
- `(user_id, codigo_identificador)`
- `(user_id, puntaje_promedio desc)`

### `player_citas_comentarios`

Comentarios **por cita** (n por cita).

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → profiles | dueño (igual que la cita) |
| `cita_id` | uuid FK → player_citas ON DELETE CASCADE | enlace fuerte |
| `codigo_identificador` | text | denormalizado desde la cita |
| `fecha` | timestamptz | cuándo se escribió el comentario |
| `contenido` | text | |
| `orden` | int | opcional, default secuencial |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

Constraints / índices:

- Index `(cita_id, fecha)`
- Index `(user_id, codigo_identificador)`
- FK `cita_id` con `ON DELETE CASCADE` (borrar cita borra sus comentarios)

> **Nota de diseño:** el enlace canónico es `cita_id`.  
> `codigo_identificador` permite listar comentarios de una persona a través de varias citas.  
> La fecha de la cita se obtiene con join a `player_citas.fecha`.

## Row Level Security (resumen)

Todas las tablas de usuario:

```text
SELECT / INSERT / UPDATE / DELETE
  WHERE user_id = auth.uid()
```

- `jobs`: lectura pública autenticada (`select` para todos los logged-in).
- `profiles`: el usuario solo su fila (insert vía trigger al signup).

## SQL de referencia (borrador)

```sql
-- Perfiles
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.jobs (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  description text,
  sort_order int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table public.user_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  job_id uuid not null references public.jobs (id) on delete cascade,
  status public.job_status not null default 'locked',
  unlocked_at timestamptz,
  activated_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, job_id)
);

create table public.player_citas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  fecha timestamptz not null,
  lugar text not null,
  codigo_identificador text not null,
  nombre text not null,
  descripcion text,
  categoria_1 public.player_categoria_color not null,
  categoria_2 public.player_categoria_contextura not null,
  categoria_3 public.player_categoria_talla not null,
  puntaje_tightening smallint not null check (puntaje_tightening between 1 and 100),
  puntaje_bottom smallint not null check (puntaje_bottom between 1 and 100),
  puntaje_top smallint not null check (puntaje_top between 1 and 100),
  puntaje_belleza smallint not null check (puntaje_belleza between 1 and 100),
  puntaje_paciencia smallint not null check (puntaje_paciencia between 1 and 100),
  puntaje_promedio numeric(5,2) not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.player_citas_comentarios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  cita_id uuid not null references public.player_citas (id) on delete cascade,
  codigo_identificador text not null,
  fecha timestamptz not null default now(),
  contenido text not null check (char_length(trim(contenido)) > 0),
  orden int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
```

## Consultas útiles

### Citas de un usuario ordenadas

```sql
select *
from public.player_citas
where user_id = auth.uid()
order by fecha desc;
```

### Comentarios de una cita

```sql
select *
from public.player_citas_comentarios
where cita_id = :cita_id
  and user_id = auth.uid()
order by fecha asc, orden asc nulls last;
```

### Historial de una persona (varias citas)

```sql
select c.*,
       coalesce(
         json_agg(
           json_build_object(
             'id', cm.id,
             'fecha', cm.fecha,
             'contenido', cm.contenido
           )
           order by cm.fecha
         ) filter (where cm.id is not null),
         '[]'
       ) as comentarios
from public.player_citas c
left join public.player_citas_comentarios cm
  on cm.cita_id = c.id
where c.user_id = auth.uid()
  and c.codigo_identificador = :codigo
group by c.id
order by c.fecha desc;
```

## Jobs (aplicado)

Ver migración `20260725000101_jobs_user_jobs_trainee_driver_player.sql` y [jobs.md](./jobs.md).

- `jobs` + `user_jobs` en producción
- Códigos: `TRAINEE`, `DRIVER`, `PLAYER`

## Pendiente (dominio)

- Detalle funcional del job `DRIVER` / `TRAINEE`
- Agenda, gastos diarios, ingresos, cadena de suministro / nutrición
