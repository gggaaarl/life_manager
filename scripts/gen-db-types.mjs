import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { resolve } from "node:path";

const outputPath = resolve("packages/shared/src/database.types.ts");
const result = spawnSync(
  "npx",
  ["supabase", "gen", "types", "typescript", "--linked"],
  { encoding: "utf-8", shell: true },
);

if (result.status !== 0) {
  console.error(result.stderr || result.stdout);
  process.exit(result.status ?? 1);
}

writeFileSync(outputPath, result.stdout, "utf-8");
console.log(`Tipos generados en ${outputPath}`);
