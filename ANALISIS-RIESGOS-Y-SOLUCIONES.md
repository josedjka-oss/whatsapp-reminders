# 🛡️ Análisis de Riesgos: Disponibilidad y Confiabilidad

## 📋 Resumen Ejecutivo

**SÍ, existe riesgo de que la aplicación deje de funcionar si algún componente se detiene.** Este documento detalla los riesgos identificados y las soluciones para mitigarlos.

---

## ⚠️ RIESGOS IDENTIFICADOS

### 1. 🔴 CRÍTICO: Servidor Express se detiene

**¿Qué pasa si falla?**
- ❌ El scheduler deja de ejecutarse (no se envían recordatorios)
- ❌ La API deja de responder (no se pueden crear/editar recordatorios)
- ❌ Los webhooks de Twilio no se reciben (no se reenvían respuestas)
- ❌ Se pierden todos los recordatorios programados hasta que se reinicie

**Probabilidad:** Media-Alta
- Si es proceso manual: Alta (cierre de terminal, reinicio de PC)
- Si está en servidor con PM2: Baja-Media
- Si está en Cloud Run/Render: Baja (gestión automática)

**Impacto:** 🔴 CRÍTICO (la aplicación deja de funcionar completamente)

---

### 2. 🟡 MEDIO: Base de datos SQLite bloqueada o corrupta

**¿Qué pasa si falla?**
- ❌ No se pueden crear/leer recordatorios
- ❌ El scheduler no puede verificar recordatorios activos
- ❌ Posible pérdida de datos si el archivo se corrompe
- ⚠️ Si múltiples instancias intentan escribir: errores de "database locked"

**Probabilidad:** Media
- SQLite no es ideal para múltiples procesos concurrentes
- En producción con alta concurrencia: Alta
- En desarrollo local: Baja

**Impacto:** 🟡 MEDIO (parcial, algunos endpoints fallan)

---

### 3. 🟡 MEDIO: Servicio Twilio temporalmente no disponible

**¿Qué pasa si falla?**
- ❌ No se pueden enviar mensajes (pero el scheduler seguirá intentando)
- ⚠️ Se acumulan reintentos (ya tenemos 3 reintentos configurados)
- ⚠️ Los recordatorios se "pierden" si Twilio falla por más de la ventana de ejecución
- ✅ Los recordatorios "daily" y "monthly" se recuperan al siguiente ciclo

**Probabilidad:** Baja (Twilio es muy confiable, pero no 100%)
- Fallas raras en API de Twilio
- Rate limits si se excede el límite
- Problemas de red intermitentes

**Impacto:** 🟡 MEDIO (parcial, afecta solo envíos)

---

### 4. 🟠 MEDIO-ALTO: ngrok se detiene (solo desarrollo local)

**¿Qué pasa si falla?**
- ❌ Los webhooks de Twilio no llegan al servidor local
- ❌ No se reciben respuestas (no se reenvían mensajes)
- ❌ La URL pública cambia si se reinicia ngrok
- ⚠️ Hay que reconfigurar el webhook en Twilio Console

**Probabilidad:** Alta (si se usa ngrok local)
- ngrok gratuito puede tener límites
- Reinicio de PC/cierre de terminal

**Impacto:** 🟠 MEDIO-ALTO (afecta solo recepción de mensajes en desarrollo)

---

### 5. 🟢 BAJO: Pérdida de datos (backup)

**¿Qué pasa si falla?**
- ❌ Archivo `dev.db` se corrompe o se elimina
- ❌ Se pierden todos los recordatorios y mensajes
- ⚠️ No hay backup automático actualmente

**Probabilidad:** Baja (pero posible con errores de sistema)
**Impacto:** 🟢 BAJO (crítico si pasa, pero fácil de prevenir)

---

## 🛡️ SOLUCIONES Y MITIGACIONES

### ✅ SOLUCIÓN 1: PM2 - Process Manager (Servidor Express)

**Problema resuelto:** Servidor se detiene

**Qué es PM2:**
- Gestor de procesos para Node.js
- Reinicia automáticamente si el proceso falla
- Mantiene el proceso vivo después de cerrar la terminal
- Monitorea uso de recursos

**Instalación:**
```bash
npm install -g pm2
```

