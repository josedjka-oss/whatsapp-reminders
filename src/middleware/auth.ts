import { Request, Response, NextFunction } from "express";

/**
 * Middleware de autenticación simple con password
 * Acepta ADMIN_PASSWORD o AI_ADMIN_KEY desde variables de entorno
 * También acepta header x-admin-password para compatibilidad con proxy de Vercel
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const validPassword = process.env.ADMIN_PASSWORD || process.env.AI_ADMIN_KEY || "2023";

  // Verificar header x-admin-password (usado por proxy de Vercel)
  const xAdminPassword = req.headers["x-admin-password"] as string;
  if (xAdminPassword && xAdminPassword === validPassword) {
    return next();
  }

  // Verificar header Authorization
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    const token = authHeader.substring(7);
    if (token === validPassword) {
      return next();
    }
  }

  // Si no hay autenticación válida
  return res.status(401).json({
    error: "No autorizado",
    message: "Se requiere autenticación",
  });
};
