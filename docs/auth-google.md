# Autenticación con Google

## Objetivo

Los usuarios entran a la **web** o a la **app móvil** con la misma cuenta Google.  
Una identidad → mismos jobs, citas y datos en ambos clientes.

## Proveedor

- **Supabase Auth** + provider **Google OAuth**.
- Tras el login, Supabase emite sesión (JWT) usada por web y mobile.
- `auth.users.id` es el `user_id` de todas las tablas de negocio.

## Flujo

```text
Usuario
  │
  ├─ Web: botón "Continuar con Google"
  │       → OAuth redirect → callback Supabase → sesión
  │
  └─ Mobile: Google Sign-In / OAuth via Supabase
          → misma cuenta → misma sesión lógica
                │
                ▼
         profiles (upsert)
                │
                ▼
         user_jobs (seed inicial si es primer login)
```

## Primer login (reglas propuestas)

1. Crear/actualizar fila en `profiles` (`id`, `email`, `display_name`, `avatar_url`).
2. Asegurar filas en `user_jobs` para cada job del catálogo:
   - Por defecto: `PLAYER` → `unlocked` o `active` (definir al implementar).
   - `DRIVER` → `locked` hasta desbloqueo.
3. Redirigir al home de jobs.

## Datos que vienen de Google

| Campo Google | Destino |
|---|---|
| sub / user id (vía Supabase) | `profiles.id` |
| email | `profiles.email` |
| name | `profiles.display_name` |
| picture | `profiles.avatar_url` |

No se guarda contraseña propia: solo OAuth.

## Seguridad

- **RLS** en Postgres: `user_id = auth.uid()`.
- Nunca confiar en `user_id` enviado solo desde el cliente sin sesión.
- Secrets de Google OAuth solo en Supabase Dashboard / env de servidor, no en el bundle móvil expuesto de más (usar flujo recomendado por Supabase + Expo).
- Scopes mínimos: email + profile.

## Configuración (checklist de implementación)

### Google Cloud Console

1. Crear OAuth Client ID (Web).
2. Si mobile nativo: client IDs iOS/Android según Expo.
3. Authorized redirect URIs de Supabase.

### Supabase

1. Authentication → Providers → Google → enable.
2. Client ID + Client Secret.
3. Redirect URLs de web y deep links de la app.
4. Trigger `on auth.users insert` → crear `profiles` (+ seed `user_jobs`).

### Apps

- Web (`apps/web`): `@supabase/ssr` + `signInWithOAuth({ provider: 'google' })` → `/auth/callback`.
- Mobile: mismo proyecto Supabase; flujo OAuth / Google Sign-In compatible con Expo (pendiente).
- Checklist de deploy: [deploy-vercel-google.md](./deploy-vercel-google.md).

## Sesión compartida (concepto)

No es la misma cookie entre web y app, pero **sí la misma identidad** (`auth.users`).  
Los datos viven en Postgres y se ven en ambos lados al iniciar sesión con Google.
