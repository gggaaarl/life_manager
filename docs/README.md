# Life Manager — Documentación

Aplicación tipo juego de vida: el usuario desbloquea **JOBS**, registra actividad por job y sincroniza datos desde **web** y **app móvil**, con login **Google**.

## Índice

| Documento | Contenido |
|---|---|
| [Arquitectura](./arquitectura.md) | Monorepo, clientes, backend, auth |
| [Jobs](./jobs.md) | Sistema de jobs, desbloqueo, DRIVER / PLAYER |
| [Job PLAYER — Citas](./job-player-citas.md) | Modelo de citas, categorías, puntajes, comentarios |
| [Esquema de base de datos](./esquema-db.md) | Tablas, enums, relaciones (Postgres / Supabase) |
| [Setup Supabase](./supabase-setup.md) | CLI, link, migraciones, Google Auth |
| [Auth Google](./auth-google.md) | Flujo de autenticación web + móvil |
| [Deploy Vercel + Google](./deploy-vercel-google.md) | OAuth, env vars, publish web |

## Decisiones actuales

- **Monorepo**: web + mobile + packages compartidos.
- **Backend / DB**: Supabase (Postgres + Auth + Realtime).
- **Auth**: Google OAuth (Supabase Auth).
- **Jobs iniciales**: `DRIVER`, `PLAYER`.
- Un usuario puede tener **varios jobs** a la vez.
- En PLAYER, `codigo_identificador` identifica a la **persona**; cada **cita** es un evento distinto; los **comentarios** pertenecen a una cita concreta.
- Setup DB: ver [supabase-setup.md](./supabase-setup.md).
