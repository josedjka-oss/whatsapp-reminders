import { Request, Response, NextFunction } from "express";

/**
 * Middleware de autenticación simple con password
 * Por ahora usa password fijo: 2023
 */
export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  // Password fijo por ahora: 2023
  const validPassword = process.env.ADMIN_PASSWORD || "2023";

  // Verificar header Authorization
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: "No autorizado",
      message: "Se requiere autenticación",
    });
  }

  const token = authHeader.substring(7);
  if (token !== validPassword) {
    return res.status(401).json({
      error: "No autorizado",
      message: "Password incorrecto",
    });
  }

  next();
};
