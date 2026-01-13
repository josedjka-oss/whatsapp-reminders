# WhatsApp Reminders - Frontend

Frontend Next.js para la aplicación de recordatorios de WhatsApp.

## 🚀 Despliegue en Vercel

### Prerrequisitos

1. Cuenta en [Vercel](https://vercel.com)
2. URL del backend en Render (ej: `https://whatsapp-reminders-mzex.onrender.com`)

### Pasos para Desplegar

1. **Instalar dependencias:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configurar variable de entorno:**
   - Crea un archivo `.env.local`:
     ```
     NEXT_PUBLIC_API_URL=https://whatsapp-reminders-mzex.onrender.com
     ```
   - O configúrala en Vercel después del despliegue

3. **Desplegar en Vercel:**
   
   **Opción A: Desde la CLI**
   ```bash
   npm install -g vercel
   vercel
   ```
   
   **Opción B: Desde GitHub**
   1. Conecta tu repositorio a Vercel
   2. Selecciona la carpeta `frontend` como Root Directory
   3. Agrega la variable de entorno:
      - Key: `NEXT_PUBLIC_API_URL`
      - Value: `https://tu-backend-en-render.onrender.com`
   4. Haz clic en "Deploy"

4. **Configurar CORS en el Backend:**
   
   En Render, agrega la variable de entorno:
   ```
   FRONTEND_URL=https://tu-app.vercel.app
   ```

## 🛠️ Desarrollo Local

```bash
cd frontend
npm install
npm run dev
```

Abre [http://localhost:3000/chat](http://localhost:3000/chat)

## 📝 Variables de Entorno

- `NEXT_PUBLIC_API_URL`: URL del backend en Render (requerida)

## 🔐 Autenticación

- Password por defecto: `2023`
- Se guarda en localStorage del navegador
