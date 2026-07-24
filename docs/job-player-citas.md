# Job PLAYER — Citas

## Propósito

Dentro del job **PLAYER**, el usuario registra un **historial de citas**.  
Cada cita es un evento en una fecha/lugar con una persona identificada por `codigo_identificador`.

La misma persona (`codigo_identificador`) puede aparecer en **varias citas**.  
Los comentarios y puntajes son **por cita**, no globales por persona.

## Flujo de captura (web o app)

1. Usuario autenticado con Google y job PLAYER `active`.
2. Crea una cita con datos base + categorías + puntajes.
3. El sistema calcula `puntaje_promedio`.
4. Agrega 0..n comentarios asociados a esa cita.
5. Puede editar comentarios o agregar nuevos después.

## Campos de una cita

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `fecha` | date / timestamptz | sí | Fecha (y opcionalmente hora) de la cita |
| `lugar` | text | sí | Lugar del encuentro |
| `codigo_identificador` | text | sí | Código de la persona (reutilizable entre citas) |
| `nombre` | text | sí | Nombre / alias mostrado |
| `descripcion` | text | no | Notas libres de la cita |
| `categoria_1` | enum | sí | Color (ver catálogo) |
| `categoria_2` | enum | sí | Contextura |
| `categoria_3` | enum | sí | Talla |
| `puntaje_tightening` | int 1–100 | sí | Puntaje 1 |
| `puntaje_bottom` | int 1–100 | sí | Puntaje 2 |
| `puntaje_top` | int 1–100 | sí | Puntaje 3 |
| `puntaje_belleza` | int 1–100 | sí | Puntaje 4 |
| `puntaje_paciencia` | int 1–100 | sí | Puntaje 5 |
| `puntaje_promedio` | numeric | calculado | Promedio de los 5 puntajes |
| `comentario_1..n` | vía tabla hija | no | Ver sección Comentarios |

### Cálculo de promedio

```text
puntaje_promedio =
  (tightening + bottom + top + belleza + paciencia) / 5
```

Se guarda en la fila de la cita (denormalizado) y se recalcula al crear/actualizar puntajes.  
Precisión sugerida: 2 decimales.

## Catálogos (enums)

### Categoría 1 — Color

| Valor interno | Etiqueta UI |
|---|---|
| `blanca_palida` | Blanca pálida |
| `blanca_perla` | Blanca perla |
| `chocolate_claro` | Chocolate claro |
| `chocolate_oscuro` | Chocolate oscuro |
| `marron` | Marrón |

### Categoría 2 — Contextura

| Valor interno | Etiqueta UI |
|---|---|
| `bbw` | BBW |
| `chubby` | Chubby |
| `vedette` | Vedette |
| `fit` | Fit |
| `flaca` | Flaca |

### Categoría 3 — Talla

| Valor interno | Etiqueta UI |
|---|---|
| `caballona` | Caballona |
| `mediana` | Mediana |
| `chata` | Chata |

## Comentarios

Los comentarios **no** viven como columnas fijas (`comentario_1`, `comentario_2`…) en la cita.  
Van en tabla `player_citas_comentarios` para permitir **n** comentarios por cita.

### Por qué no enlazar solo por `codigo_identificador`

`codigo_identificador` identifica a la **persona** a lo largo del tiempo.  
Si dos citas son con la misma persona, los comentarios deben distinguirse por **cita**.

### Enlace correcto

| Enfoque | Uso |
|---|---|
| `cita_id` (FK) | **Fuente de verdad**: comentario pertenece a una cita |
| `codigo_identificador` | Denormalizado para filtrar “todos los comentarios de esta persona” |
| `fecha` del comentario | Cuándo se escribió el comentario (puede diferir de la fecha de la cita) |

La fecha de la cita se obtiene por join con `player_citas.fecha`.  
Opcionalmente se puede denormalizar `cita_fecha` en el comentario para consultas rápidas; no es obligatorio si siempre se hace join.

### Campos del comentario

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `cita_id` | uuid FK | sí | Cita a la que pertenece |
| `codigo_identificador` | text | sí | Copiado de la cita al crear (misma persona) |
| `fecha` | timestamptz | sí | Fecha/hora del comentario (default: ahora) |
| `contenido` | text | sí | Texto del comentario |
| `orden` | int | no | Orden de visualización opcional |

## Relación persona ↔ citas ↔ comentarios

```text
codigo_identificador (persona lógica)
        │
        │  1..n
        ▼
   player_citas          ← cada evento (fecha, lugar, scores…)
        │
        │  0..n
        ▼
player_citas_comentarios  ← comentarios de ESA cita
```

### Ejemplo

| codigo_identificador | Cita | Fecha cita | Comentarios |
|---|---|---|---|
| `P-001` | Cita A | 2026-01-10 | “Primera vez”, “Lugar ruidoso” |
| `P-001` | Cita B | 2026-03-02 | “Mejor que la anterior” |
| `P-002` | Cita C | 2026-03-15 | (sin comentarios) |

Misma persona `P-001`, comentarios distintos por cita.

## Validaciones

- Puntajes: enteros en rango **1..100**.
- Enums: solo valores del catálogo.
- `codigo_identificador`: no vacío; normalizar trim; case-sensitive salvo que se defina lo contrario.
- Comentario: `contenido` no vacío.
- Solo el dueño (`user_id`) puede CRUD sus citas/comentarios.
- Requiere job PLAYER en estado `active` (o al menos `unlocked`) — regla de producto a aplicar en app + opcionalmente en RPC/policies.

## Pantallas sugeridas (UI)

1. **Lista de citas** — filtros por fecha, codigo, categorías, promedio.
2. **Detalle de cita** — datos + puntajes + lista de comentarios.
3. **Nueva / editar cita** — formulario completo.
4. **Historial por persona** — agrupar por `codigo_identificador`.
