# Job PLAYER — Citas

## Propósito

Dentro del job **PLAYER**, el usuario registra un **historial de citas**.  
Cada cita es un evento en una fecha/lugar con una persona identificada por `codigo_identificador`.

La misma persona (`codigo_identificador`) puede aparecer en **varias citas**.  
Los comentarios y puntajes son **por cita**, no globales por persona.

## Flujo de captura (web o app)

1. Usuario autenticado con Google y job PLAYER `active`.
2. Crea una salida con datos base + categorías.
3. Asigna el `puntaje` (1–100) a mano — no se calcula automático.
4. Agrega 0..n comentarios asociados a esa salida.
5. Puede editar campos, puntaje y comentarios después. Nada se guarda solo: hay que dar clic en "Guardar salida" / "Guardar cambios".

## Campos de una salida

| Campo | Tipo | Requerido | Notas |
|---|---|---|---|
| `fecha` | date / timestamptz | sí | Fecha (y opcionalmente hora) de la salida |
| `lugar` | text | sí | Lugar del encuentro |
| `codigo_identificador` | text | sí | Código de la persona (derivado del nombre, reutilizable entre salidas) |
| `persona` | text | sí | Nombre / alias mostrado |
| `caracteristica` | text | no | Notas libres de la salida |
| `color` | enum | sí | blanca / canela / negra |
| `talla` | enum | sí | caballo / mediana / chata |
| `figura` | enum | sí | bbw / chubby / vedette / fitness / delgada |
| `belleza` | enum | sí | regular / modelo, default `regular` |
| `top` | enum | sí | regular / mega, default `regular` |
| `bottom` | enum | sí | regular / mega, default `regular` |
| `presion` | enum | sí | cocomordan / regular, default `regular` |
| `paciencia_minutos` | int >= 0 | sí | Tiempo en minutos |
| `puntaje` | int 1–100 | sí | Asignado a mano por el usuario |
| `comentario_1..n` | vía tabla hija | no | Ver sección Comentarios |

## Catálogos (enums)

### Color

| Valor interno | Etiqueta UI |
|---|---|
| `blanca` | Blanca |
| `canela` | Canela |
| `negra` | Negra |

### Talla

| Valor interno | Etiqueta UI |
|---|---|
| `caballo` | Caballo |
| `mediana` | Mediana |
| `chata` | Chata |

### Figura

| Valor interno | Etiqueta UI |
|---|---|
| `bbw` | BBW |
| `chubby` | Chubby |
| `vedette` | Vedette |
| `fitness` | Fitness |
| `delgada` | Delgada |

### Belleza

| Valor interno | Etiqueta UI |
|---|---|
| `regular` | Regular |
| `modelo` | Modelo |

### Top

| Valor interno | Etiqueta UI |
|---|---|
| `regular` | Regular |
| `mega` | Mega |

### Bottom

| Valor interno | Etiqueta UI |
|---|---|
| `regular` | Regular |
| `mega` | Mega |

### Presión

| Valor interno | Etiqueta UI |
|---|---|
| `cocomordan` | Cocomordan |
| `regular` | Regular |

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
