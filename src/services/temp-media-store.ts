import { randomBytes } from "crypto";

type Entry = {
  buffer: Buffer;
  contentType: string;
  expiresAt: number;
};

const MAX_BYTES = 6 * 1024 * 1024;
const TTL_MS = 25 * 60 * 1000;
const MAX_ENTRIES = 100;

const store = new Map<string, Entry>();

const pruneExpired = (): void => {
  const now = Date.now();
  for (const [id, e] of store) {
    if (e.expiresAt <= now) {
      store.delete(id);
    }
  }
  while (store.size > MAX_ENTRIES) {
    const first = store.keys().next().value as string | undefined;
    if (first) {
      store.delete(first);
    } else {
      break;
    }
  }
};

/**
 * URL pública base (https, sin / final). Render inyecta RENDER_EXTERNAL_URL.
 */
export const getPublicBaseUrl = (): string | null => {
  const pub = process.env.PUBLIC_BASE_URL?.trim();
  if (pub) {
    return pub.replace(/\/$/, "");
  }
  const render = process.env.RENDER_EXTERNAL_URL?.trim();
  if (render) {
    return render.replace(/\/$/, "");
  }
  const railway = process.env.RAILWAY_PUBLIC_DOMAIN?.trim();
  if (railway) {
    return `https://${railway.replace(/\/$/, "")}`;
  }
  return null;
};

/**
 * Guarda un binario en memoria y devuelve un id de ruta, o null si no hay base URL o es demasiado grande.
 */
export const putTempMedia = (buffer: Buffer, contentType: string): string | null => {
  if (buffer.length > MAX_BYTES) {
    console.warn(
      `[TEMP-MEDIA] Imagen demasiado grande: ${buffer.length} bytes (máx. ${MAX_BYTES})`
    );
    return null;
  }
  if (!getPublicBaseUrl()) {
    return null;
  }
  pruneExpired();
  const id = randomBytes(24).toString("hex");
  const mainType = contentType.split(";")[0].trim() || "image/jpeg";
  store.set(id, {
    buffer,
    contentType: mainType,
    expiresAt: Date.now() + TTL_MS,
  });
  return id;
};

export const getTempMedia = (id: string): { buffer: Buffer; contentType: string } | null => {
  if (!/^[a-f0-9]+$/i.test(id) || id.length > 64) {
    return null;
  }
  pruneExpired();
  const e = store.get(id);
  if (!e) {
    return null;
  }
  if (e.expiresAt <= Date.now()) {
    store.delete(id);
    return null;
  }
  return { buffer: e.buffer, contentType: e.contentType };
};