**Uso:**
```bash
# Compilar primero
npm run build

# Iniciar con PM2
pm2 start dist/server.js --name whatsapp-reminders

# Ver estado
pm2 status

# Ver logs
pm2 logs whatsapp-reminders

# Reiniciar
pm2 restart whatsapp-reminders

# Detener
pm2 stop whatsapp-reminders

# Configurar para iniciar al arrancar el sistema
pm2 startup
pm2 save
```

**Ventajas:**
- ✅ Reinicio automático si falla
- ✅ Continúa corriendo después de cerrar terminal
- ✅ Monitoreo de recursos (CPU, memoria)
- ✅ Logs centralizados
- ✅ Clustering opcional

**Configuración avanzada (`ecosystem.config.js`):**
```javascript
module.exports = {
  apps: [{
    name: 'whatsapp-reminders',
    script: 'dist/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M',
    env: {
      NODE_ENV: 'production'
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

**Uso con archivo de configuración:**
```bash
pm2 start ecosystem.config.js
```

---

### ✅ SOLUCIÓN 2: Health Checks y Monitoreo

**Problema resuelto:** Detectar fallos antes de que causen problemas

**Implementación de Health Check mejorado:**

Ya tenemos `/health`, pero podemos mejorarlo:

```typescript
// src/routes/health.ts
import { Router, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

router.get("/health", async (req: Request, res: Response) => {
  const checks = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    checks: {
      database: "unknown",
      scheduler: "unknown",
      twilio: "unknown"
    }
  };

  // Verificar base de datos
  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.checks.database = "ok";
  } catch (error) {
    checks.checks.database = "error";
    checks.status = "error";
  }

  // Verificar scheduler (asumiendo que está activo si llegamos aquí)
  checks.checks.scheduler = "ok";

  // Verificar Twilio (ping básico)
  checks.checks.twilio = "ok"; // Simplificado

  const statusCode = checks.status === "ok" ? 200 : 503;
  return res.status(statusCode).json(checks);
});

export default router;
```

**Monitoreo con servicios externos:**
- **UptimeRobot** (gratis): HTTP monitoring cada 5 minutos
- **Pingdom**: Monitoreo profesional
- **StatusCake**: Alternativa gratuita

**Configuración UptimeRobot:**
1. Crear cuenta en uptimerobot.com
2. Agregar monitor tipo "HTTP(s)"
3. URL: `https://tu-dominio.com/health`
4. Alerta si no responde en 5 minutos

---

### ✅ SOLUCIÓN 3: Base de Datos en Producción (PostgreSQL)

**Problema resuelto:** SQLite no es ideal para producción concurrente

**Migración a PostgreSQL:**

**1. Actualizar `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**2. Variables de entorno:**
```env
# Producción
DATABASE_URL="postgresql://usuario:password@host:5432/whatsapp_reminders?schema=public"
```

**3. Opciones de hosting PostgreSQL:**
- **Render** (gratis): PostgreSQL gratuito incluido
- **Railway**: PostgreSQL incluido
- **Supabase**: PostgreSQL gratuito
- **Neon**: PostgreSQL serverless

**4. Migración de datos:**
```bash
# Exportar desde SQLite
sqlite3 prisma/dev.db .dump > backup.sql

# Importar a PostgreSQL (requiere conversión manual o script)
```

**Ventajas:**
- ✅ Soporta múltiples conexiones simultáneas
- ✅ Más confiable para producción
- ✅ Backup automático en la mayoría de servicios
- ✅ Mejor rendimiento con muchos datos

---

### ✅ SOLUCIÓN 4: Backup Automático de Base de Datos

**Problema resuelto:** Pérdida de datos

**Script de backup automático (`backup-db.ps1`):**
```powershell
# Script de backup para Windows
$backupDir = ".\backups"
$dbFile = ".\prisma\dev.db"
$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFile = "$backupDir\dev_$timestamp.db"

