# Sistema de JOBS

## Concepto

Un **JOB** es un rol/modo del juego que el usuario desbloquea con el tiempo.  
Una persona puede tener **uno o más jobs activos** a la vez.

Los jobs definen:

- qué pantallas ve el usuario
- qué tablas puede llenar
- qué progreso / métricas se muestran

## Jobs iniciales

| Código | Nombre | Descripción breve |
|---|---|---|
| `DRIVER` | Driver | Pendiente de especificar (logística / movilidad / rutas). |
| `PLAYER` | Player | Historial de citas con categorías, puntajes y comentarios. |

Nuevos jobs se agregan al catálogo (`jobs`) sin romper los existentes.

## Ciclo de vida de un job para un usuario

```text
locked ──(desbloqueo)──► unlocked ──(activar)──► active
                              │
                              └──(desactivar)──► unlocked
```

| Estado | Significado |
|---|---|
| `locked` | Aún no disponible para el usuario. |
| `unlocked` | Desbloqueado; puede activarse. |
| `active` | En uso; aparece en la UI y permite cargar datos. |

Reglas:

- Un usuario puede tener **varios** jobs en `active`.
- El desbloqueo puede ser manual (admin/reglas del juego), por nivel, o por evento. La regla concreta de desbloqueo se documentará por job cuando se defina.
- Tener un job `active` no borra el historial si luego se desactiva.

## Modelo lógico

```text
jobs (catálogo global)
  id, code, name, description, sort_order, is_active

user_jobs (relación usuario ↔ job)
  id, user_id, job_id, status, unlocked_at, activated_at
```

Unicidad: `(user_id, job_id)` — un usuario no puede tener el mismo job duplicado.

## Ejemplo

Usuario Ana:

| Job | Status |
|---|---|
| PLAYER | `active` |
| DRIVER | `locked` |

Ana solo ve y llena datos de PLAYER hasta desbloquear DRIVER.

## Extensión futura

Cuando existan más jobs (agenda, gastos, etc.), pueden:

- ser jobs nuevos (`ACCOUNTANT`, `SCHEDULER`, …), o
- módulos transversales independientes del sistema de jobs.

Por ahora, **DRIVER** y **PLAYER** son los únicos jobs declarados.
