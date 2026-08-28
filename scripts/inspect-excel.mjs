import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as XLSX from "xlsx";

const filePath = process.argv[2];

if (!filePath) {
  console.error("Uso: node scripts/inspect-excel.mjs <ruta-al-excel>");
  process.exit(1);
}

const absolutePath = resolve(filePath);
const buffer = readFileSync(absolutePath);
const workbook = XLSX.read(buffer, { type: "buffer" });

console.log(`Archivo: ${absolutePath}`);
console.log(`Hojas encontradas: ${workbook.SheetNames.join(", ")}`);
console.log("");

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: null });

  console.log(`--- Hoja: "${sheetName}" (${rows.length} filas de datos) ---`);

  if (rows.length === 0) {
    console.log("(vacía)\n");
    continue;
  }

  const columns = Object.keys(rows[0]);
  console.log("Columnas:", columns);
  console.log("Primeras 3 filas:");
  console.log(JSON.stringify(rows.slice(0, 3), null, 2));
  console.log("");
}
