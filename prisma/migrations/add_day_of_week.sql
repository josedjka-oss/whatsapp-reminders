-- Migración: Agregar campo dayOfWeek para recordatorios semanales
-- Ejecutar este SQL en la base de datos de producción

ALTER TABLE "Reminder" 
ADD COLUMN IF NOT EXISTS "dayOfWeek" INTEGER;

-- dayOfWeek: 0=domingo, 1=lunes, 2=martes, 3=miércoles, 4=jueves, 5=viernes, 6=sábado
-- NULL para recordatorios que no son semanales
