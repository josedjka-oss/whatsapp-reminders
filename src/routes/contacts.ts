import { Router, Request, Response } from "express";
import { prisma } from "../db";
import { normalizeWhatsAppPhoneNumber as normalizePhoneNumber } from "../utils/whatsapp-phone-normalize";

const router = Router();

// Listar contactos
router.get("/", async (req: Request, res: Response) => {
  try {
    const contacts = await prisma.contact.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return res.json(contacts);
  } catch (error: any) {
    console.error("Error listando contactos:", error);
    return res.status(500).json({
      error: error.message || "Error al listar contactos",
    });
  }
});

// Crear contacto
router.post("/", async (req: Request, res: Response) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        error: "name y phone son requeridos",
      });
    }

    // Normalizar número
    const normalizedPhone = normalizePhoneNumber(phone);
    
    // Convertir nombre a mayúsculas
    const upperName = name.toUpperCase().trim();

    const contact = await prisma.contact.upsert({
      where: { phone: normalizedPhone },
      update: { name: upperName },
      create: {
        name: upperName,
        phone: normalizedPhone,
      },
    });

    return res.status(201).json(contact);
  } catch (error: any) {
    console.error("Error creando contacto:", error);
    return res.status(500).json({
      error: error.message || "Error al crear contacto",
    });
  }
});

// Actualizar contacto
router.patch("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    const updateData: any = {};

    if (name !== undefined) {
      updateData.name = name.toUpperCase().trim();
    }

    if (phone !== undefined) {
      updateData.phone = normalizePhoneNumber(phone);
    }

    const contact = await prisma.contact.update({
      where: { id },
      data: updateData,
    });

    return res.json(contact);
  } catch (error: any) {
    console.error("Error actualizando contacto:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Contacto no encontrado" });
    }
    return res.status(500).json({
      error: error.message || "Error al actualizar contacto",
    });
  }
});

// Eliminar contacto
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    await prisma.contact.delete({
      where: { id },
    });

    return res.status(204).send();
  } catch (error: any) {
    console.error("Error eliminando contacto:", error);
    if (error.code === "P2025") {
      return res.status(404).json({ error: "Contacto no encontrado" });
    }
    return res.status(500).json({
      error: error.message || "Error al eliminar contacto",
    });
  }
});

export default router;
