import { formatInTimeZone } from "date-fns-tz";
import { prisma } from "../../db";
import { APP_TIMEZONE, isV8DisponibilidadConfigured } from "./constants";
import {
  buildEventsForDay,
  filterEventsAtMinute,
  filterEventsNotBeforeNow,
} from "./event-builder";
import { loadPlanillaForDate } from "./firestore-planilla";
import { buildPayload, postDisponibilidadToV8 } from "./v8-client";
import type { V8DisponibilidadEvento } from "./types";

const isSchedulerEnabled = (): boolean => {
  const flag = process.env.V8_DISPONIBILIDAD_ENABLED?.trim().toLowerCase();
  if (flag === "false" || flag === "0") return false;
  return isV8DisponibilidadConfigured();
};

const filterAlreadySent = async (
  fecha: string,
  eventos: V8DisponibilidadEvento[]
): Promise<V8DisponibilidadEvento[]> => {
  if (!eventos.length) return [];

  const ids = eventos.map((e) => e.id);
  const sent = await prisma.v8DisponibilidadLog.findMany({
    where: {
      fecha,
      eventId: { in: ids },
      ok: true,
    },
    select: { eventId: true },
  });

  const sentSet = new Set(sent.map((s) => s.eventId));
  return eventos.filter((e) => !sentSet.has(e.id));
};

const logSendResult = async (
  fecha: string,
  eventos: V8DisponibilidadEvento[],
  payload: ReturnType<typeof buildPayload>,
  ok: boolean,
  response: Record<string, unknown>,
  attempts: number
): Promise<void> => {
  for (const ev of eventos) {
    await prisma.v8DisponibilidadLog.upsert({
      where: {
        eventId_fecha: { eventId: ev.id, fecha },
      },
      create: {
        eventId: ev.id,
        fecha,
        mensajero: ev.mensajero,
        fechaHora: ev.fechaHora,
        disponible: ev.disponible,
        motivo: ev.motivo,
        requestBody: payload as object,
        responseBody: response as object,
        ok,
        attempts,
      },
      update: {
        responseBody: response as object,
        ok,
        attempts,
      },
    });
  }
};

export const syncDisponibilidadDia = async (
  fecha: string,
  options: { omitirPasados?: boolean } = {}
): Promise<{
  ok: boolean;
  fecha: string;
  eventosGenerados: number;
  eventosEnviados: number;
  eventosOmitidosPasados?: number;
  eventos?: V8DisponibilidadEvento[];
  v8?: Record<string, unknown>;
  error?: string;
}> => {
  const omitirPasados = options.omitirPasados !== false;
  if (!isV8DisponibilidadConfigured()) {
    return {
      ok: false,
      fecha,
      eventosGenerados: 0,
      eventosEnviados: 0,
      error: "V8_DISPONIBILIDAD_API_KEY no configurada",
    };
  }

  const state = await loadPlanillaForDate(fecha);
  if (!state) {
    return {
      ok: false,
      fecha,
      eventosGenerados: 0,
      eventosEnviados: 0,
      error: `Planilla ${fecha.slice(0, 7)} no disponible`,
    };
  }

  const now = new Date();
  const allBuilt = buildEventsForDay(state, fecha);
  const afterPast = omitirPasados
    ? filterEventsNotBeforeNow(allBuilt, fecha, now)
    : allBuilt;
  const eventosOmitidosPasados = allBuilt.length - afterPast.length;
  const eventos = await filterAlreadySent(fecha, afterPast);

  if (!eventos.length) {
    return {
      ok: true,
      fecha,
      eventosGenerados: 0,
      eventosEnviados: 0,
      eventosOmitidosPasados,
      eventos: [],
      v8: {
        skipped: true,
        reason:
          eventosOmitidosPasados > 0
            ? "Sin eventos pendientes (los pasados no se reenvían)"
            : "Sin eventos pendientes",
      },
    };
  }

  const payload = buildPayload(fecha, eventos);
  const { ok, response, attempts } = await postDisponibilidadToV8(payload);

  await logSendResult(
    fecha,
    eventos,
    payload,
    ok,
    response as unknown as Record<string, unknown>,
    attempts
  );

  return {
    ok,
    fecha,
    eventosGenerados: eventos.length,
    eventosEnviados: ok ? eventos.length : 0,
    eventosOmitidosPasados,
    eventos,
    v8: response as unknown as Record<string, unknown>,
    error: ok ? undefined : response.error,
  };
};

export const processDisponibilidadMinute = async (
  now: Date = new Date()
): Promise<void> => {
  if (!isSchedulerEnabled()) return;

  const fecha = formatInTimeZone(now, APP_TIMEZONE, "yyyy-MM-dd");
  const hour = parseInt(formatInTimeZone(now, APP_TIMEZONE, "HH"), 10);
  const minute = parseInt(formatInTimeZone(now, APP_TIMEZONE, "mm"), 10);

  const state = await loadPlanillaForDate(fecha);
  if (!state) return;

  const allEvents = buildEventsForDay(state, fecha);
  const dueNow = filterEventsAtMinute(allEvents, fecha, hour, minute);
  const pending = await filterAlreadySent(fecha, dueNow);

  if (!pending.length) return;

  console.log(
    `[V8-DISP] ${fecha} ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} — ${pending.length} evento(s)`
  );

  const payload = buildPayload(fecha, pending);
  const { ok, response, attempts } = await postDisponibilidadToV8(payload);

  await logSendResult(
    fecha,
    pending,
    payload,
    ok,
    response as unknown as Record<string, unknown>,
    attempts
  );

  if (ok) {
    console.log(
      `[V8-DISP] OK — guardados ${response.eventosGuardados ?? pending.length} evento(s)`
    );
  } else {
    console.error(`[V8-DISP] Falló envío:`, response.error || response);
  }
};

export const previewDisponibilidadDia = async (
  fecha: string,
  options: { soloFuturos?: boolean } = {}
): Promise<{
  fecha: string;
  eventos: V8DisponibilidadEvento[];
  eventosOmitidosPasados?: number;
  error?: string;
}> => {
  const state = await loadPlanillaForDate(fecha);
  if (!state) {
    return { fecha, eventos: [], error: `Planilla ${fecha.slice(0, 7)} no disponible` };
  }

  const all = buildEventsForDay(state, fecha);
  const soloFuturos = options.soloFuturos !== false;
  if (!soloFuturos) {
    return { fecha, eventos: all, eventosOmitidosPasados: 0 };
  }
  const now = new Date();
  const futuros = filterEventsNotBeforeNow(all, fecha, now);
  return {
    fecha,
    eventos: futuros,
    eventosOmitidosPasados: all.length - futuros.length,
  };
};

export { isSchedulerEnabled, isV8DisponibilidadConfigured };
