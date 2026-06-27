import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { PLANILLA_COLLECTION } from "./constants";
import type { PlanillaState } from "./types";

let firestoreReady = false;

const parseServiceAccountJson = (): Record<string, unknown> | null => {
  const raw =
    process.env.FIREBASE_TURNOS_SERVICE_ACCOUNT_JSON?.trim() ||
    process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (!raw) return null;

  try {
    const decoded = raw.startsWith("{") ? raw : Buffer.from(raw, "base64").toString("utf8");
    return JSON.parse(decoded) as Record<string, unknown>;
  } catch (error) {
    console.error("[V8-DISP] Error parseando FIREBASE_TURNOS_SERVICE_ACCOUNT_JSON:", error);
    return null;
  }
};

export const initFirestore = (): boolean => {
  if (firestoreReady) return true;

  const serviceAccount = parseServiceAccountJson();
  if (!serviceAccount) {
    console.warn("[V8-DISP] Firebase Admin no configurado (FIREBASE_TURNOS_SERVICE_ACCOUNT_JSON)");
    return false;
  }

  const projectId =
    process.env.FIREBASE_TURNOS_PROJECT_ID?.trim() ||
    process.env.FIREBASE_PROJECT_ID?.trim() ||
    String(serviceAccount.project_id || "cajacentro-v6");

  if (!getApps().length) {
    initializeApp({
      credential: cert(serviceAccount as Parameters<typeof cert>[0]),
      projectId,
    });
  }

  firestoreReady = true;
  console.log(`[V8-DISP] Firebase Admin listo — proyecto ${projectId}`);
  return true;
};

const planillaCache = new Map<
  string,
  { state: PlanillaState; fetchedAt: number }
>();
const CACHE_TTL_MS = 60_000;

export const loadPlanillaMonth = async (monthKey: string): Promise<PlanillaState | null> => {
  const cached = planillaCache.get(monthKey);
  if (cached && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
    return cached.state;
  }

  if (!initFirestore()) return null;

  try {
    const doc = await getFirestore()
      .collection(PLANILLA_COLLECTION)
      .doc(monthKey)
      .get();

    if (!doc.exists) {
      console.warn(`[V8-DISP] Planilla ${monthKey} no encontrada en Firestore`);
      return null;
    }

    const data = doc.data() as Record<string, unknown>;
    const state: PlanillaState = {
      cells: (data.cells as PlanillaState["cells"]) || {},
      lunchOverrides: (data.lunchOverrides as PlanillaState["lunchOverrides"]) || {},
      trioAusentePorDia: (data.trioAusentePorDia as PlanillaState["trioAusentePorDia"]) || {},
      flagsDiaMarcadoNoLab:
        (data.flagsDiaMarcadoNoLab as PlanillaState["flagsDiaMarcadoNoLab"]) || {},
      crossMonthCells: (data.crossMonthCells as PlanillaState["crossMonthCells"]) || {},
    };

    planillaCache.set(monthKey, { state, fetchedAt: Date.now() });
    return state;
  } catch (error) {
    console.error(`[V8-DISP] Error leyendo planilla ${monthKey}:`, error);
    return null;
  }
};

export const loadPlanillaForDate = async (fecha: string): Promise<PlanillaState | null> => {
  const monthKey = fecha.slice(0, 7);
  return loadPlanillaMonth(monthKey);
};

export const clearPlanillaCache = (): void => {
  planillaCache.clear();
};
