export const parseAm = (v: string | number | undefined | null): number | null => {
  const raw = String(v ?? "").trim().toLowerCase().replace(/\s/g, "");
  if (raw === "0" || raw === "00") return null;
  if (raw === "930" || raw === "9:30" || raw === "09:30" || raw === "9.5") return 9.5;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0) return null;
  if (n >= 1 && n <= 7) return n + 12;
  return n;
};

export const parsePm = (v: string | number | undefined | null): number | null => {
  const n = Number(String(v ?? "").trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  if (n >= 13 && n <= 23) return n;
  if (n === 12) return 12;
  if (n >= 1 && n <= 11) return n + 12;
  return null;
};

export const normAm = (cell: { am?: string } | null | undefined): string => {
  const v = String(cell?.am ?? "").trim().toLowerCase().replace(/\s/g, "");
  if (v === "0" || v === "00") return "0";
  if (v === "930" || v === "9:30" || v === "09:30" || v === "9.5") return "930";
  if (v === "09" || v === "9") return "9";
  if (v === "010" || v === "10") return "10";
  return String(cell?.am ?? "").trim();
};

export const normPm = (cell: { pm?: string } | null | undefined): string => {
  const v = String(cell?.pm ?? "").trim();
  if (v === "05" || v === "5") return "5";
  if (v === "06" || v === "6") return "6";
  return v;
};

export const hourDecimalToTimeParts = (
  hour: number
): { h: number; m: number } => {
  const h = Math.floor(hour);
  const m = Math.round((hour - h) * 60);
  return { h, m };
};

export const formatFechaHora = (
  fecha: string,
  hour: number,
  minute = 0
): string => {
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${fecha}T${h}:${m}:00`;
};

export const formatEventIdSuffix = (hour: number, minute = 0): string => {
  const h = String(hour).padStart(2, "0");
  const m = String(minute).padStart(2, "0");
  return `${h}${m}`;
};
