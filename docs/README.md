# Life Manager — Documentación

Aplicación tipo juego de vida: el usuario desbloquea **JOBS**, registra actividad por job y sincroniza datos desde **web** y **app móvil**, con login **Google**.

**Estado (2026-07-24):** login Google funcionando · web en Vercel · DB con profiles + jobs + citas PLAYER.

## Empieza aquí

1. **[Guía de estudio](./estudio/README.md)** — arquitectura, despliegue, datos, diseño (leer desde celular)
2. **[Historial del setup](./historial-setup.md)** — todo lo hecho, errores y cómo se arreglaron  
3. **[Deploy + Google](./deploy-vercel-google.md)** — URLs y OAuth local/prod  
4. **[Jobs](./jobs.md)** — TRAINEE / DRIVER / PLAYER  

## Índice

| Documento | Contenido |
|---|---|
| **[Estudio — índice](./estudio/README.md)** | **Arquitectura, código, deploy, datos, diseño** |
| [Estudio — arquitectura](./estudio/arquitectura.md) | Capas, flujos, Server vs Client |
| [Estudio — mapa código PLAYER](./estudio/mapa-codigo-player.md) | Archivo por archivo |
| [Estudio — despliegue](./estudio/despliegue.md) | Git, Vercel, Supabase |
| [Estudio — diccionario datos](./estudio/diccionario-datos.md) | Tablas y enums |
| [Estudio — manual diseño](./estudio/manual-diseno.md) | CSS, Tailwind, badges |
| [Historial del setup](./historial-setup.md) | Del cero al login OK (maestro) |
| [Arquitectura](./arquitectura.md) | Monorepo, clientes, backend, auth |
| [Jobs](./jobs.md) | TRAINEE / DRIVER / PLAYER + `user_jobs` |
| [Job PLAYER — Citas](./job-player-citas.md) | Citas, categorías, puntajes, comentarios |
| [Esquema de base de datos](./esquema-db.md) | Tablas, enums, relaciones |
| [Setup Supabase](./supabase-setup.md) | CLI, link, migraciones |
| [Auth Google](./auth-google.md) | Flujo web (+ móvil pendiente) |
| [Deploy Vercel + Google](./deploy-vercel-google.md) | OAuth, env vars, publish |

## Decisiones actuales

- **Monorepo**: `apps/web` (+ mobile luego) + `packages/shared`.
- **DB**: Supabase Postgres — proyecto `edbgqpebcfpytyqwaaqd`.
- **Auth**: Google OAuth (Supabase). Local OK.
- **Jobs**: `TRAINEE` (1), `DRIVER` (2), `PLAYER` (3) en `jobs` + `user_jobs`.
- **Web prod**: https://life-manager-tau.vercel.app  
- PLAYER: `codigo_identificador` = persona; comentarios por **cita**.

## URLs útiles

| Qué | URL |
|---|---|
| Web producción | https://life-manager-tau.vercel.app |
| Supabase dashboard | https://supabase.com/dashboard/project/edbgqpebcfpytyqwaaqd |
| GitHub | https://github.com/gggaaarl/life_manager |
