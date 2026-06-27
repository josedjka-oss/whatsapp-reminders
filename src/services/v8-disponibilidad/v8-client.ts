import {
  APP_TIMEZONE,
  V8_DISPONIBILIDAD_URL,
  getV8DisponibilidadApiKey,
  isV8DisponibilidadConfigured,
} from "./constants";
import type {
  V8DisponibilidadPayload,
  V8DisponibilidadResponse,
} from "./types";

const MAX_ATTEMPTS = 3;
const RETRY_DELAY_MS = 60_000;

const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const postDisponibilidadToV8 = async (
  payload: V8DisponibilidadPayload
): Promise<{ ok: boolean; response: V8DisponibilidadResponse; attempts: number }> => {
  if (!isV8DisponibilidadConfigured()) {
    return {
      ok: false,
      attempts: 0,
      response: { ok: false, error: "V8_DISPONIBILIDAD_API_KEY no configurada" },
    };
  }

  const apiKey = getV8DisponibilidadApiKey();
  let lastResponse: V8DisponibilidadResponse = { ok: false };
  let attempts = 0;

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    attempts = attempt;
    try {
      const res = await fetch(V8_DISPONIBILIDAD_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      const data = (await res.json().catch(() => ({}))) as V8DisponibilidadResponse;

      if (res.status === 401) {
        return {
          ok: false,
          attempts,
          response: { ok: false, error: "Bearer token incorrecto (401)" },
        };
      }

      if (res.ok && data.ok === true) {
        return { ok: true, response: data, attempts };
      }

      lastResponse = {
        ...data,
        ok: false,
        error: data.error || `HTTP ${res.status}`,
      };

      console.warn(
        `[V8-DISP] Intento ${attempt}/${MAX_ATTEMPTS} falló para ${payload.fecha}:`,
        lastResponse.error || res.status
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      lastResponse = { ok: false, error: message };
      console.warn(
        `[V8-DISP] Intento ${attempt}/${MAX_ATTEMPTS} error de red:`,
        message
      );
    }

    if (attempt < MAX_ATTEMPTS) {
      await sleep(RETRY_DELAY_MS);
    }
  }

  return { ok: false, response: lastResponse, attempts };
};

export const buildPayload = (
  fecha: string,
  eventos: V8DisponibilidadPayload["eventos"]
): V8DisponibilidadPayload => ({
  fecha,
  origen: "app-whatsapp",
  zonaHoraria: APP_TIMEZONE,
  eventos,
});

export { APP_TIMEZONE, V8_DISPONIBILIDAD_URL };
