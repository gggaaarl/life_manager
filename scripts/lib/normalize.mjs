export function slugifyPersona(persona) {
  return persona
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeKey(value) {
  return String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function pickColumn(row, aliases) {
  const normalizedRow = {};
  for (const key of Object.keys(row)) {
    normalizedRow[normalizeKey(key)] = row[key];
  }
  for (const alias of aliases) {
    const normalizedAlias = normalizeKey(alias);
    if (normalizedRow[normalizedAlias] !== undefined && normalizedRow[normalizedAlias] !== null) {
      return normalizedRow[normalizedAlias];
    }
  }
  return undefined;
}

export function mapEnum(rawValue, allowedValues, fallback) {
  if (rawValue === undefined || rawValue === null || String(rawValue).trim() === "") {
    return { value: fallback, matched: false };
  }
  const normalized = normalizeKey(rawValue);
  const match = allowedValues.find((allowed) => normalizeKey(allowed) === normalized);
  if (match) {
    return { value: match, matched: true };
  }
  return { value: fallback, matched: false, unknownValue: String(rawValue) };
}

export function parseFechaToISO(rawValue) {
  if (rawValue instanceof Date) {
    return new Date(
      Date.UTC(rawValue.getFullYear(), rawValue.getMonth(), rawValue.getDate(), 12),
    ).toISOString();
  }

  const text = String(rawValue ?? "").trim();
  if (!text) {
    return null;
  }

  const ddmmyyyy = text.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
  if (ddmmyyyy) {
    const [, day, month, yearRaw] = ddmmyyyy;
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
    return new Date(
      Date.UTC(Number(year), Number(month) - 1, Number(day), 12),
    ).toISOString();
  }

  const parsed = new Date(text);
  if (!Number.isNaN(parsed.getTime())) {
    return new Date(
      Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate(), 12),
    ).toISOString();
  }

  return null;
}

export function parseIntOrDefault(rawValue, fallback) {
  const parsed = Number(rawValue);
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.round(parsed);
}

export function escapeSql(value) {
  return String(value).replace(/'/g, "''");
}

export function sqlString(value) {
  if (value === null || value === undefined) {
    return "null";
  }
  return `'${escapeSql(value)}'`;
}
