import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import * as XLSX from "xlsx";
import {
  mapEnum,
  parseFechaToISO,
  parseIntOrDefault,
  pickColumn,
  slugifyPersona,
  sqlString,
} from "./lib/normalize.mjs";

const PLAYER_COLORS = ["blanca", "canela", "negra"];
const PLAYER_TALLAS = ["caballo", "mediana", "chata"];
const PLAYER_FIGURAS = ["bbw", "chubby", "vedette", "fitness", "delgada"];
const PLAYER_BELLEZAS = ["regular", "modelo"];
const PLAYER_TOPS = ["regular", "mega"];
const PLAYER_BOTTOMS = ["regular", "mega"];
const PLAYER_PRESIONES = ["cocomordan", "regular"];

const filePath = process.argv[2];
const emailFlagIndex = process.argv.indexOf("--email");
const email = emailFlagIndex !== -1 ? process.argv[emailFlagIndex + 1] : null;

if (!filePath || !email) {
  console.error("Uso: node scripts/excel-to-sql.mjs <ruta-al-excel> --email tu@correo.com");
  process.exit(1);
}

function buildCita(row, rowIndex) {
  const errors = [];

  const fechaRaw = pickColumn(row, ["fecha", "date"]);
  const fecha = parseFechaToISO(fechaRaw);
  if (!fecha) errors.push(`fecha inválida o vacía ("${fechaRaw ?? ""}")`);

  const persona = String(pickColumn(row, ["persona", "nombre", "alias"]) ?? "").trim();
  if (!persona) errors.push("persona vacía");

  const lugar = String(pickColumn(row, ["lugar"]) ?? "").trim();
  if (!lugar) errors.push("lugar vacío");

  const color = mapEnum(pickColumn(row, ["color"]), PLAYER_COLORS, undefined);
  if (!color.value) errors.push(`color inválido ("${color.unknownValue ?? ""}")`);

  const talla = mapEnum(pickColumn(row, ["talla"]), PLAYER_TALLAS, undefined);
  if (!talla.value) errors.push(`talla inválida ("${talla.unknownValue ?? ""}")`);

  const figura = mapEnum(pickColumn(row, ["figura", "contextura"]), PLAYER_FIGURAS, undefined);
  if (!figura.value) errors.push(`figura inválida ("${figura.unknownValue ?? ""}")`);

  const belleza = mapEnum(pickColumn(row, ["belleza"]), PLAYER_BELLEZAS, "regular");
  const top = mapEnum(pickColumn(row, ["top"]), PLAYER_TOPS, "regular");
  const bottom = mapEnum(pickColumn(row, ["bottom"]), PLAYER_BOTTOMS, "regular");
  const presion = mapEnum(pickColumn(row, ["presion", "presión"]), PLAYER_PRESIONES, "regular");

  const paciencia_minutos = parseIntOrDefault(
    pickColumn(row, ["paciencia_minutos", "paciencia (min)", "paciencia"]),
    0,
  );
  const puntaje = parseIntOrDefault(pickColumn(row, ["puntaje", "puntaje final", "puntaje promedio"]), 50);
  const caracteristica = pickColumn(row, ["caracteristica", "característica", "descripcion", "notas"]);

  const comentarios = [];
  for (const key of Object.keys(row)) {
    if (/^comentario/i.test(key.trim())) {
      const contenido = String(row[key] ?? "").trim();
      if (contenido) comentarios.push(contenido);
    }
  }

  if (errors.length > 0) {
    return { ok: false, rowIndex, errors };
  }

  return {
    ok: true,
    rowIndex,
    cita: {
      fecha,
      persona,
      codigo_identificador: slugifyPersona(persona),
      caracteristica: caracteristica ? String(caracteristica).trim() : null,
      lugar,
      color: color.value,
      talla: talla.value,
      figura: figura.value,
      belleza: belleza.value,
      top: top.value,
      bottom: bottom.value,
      presion: presion.value,
      paciencia_minutos,
      puntaje,
    },
    comentarios,
    warnings: [color, talla, figura, belleza, top, bottom, presion]
      .filter((result) => result.unknownValue)
      .map((result) => `valor desconocido "${result.unknownValue}", se usó "${result.value}"`),
  };
}

function buildSql(result, emailSql) {
  const c = result.cita;
  const userIdExpr = `(select id from public.profiles where email = ${emailSql})`;

  const insertCita = `insert into public.player_citas
  (user_id, fecha, persona, codigo_identificador, caracteristica, lugar, color, talla, figura, belleza, top, bottom, presion, paciencia_minutos, puntaje)
values
  (${userIdExpr}, ${sqlString(c.fecha)}, ${sqlString(c.persona)}, ${sqlString(c.codigo_identificador)}, ${sqlString(c.caracteristica)}, ${sqlString(c.lugar)}, ${sqlString(c.color)}, ${sqlString(c.talla)}, ${sqlString(c.figura)}, ${sqlString(c.belleza)}, ${sqlString(c.top)}, ${sqlString(c.bottom)}, ${sqlString(c.presion)}, ${c.paciencia_minutos}, ${c.puntaje})`;

  if (result.comentarios.length === 0) {
    return `-- Fila ${result.rowIndex}: ${c.persona}\n${insertCita};`;
  }

  return `-- Fila ${result.rowIndex}: ${c.persona} (${result.comentarios.length} comentario(s))
with nueva_cita as (
  ${insertCita}
  returning id
)
insert into public.player_citas_comentarios (cita_id, codigo_identificador, fecha, contenido, tipo, orden, user_id)
select id, ${sqlString(c.codigo_identificador)}, ${sqlString(c.fecha)}, contenido, tipo, orden, ${userIdExpr}
from (
${result.comentarios
  .map(
    (contenido, index) =>
      `  select ${sqlString(contenido)} as contenido, 'dicho' as tipo, ${index + 1} as orden`,
  )
  .join("\n  union all\n")}
) as c, nueva_cita;`;
}

const absolutePath = resolve(filePath);
const buffer = readFileSync(absolutePath);
const workbook = XLSX.read(buffer, { type: "buffer" });
const sheetName = workbook.SheetNames[0];
const rows = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], { defval: null });

console.log(`Leyendo hoja "${sheetName}" — ${rows.length} filas.`);

const results = rows.map((row, index) => buildCita(row, index + 2));
const valid = results.filter((r) => r.ok);
const invalid = results.filter((r) => !r.ok);

for (const result of invalid) {
  console.log(`Fila ${result.rowIndex}: SALTADA — ${result.errors.join("; ")}`);
}
for (const result of valid) {
  if (result.warnings.length > 0) {
    console.log(`Fila ${result.rowIndex}: advertencias — ${result.warnings.join("; ")}`);
  }
}

console.log(`\nVálidas: ${valid.length} / ${rows.length}. Saltadas: ${invalid.length}.`);

const emailSql = sqlString(email);
const statements = valid.map((result) => buildSql(result, emailSql));

const outputPath = resolve("import/generated-citas.sql");
const sqlFile = `begin;

${statements.join("\n\n")}

commit;
`;

writeFileSync(outputPath, sqlFile, "utf-8");
console.log(`\nSQL generado en: ${outputPath}`);
console.log("Revísalo y luego se ejecuta con: npx supabase db query --linked -f import/generated-citas.sql");