if (!(Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir
}

Copy-Item $dbFile $backupFile
Write-Host "Backup creado: $backupFile" -ForegroundColor Green

# Mantener solo últimos 10 backups
Get-ChildItem $backupDir | Sort-Object LastWriteTime -Descending | Select-Object -Skip 10 | Remove-Item
```

**Programar backup diario (Task Scheduler de Windows):**
1. Abrir "Programador de tareas"
2. Crear tarea básica
3. Trigger: Diario, a las 2:00 AM
4. Acción: Ejecutar script PowerShell
5. Configurar para ejecutar incluso si el usuario no está conectado

**Para PostgreSQL (en producción):**
- La mayoría de servicios (Render, Railway) incluyen backups automáticos
- Configurar backup manual adicional si es necesario

---

### ✅ SOLUCIÓN 5: Manejo de Errores Mejorado y Reintentos

**Problema resuelto:** Fallos temporales no deben detener la aplicación

**Ya implementado:**
- ✅ Reintentos en scheduler (3 intentos con backoff)
- ✅ Manejo de errores en rutas

**Mejoras adicionales:**

**1. Queue System para mensajes fallidos:**
```typescript
// src/services/queue.ts
interface FailedMessage {
  reminderId: string;
  attempt: number;
  error: string;
  nextRetry: Date;
}

const failedMessages: FailedMessage[] = [];

export const addToRetryQueue = (reminderId: string, error: string) => {
  const failed: FailedMessage = {
    reminderId,
    attempt: 1,
    error,
    nextRetry: new Date(Date.now() + 60000) // Retry en 1 minuto
  };
  failedMessages.push(failed);
};

// Verificar cola cada minuto
cron.schedule("* * * * *", async () => {
  const now = new Date();
  const toRetry = failedMessages.filter(m => m.nextRetry <= now);
  
  for (const msg of toRetry) {
    // Intentar reenviar
    // Si falla, incrementar attempt y actualizar nextRetry
  }
});
```

**2. Circuit Breaker para Twilio:**
```typescript
// src/utils/circuit-breaker.ts
class CircuitBreaker {
  private failures = 0;
  private lastFailureTime: Date | null = null;
  private state: 'closed' | 'open' | 'half-open' = 'closed';
  
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.state === 'open') {
      if (Date.now() - this.lastFailureTime!.getTime() > 60000) {
        this.state = 'half-open';
      } else {
        throw new Error('Circuit breaker is open');
      }
    }
    
    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }
  
  private onSuccess() {
    this.failures = 0;
    this.state = 'closed';
  }
  
  private onFailure() {
    this.failures++;
    this.lastFailureTime = new Date();
    if (this.failures >= 5) {
      this.state = 'open';
    }
  }
}
```

---

### ✅ SOLUCIÓN 6: Deployment en Plataformas con Alta Disponibilidad

**Problema resuelto:** Gestión manual del servidor

**Opciones de hosting:**

#### **Render.com** (Recomendado para inicio)
- ✅ Reinicio automático si falla
- ✅ Health checks automáticos
- ✅ PostgreSQL gratuito incluido
- ✅ Variables de entorno fáciles de configurar
- ✅ Deploy automático desde Git
- ✅ Logs centralizados
- ⚠️ Plan gratuito: se "duerme" después de 15 min de inactividad

**Configuración:**
```
Build Command: npm install && npm run build && npm run db:generate && npm run db:migrate
Start Command: npm start
```

#### **Railway.app**
- ✅ Similar a Render
- ✅ No se duerme (mejor para scheduler)
- ✅ PostgreSQL incluido
- ⚠️ Plan gratuito con límites de uso

#### **Cloud Run (Google Cloud)**
- ✅ Escalado automático
- ✅ Alta disponibilidad
- ✅ Health checks
- ⚠️ Más complejo de configurar
- ⚠️ Requiere cuenta de Google Cloud

**Ventajas de estas plataformas:**
- ✅ Reinicio automático si falla
- ✅ Monitoreo integrado
- ✅ Logs centralizados
- ✅ Deploy automático desde Git
- ✅ Certificados SSL automáticos
- ✅ No necesitas gestionar el servidor manualmente

---

### ✅ SOLUCIÓN 7: Sistema de Alertas

**Problema resuelto:** Ser notificado cuando algo falla

**Implementación:**

**1. Alertas por email/logs:**
```typescript
// src/utils/alerts.ts
export const sendAlert = async (message: string, severity: 'error' | 'warning') => {
  console.error(`[ALERT ${severity.toUpperCase()}] ${message}`);
  
  // En producción, integrar con servicio de alertas
  // Ejemplo: SendGrid, Mailgun, o servicios como PagerDuty
};
```

**2. Integrar en puntos críticos:**
```typescript
// En scheduler.ts
catch (error) {
  await sendAlert(`Scheduler falló al enviar recordatorio ${reminder.id}: ${error.message}`, 'error');
}

