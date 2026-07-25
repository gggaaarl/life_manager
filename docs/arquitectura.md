# Arquitectura

## Visión

Life Manager es un producto multiplataforma donde el progreso del usuario se organiza en **JOBS** desbloqueables. Cada job tiene sus propios formularios, historial y reglas. Los datos se cargan igual desde web o app.

## Monorepo (objetivo)

```text
life_manager/
  apps/
    web/                 # Next.js (o similar)
    mobile/              # Expo / React Native
  packages/
    shared/              # tipos, enums, validaciones Zod, constantes de jobs
  docs/                  # documentación de dominio y esquema
  supabase/              # migraciones SQL, policies (cuando se implemente)
```

## Capas

```text
┌─────────────┐   ┌─────────────┐
│  Web app    │   │  Mobile app │
└──────┬──────┘   └──────┬──────┘
       │                 │
       └────────┬────────┘
                │  Supabase client (Auth + DB + Realtime)
                ▼
        ┌───────────────┐
        │   Supabase    │
        │  Auth Google  │
        │  Postgres     │
        └───────────────┘
```

## Principios

1. **Una API / una DB** para web y móvil.
2. **Tipos compartidos** en `packages/shared` (jobs, enums de PLAYER, DTOs).
3. **RLS (Row Level Security)**: cada usuario solo ve/edita sus filas.
4. **Jobs como módulos**: tablas y pantallas por job; el catálogo de jobs es común.

## Módulos de producto (roadmap de dominio)

| Módulo | Estado |
|---|---|
| Auth (Google) web | ✅ Funcionando + documentado |
| Jobs TRAINEE / DRIVER / PLAYER | ✅ Tablas en DB + documentado |
| Job PLAYER (citas + comentarios) | ✅ Tablas + documentado; UI pendiente |
| Job DRIVER / TRAINEE (detalle) | Pendiente |
| Deploy Vercel | ✅ OK |
| App móvil | Pendiente |
| Agenda / nutrición / finanzas / etc. | Pendiente |

Historia completa: [historial-setup.md](./historial-setup.md).
