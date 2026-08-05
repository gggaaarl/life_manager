# Despliegue — local, Supabase y Vercel

## Resumen en 3 comandos (día a día)

```powershell
# 1. Desarrollo local
npm run dev:web

# 2. Cambios en base de datos (migraciones SQL)
npm run db:push

# 3. Publicar código web
git add .
git commit -m "descripción del cambio"
git push origin main
```

---

## 1. Entorno local

### Requisitos

- Node.js LTS (v24+)
- Cuenta Supabase linkeada (`npm run db:link` una vez)

### Variables de entorno

Copia y completa:

```powershell
copy .env.example apps\web\.env.local
```

| Variable | Dónde obtenerla |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Settings → API → anon public |

### Correr la web

```powershell
cd life_manager
npm install
npm run dev:web
```

Abre http://localhost:3000

### PowerShell + npm

Si `npm` falla por scripts deshabilitados:

```powershell
Set-ExecutionPolicy -Scope CurrentUser -ExecutionPolicy RemoteSigned
# o usa: npm.cmd run dev:web
```

---

## 2. Supabase (base de datos)

### Primera vez

```powershell
npm run db:login
npm run db:link      # project-ref: edbgqpebcfpytyqwaaqd
npm run db:push
```

### Cuándo usar `db:push`

- Nuevo archivo en `supabase/migrations/`
- Renombrar columnas, enums, seeds, GRANTs
- **No** sustituye a git push

### Migraciones aplicadas en este proyecto

| Archivo | Qué hace |
|---|---|
| `20260724215308_init_...` | profiles, player_citas, comentarios, RLS |
| `20260725000101_jobs_...` | jobs, user_jobs |
| `20260804193200_player_citas_rename_...` | persona, color, figura, roles, seed Gladys |
| `20260804202800_grant_...` | GRANT authenticated (fix permission denied) |

### Error común: `permission denied for table`

Las tablas creadas por SQL necesitan `GRANT` explícito. Solución: migración `20260804202800_grant_player_citas_api.sql`.

---

## 3. Vercel (producción)

### Cómo se publica

```text
git push origin main
  → GitHub recibe commit
  → Vercel webhook detecta push
  → Build: npm run build en apps/web
  → Deploy a life-manager-tau.vercel.app
```

### Configuración Vercel (ya hecha)

- **Root Directory**: `apps/web`
- **Framework**: Next.js
- **Env vars**: mismas `NEXT_PUBLIC_SUPABASE_*` que local

### Ver un deploy

1. https://vercel.com → proyecto life_manager
2. Deployments → último build
3. Si falla: ver log de "Running TypeScript" o build

### Google OAuth en producción

Redirect URLs en Supabase deben incluir:

- `https://life-manager-tau.vercel.app/auth/callback`

Orígenes JS en Google Cloud:

- `https://life-manager-tau.vercel.app`

---

## 4. Git — flujo recomendado

```powershell
git status          # qué cambió
git add .           # stage todo (revisa que no haya .env)
git commit -m "feat: descripción"
git push origin main
```

### Identidad git (primera vez)

```powershell
git config --global user.name "Tu Nombre"
git config --global user.email "tu@email.com"
```

---

## 5. Checklist después de cambiar PLAYER

- [ ] ¿Tocaste `.tsx` / `.ts`? → git push
- [ ] ¿Tocaste `supabase/migrations/`? → db:push
- [ ] ¿Nuevo enum/columna? → db:push + verificar Table Editor
- [ ] ¿Build local OK? → `cd apps/web && npm run build`