// En webhooks.ts
catch (error) {
  await sendAlert(`Webhook falló: ${error.message}`, 'error');
}
```

**3. Servicios de alertas:**
- **SendGrid/Mailgun**: Email alerts
- **Discord/Slack Webhooks**: Notificaciones en tiempo real
- **Telegram Bot**: Alertas en Telegram

---

## 📊 MATRIZ DE RIESGOS Y SOLUCIONES

| Riesgo | Probabilidad | Impacto | Solución Principal | Solución Secundaria |
|--------|-------------|---------|-------------------|---------------------|
| Servidor Express se detiene | Media-Alta | 🔴 Crítico | PM2 / Hosting automático | Health checks + alertas |
| SQLite bloqueado/corrupto | Media | 🟡 Medio | Migrar a PostgreSQL | Backup automático |
| Twilio no disponible | Baja | 🟡 Medio | Reintentos (ya implementado) | Circuit breaker + queue |
| ngrok se detiene | Alta (local) | 🟠 Medio-Alto | Deploy a producción | Usar servicio persistente |
| Pérdida de datos | Baja | 🟢 Bajo | Backup automático | PostgreSQL con backup |

---

## 🚀 PLAN DE ACCIÓN RECOMENDADO

### **Para Desarrollo Local (Inmediato):**
1. ✅ Usar PM2 para mantener el servidor vivo
2. ✅ Configurar backup diario de base de datos
3. ✅ Usar ngrok con authtoken (más estable)

### **Para Producción (Corto plazo):**
1. ✅ Deploy a Render/Railway (alta disponibilidad)
2. ✅ Migrar a PostgreSQL
3. ✅ Configurar health checks externos (UptimeRobot)
4. ✅ Implementar alertas (email/Discord)

### **Para Producción (Largo plazo):**
1. ✅ Implementar circuit breaker para Twilio
2. ✅ Queue system para mensajes fallidos
3. ✅ Monitoreo avanzado (datadog, new relic)
4. ✅ Backup automático con retención de 30 días

---

## ✅ CHECKLIST DE CONFIANZA

### **Configuración Mínima (Desarrollo):**
- [ ] PM2 instalado y configurado
- [ ] Backup automático de base de datos
- [ ] Health check `/health` funcionando
- [ ] Logs configurados

### **Configuración Recomendada (Producción):**
- [ ] Deploy a Render/Railway
- [ ] PostgreSQL configurado
- [ ] Health check externo (UptimeRobot)
- [ ] Variables de entorno seguras
- [ ] Backup automático configurado
- [ ] Alertas por email/Discord
- [ ] SSL/HTTPS configurado
- [ ] Webhook de Twilio configurado correctamente

### **Configuración Ideal (Producción Avanzada):**
- [ ] Circuit breaker implementado
- [ ] Queue system para reintentos
- [ ] Monitoreo avanzado (APM)
- [ ] Logs centralizados (Sentry, LogRocket)
- [ ] Rate limiting configurado
- [ ] Database connection pooling
- [ ] CDN para assets estáticos (si hay frontend)

---

## 📝 CONCLUSIÓN

**Riesgo actual:** 🟡 MEDIO-ALTO
- Si el servidor se detiene manualmente, la aplicación deja de funcionar
- SQLite puede tener problemas con concurrencia
- ngrok local no es confiable para producción

**Con las soluciones implementadas:** 🟢 BAJO
- PM2 mantiene el proceso vivo
- Hosting automático reinicia si falla
- PostgreSQL es más confiable
- Monitoreo detecta problemas temprano
- Alertas notifican fallos inmediatamente

**Recomendación inmediata:**
1. **Instalar PM2** para desarrollo local
2. **Deploy a Render/Railway** para producción
3. **Migrar a PostgreSQL** cuando vayas a producción
4. **Configurar UptimeRobot** para monitoreo

¿Quieres que implemente alguna de estas soluciones ahora?
