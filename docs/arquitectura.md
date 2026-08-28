# Arquitectura

## Visión

Life Manager es un producto multiplataforma donde el progreso del usuario se organiza en **JOBS** desbloqueables. Cada job tiene sus propios formularios, historial y reglas. Los datos se cargan igual desde web o app.

## Monorepo (actual)

```text
life_manager/
  apps/
    web/                 # Next.js — deploy en Vercel
    mobile/              # Expo — builds con EAS (APK/AAB)
  packages/
    shared/              # enums, formatters, reglas de acceso, tipos DB
  docs/
  supabase/              # migraciones SQL, RLS
  scripts/               # import Excel, gen tipos
```

## Capas

```text
┌─────────────┐   ┌─────────────┐
│  Web app    │   │  Mobile app │
└──────┬──────┘   └──────┬──────┘
       │                 │
       └────────┬────────┘
                │  packages/shared (reglas + tipos)
                │  Supabase client (Auth + DB)
                ▼
        ┌───────────────┐
        │   Supabase    │
        │  Auth Google  │
        │  Postgres     │
        └───────────────┘
```

## ¿Estás amarrado a Vercel, Expo o Supabase?

| Servicio | Rol | ¿Amarrado? |
|---|---|---|
| **Supabase** | Backend único: auth, Postgres, RLS | Sí, por diseño. Web y app leen/escriben aquí. Cambiar implica migrar datos. |
| **Vercel** | Solo hospeda `apps/web` | No exclusivo. Podrías mover la web a otro host; la app no depende de Vercel. |
| **Expo / EAS** | Solo builds de `apps/mobile` | No exclusivo aún. Podrías usar React Native CLI, pero Expo acelera APK y updates OTA. |

No estás encerrado en un solo proveedor de frontend: **un backend (Supabase), dos frontends (web + mobile)**.

## Regla para que un cambio funcione en web y app

| Tipo de cambio | Dónde va |
|---|---|
| Nuevo enum, label, validación, regla de acceso | `packages/shared` |
| Nueva tabla o columna | `supabase/migrations/` + `npm run db:types` |
| Pantalla / formulario | Duplicar UI: `apps/web` y `apps/mobile` (misma lógica, distinto componente) |
| Auth callback | Web: `/auth/callback`. Mobile: `lifemanager://auth/callback` |

## Supabase vs Convex para este producto

Supabase (Postgres) sigue siendo la opción correcta para lo que describes:

| Módulo | Por qué Postgres |
|---|---|
| Horarios / agenda | Consultas por rango de fechas, conflictos, calendarios |
| Logística de dieta + catálogo de alimentos | Relacional masivo, joins, índices |
| Rutinas (ejercicios → sets → peso/reps) | Modelo anidado tabular, agregaciones SQL |
| Gastos / presupuestos / ingresos multi-trabajo | SUM, GROUP BY, reportes por periodo |
| Psicología / notas | Texto + metadatos estructurados |
| Anti-doomscrolling | Eventos de uso + reglas por usuario |

Convex encaja mejor en apps con estado en tiempo real muy simple. Tu producto es **muchas entidades relacionadas + reportes + escala a 10k–100k usuarios** → Postgres gana.

## Módulos de producto (roadmap)

| Módulo | Estado |
|---|---|
| Auth Google web | ✅ |
| Auth Google mobile | ✅ base (falta probar redirect en dispositivo) |
| Jobs TRAINEE / DRIVER / PLAYER | ✅ DB |
| Job PLAYER — Salidas | ✅ Web; mobile pendiente UI |
| Horarios / agenda | Pendiente |
| Dieta + cadena de suministro | Pendiente |
| Rutinas + sets | Pendiente |
| Gastos / presupuestos | Pendiente |
| Ingresos multi-trabajo | Pendiente |
| Psicología / doomscrolling | Pendiente |
| Monetización (Stripe + APK) | Pendiente |

App móvil: [mobile-setup.md](./mobile-setup.md)  
Historia: [historial-setup.md](./historial-setup.md)
