import { Router, Request, Response } from "express";
import { prisma } from "../db";

const router = Router();

/**
 * Endpoint temporal para ejecutar la migración de dayOfWeek
 * IMPORTANTE: Eliminar este endpoint después de ejecutar la migración
 * Soporta tanto GET como POST para facilitar el acceso desde el navegador
 */
const executeMigration = async (req: Request, res: Response) => {
  try {
    // Ejecutar la migración SQL
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Reminder" 
      ADD COLUMN IF NOT EXISTS "dayOfWeek" INTEGER;
    `);

    return res.json({
      success: true,
      message: "Campo dayOfWeek agregado exitosamente",
    });
  } catch (error: any) {
    console.error("Error ejecutando migración:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error al ejecutar la migración",
    });
  }
};

// Soporta tanto GET como POST
router.get("/add-day-of-week", executeMigration);
router.post("/add-day-of-week", executeMigration);

/**
 * Endpoint para verificar que la migración se ejecutó correctamente
 */
router.get("/verify-day-of-week", async (req: Request, res: Response) => {
  try {
    const result = await prisma.$queryRawUnsafe<Array<{ column_name: string; data_type: string }>>(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Reminder' AND column_name = 'dayOfWeek';
    `);

    if (result.length > 0) {
      return res.json({
        success: true,
        message: "Campo dayOfWeek existe",
        data: result[0],
      });
    } else {
      return res.json({
        success: false,
        message: "Campo dayOfWeek no existe. Ejecuta la migración primero.",
      });
    }
  } catch (error: any) {
    console.error("Error verificando migración:", error);
    return res.status(500).json({
      success: false,
      error: error.message || "Error al verificar la migración",
    });
  }
});

export default router;
