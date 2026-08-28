# App móvil (Expo)

## Estado

- `apps/mobile` creada con Expo + TypeScript
- Login con Google vía Supabase (misma cuenta que la web)
- Comparte lógica de dominio con web en `packages/shared`

## Arranque local

1. Copia variables:
   ```bash
   cp apps/mobile/.env.example apps/mobile/.env
   ```
   Usa la misma `NEXT_PUBLIC_SUPABASE_URL` y anon key que en `.env.local` de la raíz, con prefijo `EXPO_PUBLIC_`.

2. Inicia la app:
   ```bash
   npm run dev:mobile
   ```
   Escanea el QR con Expo Go en Android, o usa `a` para emulador.

## Google OAuth en móvil

En Supabase → Authentication → URL Configuration, agrega a **Redirect URLs**:

```text
lifemanager://auth/callback
exp://127.0.0.1:8081/--/auth/callback
```

El scheme de la app es `lifemanager` (ver `app.json`).

## Build para distribuir sin Play Store

Usa [EAS Build](https://docs.expo.dev/build/introduction/) para generar un APK/AAB y compartirlo directamente:

```bash
cd apps/mobile
npx eas build --platform android --profile preview
```

Eso te permite monetizar con suscripción web (Stripe) mientras distribuyes el APK por tu cuenta.

## Qué va en `packages/shared` vs cada app

| Compartido (`packages/shared`) | Solo web | Solo mobile |
|---|---|---|
| Enums, labels, formatters | UI Next.js, middleware, server actions | UI React Native, navegación nativa |
| Reglas de acceso a jobs | Cookies SSR | AsyncStorage + deep links |
| Tipos de Supabase (`database.types.ts`) | Layout, tablas web | Pantallas nativas |

Cada cambio de **reglas de negocio** o **catálogos** va en `packages/shared` y aplica a web y app automáticamente.
