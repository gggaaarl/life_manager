# Manual de diseño — Life Manager Web

Guía visual del sistema de diseño actual. Pensado para entender **qué clase hace qué** y **de dónde salen los colores**.

---

## 1. Filosofía visual

- **Suave y cosmopolita**: fondo arena, tarjetas blancas, bordes ligeros, mucho aire.
- **Tipografía con personalidad**: Syne para títulos, DM Sans para cuerpo.
- **Acento teal**: acciones primarias y scores.
- **Forest (verde oscuro)**: tipo Personal / pensamiento interno.

---

## 2. Tokens de color

Definidos en `apps/web/src/app/globals.css`:

| Token CSS | Hex | Uso |
|---|---|---|
| `--lm-ink` | `#0b1f1c` | Texto principal |
| `--lm-forest` | `#0f3d36` | Badge Personal, botones pensamiento |
| `--lm-teal` | `#1f8a7a` | Marca, links, badge Dicho, promedio |
| `--lm-mint` | `#7ddecb` | Acentos login (gradiente) |
| `--lm-sand` | `#f3f0e8` | Fondo de página |
| `--lm-panel` | `#ffffff` | Tarjetas |
| `--lm-muted` | `#5c6b67` | Texto secundario |
| `--lm-line` | `#e4e8e6` | Bordes, líneas tabla |
| `--lm-danger` | `#b42318` | Errores |

### Uso en Tailwind

En `@theme inline` se mapean a clases:

```css
--color-ink: var(--lm-ink);
--color-teal: var(--lm-teal);
--color-sand: var(--lm-sand);
--color-muted: var(--lm-muted);
--color-line: var(--lm-line);
```

En JSX: `text-ink`, `bg-sand`, `border-line`, `text-teal`, `text-muted`.

---

## 3. Tipografía

Cargada en `apps/web/src/app/layout.tsx`:

| Variable | Fuente | Peso | Uso |
|---|---|---|---|
| `--font-syne` | Syne | 600–800 | Títulos, logo, scores |
| `--font-dm-sans` | DM Sans | 400–700 | Cuerpo, formularios |

### Clases típicas

```tsx
// Título de página
className="font-[family-name:var(--font-display)] text-4xl font-bold tracking-tight text-ink"

// Eyebrow (PLAYER, LIFE MANAGER)
className="text-sm font-semibold tracking-[0.18em] text-teal"

// Cuerpo secundario
className="text-sm text-muted"
```

**`tracking-[0.18em]`** = letter-spacing amplio (look editorial).  
**`font-bold`** = peso 700.

---

## 4. Componentes visuales recurrentes

### Tarjeta (card)

```tsx
className="rounded-2xl bg-white p-6 shadow-[0_1px_0_rgba(0,0,0,0.04)]"
```

| Propiedad | Qué hace |
|---|---|
| `rounded-2xl` | Esquinas muy redondeadas (1rem) |
| `bg-white` | Fondo blanco sobre sand |
| `shadow-[...]` | Sombra sutil custom (1px abajo, 4% negro) |
| `p-6` | Padding 1.5rem |

### Botón primario

```tsx
className="rounded-full bg-teal px-4 py-2 text-sm font-semibold text-white"
```

| Propiedad | Qué hace |
|---|---|
| `rounded-full` | Píldora totalmente redonda |
| `bg-teal` | Fondo acento |
| `px-4 py-2` | Padding horizontal / vertical |

### Input / select

```tsx
className="w-full rounded-xl border border-line bg-sand/40 px-3 py-2 outline-none focus:border-teal"
```

| Propiedad | Qué hace |
|---|---|
| `rounded-xl` | Esquinas medianas |
| `border-line` | Borde gris suave |
| `bg-sand/40` | Fondo arena al 40% opacidad |
| `focus:border-teal` | Borde teal al enfocar |

---

## 5. Badges

### Tag genérico (color, talla, figura)

Archivo: `citas-table.tsx` → componente `Tag`

```tsx
className="inline-flex rounded-full bg-sand px-2.5 py-1 text-xs font-medium text-ink"
```

### Badge tipo comentario

Archivo: `comentario-tipo-badge.tsx`

| Tipo | Clases |
|---|---|
| Dicho | `bg-teal/15 text-teal` |
| Personal | `bg-forest/15 text-forest` |

Propiedades clave:

- `rounded-full` — forma píldora
- `text-[10px]` — tamaño muy pequeño
- `uppercase tracking-wide` — mayúsculas espaciadas
- `bg-teal/15` — teal al 15% opacidad (fondo suave)

---

## 6. Tabla de citas

Archivo: `citas-table.tsx`

```tsx
// Contenedor
className="overflow-hidden rounded-2xl bg-white shadow-[...]"

// Header fila
className="border-b border-line bg-sand/50 text-xs uppercase tracking-[0.12em] text-muted"

// Celda
className="px-4 py-4"
```

| Propiedad | Qué hace |
|---|---|
| `overflow-x-auto` | Scroll horizontal en móvil |
| `border-collapse` | Bordes de tabla unidos |
| `align-top` | Celdas alineadas arriba (comentarios multilínea) |
| `whitespace-nowrap` | Fecha en una línea |

---

## 7. Layout de página

```tsx
<main className="min-h-dvh bg-sand px-6 py-10">
  <div className="mx-auto max-w-6xl">
```

| Propiedad | Qué hace |
|---|---|
| `min-h-dvh` | Altura mínima = viewport dynamic (móvil friendly) |
| `bg-sand` | Fondo arena |
| `px-6 py-10` | Márgenes internos |
| `mx-auto max-w-6xl` | Contenedor centrado, ancho máx ~72rem |

`/home` usa `max-w-3xl` (más estrecho, hub).  
`/player/citas` usa `max-w-6xl` (tabla ancha).

---

## 8. Espaciado con Tailwind (escala útil)

| Clase | Tamaño |
|---|---|
| `gap-2` | 0.5rem |
| `gap-4` | 1rem |
| `gap-6` | 1.5rem |
| `mt-2` | margin-top 0.5rem |
| `mt-6` | margin-top 1.5rem |
| `space-y-6` | 1.5rem entre hijos verticales |

---

## 9. React + clases condicionales

Ejemplo del picker de tipo comentario:

```tsx
className={`rounded-full px-3 py-1 ${
  value === tipo
    ? tipo === "pensamiento"
      ? "bg-forest text-white"
      : "bg-teal text-white"
    : "border border-line bg-white text-muted"
}`}
```

Patrón: template string + ternarios para estados activo/inactivo.

---

## 10. Dónde cambiar el look global

| Quieres cambiar… | Archivo |
|---|---|
| Colores base | `globals.css` → `:root` y `@theme` |
| Fuentes | `layout.tsx` (import Google Fonts) |
| Estilo login | `app/login/page.tsx` |
| Tabla citas | `components/player/citas-table.tsx` |
| Formulario | `components/player/cita-form.tsx` |

---

## 11. Tailwind v4 en este proyecto

- Import: `@import "tailwindcss"` en `globals.css`
- No hay `tailwind.config.js` clásico — tokens en `@theme inline`
- PostCSS: `@tailwindcss/postcss`

Para probar un cambio visual: edita clases en el componente → `npm run dev:web` → refresca navegador.
