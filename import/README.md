# Carpeta de importación

Pon aquí tu archivo Excel (`.xlsx`) con los datos de Salidas.

Esta carpeta está en `.gitignore` — el Excel nunca se sube a GitHub, solo se usa en tu máquina.

No se necesita ninguna llave (`service_role` ni nada parecido). El CLI de Supabase ya está autenticado contra tu proyecto (lo mismo que usa `npm run db:push`), así que la importación se hace directo con eso.

## Pasos

1. Copia tu archivo aquí, por ejemplo: `import/salidas.xlsx`.
2. Revisa cómo se leen las columnas:
   ```bash
   npm run import:inspect -- import/salidas.xlsx
   ```
3. Genera el SQL a partir del Excel (no escribe nada en la base todavía, solo crea `import/generated-citas.sql`):
   ```bash
   npm run import:sql -- import/salidas.xlsx --email tu_correo_de_gmail@gmail.com
   ```
4. Revisa el archivo generado (`import/generated-citas.sql`).
5. Ejecuta el SQL contra la base real:
   ```bash
   npx supabase db query --linked -f import/generated-citas.sql
   ```
