# Sistema de JOBS

## Concepto

Un **JOB** es un rol/modo del juego que el usuario desbloquea con el tiempo.  
Una persona puede tener **uno o más jobs** a la vez.

**No** se guarda como columna en `profiles`.  
Se usa tabla puente `user_jobs` (usuario ↔ job).

## Jobs declarados

| # | Código | Nombre | Notas |
|---|---|---|---|
| 1 | `TRAINEE` | Trainee | Job inicial. Al registrarse queda `active`. |
| 2 | `DRIVER` | Driver | Pendiente de especificar. Empieza `locked`. |
| 3 | `PLAYER` | Player | Citas + comentarios. Empieza `locked`. |

## Por qué no una columna en `profiles`

Una columna tipo `job` o `jobs[]` complica:

- varios jobs activos a la vez
- estado por job (`locked` / `unlocked` / `active`)
- fechas de desbloqueo
- historial futuro

Modelo correcto:

```text
profiles 1 ─── N user_jobs N ─── 1 jobs
```

## Estados

```text
locked ──(desbloqueo)──► unlocked ──(activar)──► active
                              │
                              └──(desactivar)──► unlocked
```

| Estado | Significado |
|---|---|
| `locked` | Aún no disponible |
| `unlocked` | Desbloqueado; puede activarse |
| `active` | En uso; UI y carga de datos |

Reglas:

- Un usuario puede tener **varios** jobs `active`.
- Desactivar no borra historial del job.

## Tablas

### `jobs` (catálogo global)

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `code` | text unique | `TRAINEE`, `DRIVER`, `PLAYER` |
| `name` | text | |
| `description` | text | |
| `sort_order` | int | 1, 2, 3… |
| `is_active` | boolean | job disponible en el producto |

### `user_jobs` (qué jobs tiene cada persona)

| Columna | Tipo | Notas |
|---|---|---|
| `id` | uuid | PK |
| `user_id` | uuid → profiles | |
| `job_id` | uuid → jobs | |
| `status` | job_status | locked / unlocked / active |
| `unlocked_at` | timestamptz | |
| `activated_at` | timestamptz | |

Constraint: `unique (user_id, job_id)`.

## Ejemplo

| Usuario | Job | Status |
|---|---|---|
| Ana | TRAINEE | `active` |
| Ana | DRIVER | `locked` |
| Ana | PLAYER | `active` |

Ana tiene 2 jobs a la vez (TRAINEE + PLAYER).

## Consulta útil

```sql
select j.code, j.name, uj.status
from public.user_jobs uj
join public.jobs j on j.id = uj.job_id
where uj.user_id = auth.uid()
order by j.sort_order;
```

## Seed al registrarse

Al crear usuario (trigger `handle_new_user`):

- fila en `profiles`
- 3 filas en `user_jobs`: TRAINEE=`active`, DRIVER=`locked`, PLAYER=`locked`
