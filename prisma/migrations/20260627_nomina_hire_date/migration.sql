-- Fecha de ingreso laboral para cálculo de prima de servicios
ALTER TABLE "NominaEmployee" ADD COLUMN IF NOT EXISTS "hireDate" DATE;
