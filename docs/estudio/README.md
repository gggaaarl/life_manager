# Life Manager — Guía de estudio

Documentación pensada para leer desde el celular en Cursor y entender el proyecto completo.

**Última actualización:** 2026-08-04

## Orden sugerido de lectura

1. [Arquitectura](./arquitectura.md) — qué es cada pieza y cómo se conectan
2. [Mapa del código PLAYER](./mapa-codigo-player.md) — archivos concretos y qué hace cada uno
3. [Despliegue](./despliegue.md) — local, Supabase, Vercel, git
4. [Diccionario de datos](./diccionario-datos.md) — tablas, columnas, enums
5. [Manual de diseño](./manual-diseno.md) — colores, tipografía, Tailwind, componentes visuales

## Stack en una frase

**Next.js 16 + React 19 + TypeScript + Tailwind 4** en el frontend; **Supabase** (Postgres + Auth Google) como backend; **Vercel** publica la web.

## URLs

| Qué | Dónde |
|---|---|
| Web producción | https://life-manager-tau.vercel.app |
| Supabase | https://supabase.com/dashboard/project/edbgqpebcfpytyqwaaqd |
| GitHub | https://github.com/gggaaarl/life_manager |

## Dos flujos que NO se mezclan

```text
CÓDIGO (UI)     git push → GitHub → Vercel rebuild → web nueva
BASE DE DATOS   npm run db:push → Supabase remoto (tablas, datos, permisos)
```

## Rutas de la web hoy

| Ruta | Archivo | Qué hace |
|---|---|---|
| `/login` | `apps/web/src/app/login/page.tsx` | Pantalla de login Google |
| `/home` | `apps/web/src/app/home/page.tsx` | Hub después de entrar |
| `/player/citas` | `apps/web/src/app/player/citas/page.tsx` | Tabla + formulario de citas |

## Docs técnicas previas (referencia)

- [../historial-setup.md](../historial-setup.md) — cronología del proyecto
- [../job-player-citas.md](../job-player-citas.md) — dominio PLAYER (parcialmente desactualizado en nombres de columnas)
- [../esquema-db.md](../esquema-db.md) — esquema SQL general
