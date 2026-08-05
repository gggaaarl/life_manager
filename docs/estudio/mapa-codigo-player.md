# Mapa del código — módulo PLAYER / citas

Guía archivo por archivo de lo que tocamos. Abre estos paths en Cursor desde el celular.

## Árbol relevante

```text
apps/web/src/
├── app/
│   ├── home/page.tsx              ← Hub post-login, botón "Abrir citas"
│   ├── login/page.tsx             ← Pantalla login
│   └── player/citas/
│       ├── page.tsx               ← Página principal citas (SERVER)
│       └── actions.ts             ← createCita() al guardar (SERVER)
├── components/
│   ├── auth/
│   │   ├── session-info.tsx       ← Tarjeta "Tu sesión" (email, rol)
│   │   ├── login-form.tsx
│   │   └── sign-out-button.tsx
│   ├── debug/
│   │   └── console-log.tsx        ← Logs en F12 del navegador
│   └── player/
│       ├── citas-table.tsx        ← Tabla de citas
│       ├── cita-form.tsx          ← Formulario agregar (CLIENT)
│       └── comentario-tipo-badge.tsx  ← Badges Dicho / Personal
├── lib/
│   ├── player/
│   │   ├── access.ts              ← Quién puede ver PLAYER
│   │   ├── constants.ts           ← Enums y etiquetas UI
│   │   └── format.ts              ← slugify, formato fecha
│   └── supabase/
│       ├── client.ts              ← Supabase en navegador
│       ├── server.ts              ← Supabase en servidor
│       └── middleware.ts
├── app/globals.css                ← Tokens de color y fuentes
└── middleware.ts                  ← Protege rutas, refresca sesión

supabase/migrations/
├── 20260724215308_init_...sql     ← Tablas iniciales
├── 20260804193200_player_citas_rename_roles_seed.sql
└── 20260804202800_grant_player_citas_api.sql  ← Fix permission denied
```

## Cambios que pediste — dónde están

| Qué quitar / cambiar | Archivo | Línea aprox. |
|---|---|---|
| Texto "Tabla suave para ver..." | `app/player/citas/page.tsx` | header — **eliminado** |
| "Código de usuario" en pantalla | `components/auth/session-info.tsx` | **eliminado** (UUID solo en consola debug) |
| Comillas `' "` `()` en tabla | `lib/player/format.ts` + `citas-table.tsx` | texto plano + badges |
| Badge "Personal" no visible | `comentario-tipo-badge.tsx` | badge para **ambos** tipos |

## Rol de cada archivo clave

### `page.tsx` (Server Component)

- Obtiene usuario con `supabase.auth.getUser()`
- Verifica acceso con `canAccessPlayerMenu()`
- Hace 2 queries: citas + comentarios
- Pasa datos a `<CitasTable citas={...} />` y `<CitaForm />`

### `actions.ts` (Server Action)

- `"use server"` = corre solo en servidor
- `createCita(formData)` parsea el formulario e inserta en Supabase
- `revalidatePath("/player/citas")` refresca la lista

### `cita-form.tsx` (Client Component)

- `"use client"` = puede usar `useState`, clicks
- Estado local: lista de comentarios antes de guardar
- `ComentarioTipoPicker`: elige **Dicho** o **Personal**

### `citas-table.tsx`

- Recibe `citas: CitaRow[]` como prop (datos del padre)
- `ComentarioTipoBadge` antes de cada texto de comentario
- `Tag` para color, talla, figura

### `constants.ts`

- Fuente de verdad de opciones de select y labels
- `pensamiento` en DB → label UI **"Personal"**

## Consola del navegador vs servidor

| Log | Dónde aparece |
|---|---|
| `SessionDebugLog`, `CitasDebugLog` | F12 → Console (navegador) |
| `console.log` en `page.tsx` | Terminal `npm run dev` (solo development) |

## Cómo seguir el flujo al agregar una cita

1. Usuario llena `CitaForm` → submit
2. `handleSubmit` arma `FormData` con comentarios
3. `createCita(formData)` en `actions.ts`
4. INSERT `player_citas` + INSERT comentarios
5. Next revalida `/player/citas`
6. `page.tsx` vuelve a leer DB → tabla actualizada
