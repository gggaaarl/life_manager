# Diccionario de datos — Life Manager

Referencia de tablas, columnas y enums usados hoy (post-migración 2026-08-04).

---

## Diagrama de relaciones

```text
auth.users
    └── profiles (1:1)
            ├── user_jobs ──► jobs
            ├── player_citas (1:N)
            │       └── player_citas_comentarios (1:N)
            └── (futuro: más jobs)
```

---

## `profiles`

Perfil de app. Se crea automáticamente al registrarse con Google.

| Columna | Tipo | Descripción |
|---|---|---|
| `id` | uuid PK | = `auth.users.id` |
| `email` | text | Email de Google |
| `display_name` | text | Nombre visible |
| `avatar_url` | text | Foto |
| `role` | enum `profile_role` | `admin` \| `user` (default `user`) |
| `experimental_profiles` | text[] | Ej: `{player}` — acceso a features experimentales |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

---

## `player_citas`

Un registro = una cita / encuentro.

| Columna | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | uuid PK | auto | |
| `user_id` | uuid FK → profiles | sí | Dueño del registro |
| `fecha` | timestamptz | sí | Fecha de la cita |
| `lugar` | text | sí | Ej: `bote` |
| `codigo_identificador` | text | sí | Slug interno de la persona (reutilizable entre citas) |
| `persona` | text | sí | Nombre / sobrenombre mostrado |
| `caracteristica` | text | no | Descripción física o notas |
| `color` | enum | sí | Ver catálogo abajo |
| `talla` | enum | sí | |
| `figura` | enum | sí | |
| `puntaje_tightening` | smallint 1–100 | sí | Score 1 |
| `puntaje_bottom` | smallint 1–100 | sí | Score 2 |
| `puntaje_top` | smallint 1–100 | sí | Score 3 |
| `puntaje_belleza` | smallint 1–100 | sí | Score 4 |
| `puntaje_paciencia` | smallint 1–100 | sí | Score 5 |
| `puntaje_promedio` | numeric(5,2) | auto | Promedio de los 5 (trigger) |
| `created_at` | timestamptz | auto | |
| `updated_at` | timestamptz | auto | |

### Enum `player_color` → columna `color`

| Valor DB | Label UI |
|---|---|
| `blanca` | Blanca |
| `canela` | Canela |
| `negra` | Negra |

### Enum `player_talla` → columna `talla`

| Valor DB | Label UI |
|---|---|
| `caballo` | Caballo |
| `mediana` | Mediana |
| `chata` | Chata |

### Enum `player_figura` → columna `figura`

| Valor DB | Label UI |
|---|---|
| `bbw` | BBW |
| `chubby` | Chubby |
| `vedette` | Vedette |
| `fitness` | Fitness |
| `delgada` | Delgada |

---

## `player_citas_comentarios`

N comentarios por cita.

| Columna | Tipo | Requerido | Descripción |
|---|---|---|---|
| `id` | uuid PK | auto | |
| `user_id` | uuid FK | sí | Dueño |
| `cita_id` | uuid FK → player_citas | sí | Cita padre (ON DELETE CASCADE) |
| `codigo_identificador` | text | sí | Copia del slug persona (denormalizado) |
| `fecha` | timestamptz | sí | Cuándo se escribió |
| `contenido` | text | sí | Texto **sin** comillas ni paréntesis |
| `tipo` | enum | sí | `dicho` \| `pensamiento` |
| `orden` | int | no | Orden de visualización |
| `created_at` | timestamptz | auto | |
| `updated_at` | timestamptz | auto | |

### Enum `player_comentario_tipo` → columna `tipo`

| Valor DB | Badge UI | Significado |
|---|---|---|
| `dicho` | **Dicho** (teal) | Algo que dicen / tercera persona |
| `pensamiento` | **Personal** (forest) | Lo que tú piensas internamente |

> En Excel usabas `"..."` y `(...)`. En la app el tipo vive en `tipo` y la UI muestra un **badge**, no decoración en el texto.

---

## `jobs` y `user_jobs`

| Tabla | Propósito |
|---|---|
| `jobs` | Catálogo: TRAINEE, DRIVER, PLAYER |
| `user_jobs` | Qué jobs tiene cada usuario y status (`locked`, `unlocked`, `active`) |

---

## Seguridad (RLS + GRANT)

- **RLS**: `user_id = auth.uid()` en citas y comentarios
- **GRANT**: rol `authenticated` puede SELECT/INSERT/UPDATE/DELETE en tablas de usuario

---

## Dato inaugural (seed)

| Campo | Valor |
|---|---|
| user_id | `f4689015-61af-4e89-81c3-00b00be1b1cb` |
| fecha | 2025-12-31 |
| persona | Gladys de al fondo sitio joven |
| caracteristica | charapa pomulos pronunciados tetonas cuerpo fit |
| color | canela |
| talla | caballo |
| figura | vedette |
| lugar | bote |
| puntajes | 90 × 5 → promedio 90 |
| comentario 1 | tipo `dicho`: se ve que me va a lastimar |
| comentario 2 | tipo `pensamiento`: que tal cocomordan en misionero |

---

## Consultas útiles (SQL Editor)

```sql
-- Mis citas
select * from player_citas
where user_id = 'f4689015-61af-4e89-81c3-00b00be1b1cb'
order by fecha desc;

-- Comentarios de una cita
select * from player_citas_comentarios
where cita_id = 'UUID_DE_LA_CITA'
order by orden;
```
