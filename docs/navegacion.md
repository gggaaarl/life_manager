# Navegación y cómo pedir cambios de UI

Contrato para humanos y para el agente. La regla Cursor `.cursor/rules/alcance-y-navegacion.mdc` se aplica en cada sesión.

## Menú actual

| Dónde | Qué |
|---|---|
| Header → **Finanzas ▾** | Submenú: **Movimientos** (`/finance`) y **Configuración de finanzas** (`/finance/configuracion`) |
| Header → **Mis trabajos ▾** | Jobs activos (desarrollador, trainer, taxi, botánico, player) |
| Vista `/finance` | Día, saldos, movimientos, formularios. **Sin pestañas** de configuración. |
| Vista `/finance/configuracion` | Cuentas de pago. Página aparte, no un tab de Finanzas. |

## Qué falló en el prompt (no es “escribiste mal”)

El 28-ago pediste tres cosas a la vez: entrar a finanzas, que config se viera como **submenú de Finanzas**, y el menú de trabajos.

La frase **“salga tabulado … como sub menu de finanzas”** era el pedido de menú. El agente leyó **tabulado = pestañas** y metió Configuración *dentro* de la vista de movimientos. Eso también **quitó** el enlace del header, que no habías pedido borrar.

No falló la idea. Falló una palabra ambigua (`tabulado`) + un rediseño de header en el mismo lote que “Mis trabajos”.

## Cómo pedir para que no se desvíe

Funciona bien tu estilo (listas, fechas, montos). Para UI, una línea de **dónde** evita el desvío:

- “En el **dropdown Finanzas del header**, deja Movimientos y Configuración de finanzas. No pongas tabs en la página.”
- “No toques el menú; solo cambia X.”

Evita **tabulado** si quieres submenú. Di **dropdown**, **submenú del header** o **ítem bajo Finanzas ▾**.

Si mezclas 3 temas en un mensaje, el agente tiende a unificar el chrome. Puedes cerrar con: **“no cambies navegación salvo lo que nombré.”**
