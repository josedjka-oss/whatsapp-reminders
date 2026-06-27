import {
  Router,
  Request,
  Response,
  NextFunction,
} from "express";
import {
  previewDisponibilidadDia,
  syncDisponibilidadDia,
} from "../services/v8-disponibilidad/service";
import { clearPlanillaCache } from "../services/v8-disponibilidad/firestore-planilla";

const router = Router();

const requireV8Auth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const allowed = [
    process.env.INTEGRATION_FIREBASE_SECRET?.trim(),
    process.env.ADMIN_PASSWORD?.trim(),
  ].filter((v): v is string => Boolean(v));

  if (!allowed.length) {
    res.status(503).json({
      ok: false,
      error: "INTEGRATION_FIREBASE_SECRET o ADMIN_PASSWORD requerido",
    });
    return;
  }

  const authHeader = req.headers.authorization?.trim() || "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length).trim()
    : "";
  const apiKey = String(req.headers["x-api-key"] || "").trim();
  const token = bearer || apiKey;

  if (!token || !allowed.includes(token)) {
    res.status(401).json({ ok: false, error: "No autorizado" });
    return;
  }

  next();
};

const parseFecha = (raw: string | undefined): string | null => {
  const s = String(raw || "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  return s;
};

const parseBoolQuery = (raw: string | undefined, defaultVal: boolean): boolean => {
  if (raw == null || raw === "") return defaultVal;
  const s = String(raw).trim().toLowerCase();
  if (s === "0" || s === "false" || s === "no") return false;
  if (s === "1" || s === "true" || s === "si" || s === "sí") return true;
  return defaultVal;
};

/** POST /api/v8/sync-dia?fecha=YYYY-MM-DD — envía eventos pendientes del día a V8 */
router.post("/sync-dia", requireV8Auth, async (req, res) => {
  const fecha =
    parseFecha(String(req.query.fecha || req.body?.fecha || "")) ||
    new Date().toISOString().slice(0, 10);
  const incluirFuturos = parseBoolQuery(
    String(req.query.incluirFuturos ?? req.body?.incluirFuturos ?? ""),
    false
  );

  clearPlanillaCache();
  const result = await syncDisponibilidadDia(fecha, { incluirFuturos });
  const status = result.ok ? 200 : result.error?.includes("API_KEY") ? 503 : 502;
  return res.status(status).json(result);
});

/** GET /api/v8/planilla-dia?fecha=YYYY-MM-DD — preview de eventos sin enviar */
router.get("/planilla-dia", requireV8Auth, async (req, res) => {
  const fecha =
    parseFecha(String(req.query.fecha || "")) ||
    new Date().toISOString().slice(0, 10);
  const soloFuturos = parseBoolQuery(String(req.query.soloFuturos ?? ""), true);
  const soloPendientes = parseBoolQuery(String(req.query.soloPendientes ?? ""), false);

  const result = await previewDisponibilidadDia(fecha, { soloFuturos, soloPendientes });
  return res.json({ ok: !result.error, ...result });
});

export default router;
