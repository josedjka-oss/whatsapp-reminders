"use client";

import { useState, useEffect } from "react";
import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

const QRScanner = () => {
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Cambiar a false inicialmente
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false); // Estado específico para inicialización

  const checkWhatsAppStatus = async () => {
    if (!functions) {
      return;
    }
    try {
      const getStatus = httpsCallable(functions, "getWhatsAppStatus");
      const result = await getStatus();
      const data = result.data as { connected: boolean; qr?: string };

      if (data.connected) {
        setIsConnected(true);
        setQrCode(null);
        setError(null);
        setIsInitializing(false);
      } else if (data.qr) {
        setIsConnected(false);
        setQrCode(data.qr);
        setError(null);
        setIsInitializing(false);
      } else {
        setIsConnected(false);
        setQrCode(null);
      }
    } catch (err: any) {
      console.error("Error al verificar estado:", err);
      // No mostrar error en el check automático, solo en logs
    }
  };

  const initializeWhatsApp = async () => {
    if (!functions) {
      setError("Functions no está disponible");
      return;
    }
    try {
      setIsInitializing(true);
      setIsLoading(true);
      setError(null);
      const initialize = httpsCallable(functions, "initializeWhatsApp");
      const result = await initialize();
      const data = result.data as { qr?: string; connected?: boolean; error?: string; message?: string };

      if (data.error) {
        setError(data.error);
        setIsConnected(false);
        setQrCode(null);
        setIsLoading(false);
        setIsInitializing(false);
      } else if (data.connected) {
        setIsConnected(true);
        setQrCode(null);
        setError(null);
        setIsLoading(false);
        setIsInitializing(false);
      } else if (data.qr) {
        setQrCode(data.qr);
        setIsConnected(false);
        setError(null);
        setIsLoading(false);
        setIsInitializing(false);
      } else if (data.message && data.message.includes("Inicializando")) {
        // La inicialización está en progreso, hacer polling más frecuente
        setIsInitializing(true);
        setIsLoading(true);
        setError(null);
        let pollCount = 0;
        const maxPolls = 30; // 30 polls * 2 segundos = 60 segundos máximo
        
        // Hacer polling cada 2 segundos hasta que el QR esté disponible
        const pollInterval = setInterval(async () => {
          pollCount++;
          if (!functions) {
            clearInterval(pollInterval);
            setIsLoading(false);
            setIsInitializing(false);
            setError("Functions no está disponible");
            return;
          }
          try {
            const getStatus = httpsCallable(functions, "getWhatsAppStatus");
            const statusResult = await getStatus();
            const statusData = statusResult.data as { connected: boolean; qr?: string };

            if (statusData.connected) {
              setIsConnected(true);
              setQrCode(null);
              setError(null);
              setIsLoading(false);
              setIsInitializing(false);
              clearInterval(pollInterval);
            } else if (statusData.qr) {
              setQrCode(statusData.qr);
              setIsConnected(false);
              setError(null);
              setIsLoading(false);
              setIsInitializing(false);
              clearInterval(pollInterval);
            } else if (pollCount >= maxPolls) {
              // Timeout después de 60 segundos
              clearInterval(pollInterval);
              setIsLoading(false);
              setIsInitializing(false);
              setError("La inicialización está tardando demasiado. Intenta de nuevo.");
            }
          } catch (pollErr: any) {
            console.error("Error en polling:", pollErr);
            if (pollCount >= maxPolls) {
              clearInterval(pollInterval);
              setIsLoading(false);
              setIsInitializing(false);
              setError("Error al verificar el estado. Intenta de nuevo.");
            }
          }
        }, 2000);
      } else {
        setError("No se pudo generar el código QR. Intenta de nuevo.");
        setIsLoading(false);
        setIsInitializing(false);
      }
    } catch (err: any) {
      console.error("Error al inicializar WhatsApp:", err);
      setError(err.message || "Error al inicializar WhatsApp. Verifica que las Functions estén desplegadas.");
      setIsLoading(false);
      setIsInitializing(false);
    }
  };

  useEffect(() => {
    checkWhatsAppStatus();
    const interval = setInterval(checkWhatsAppStatus, 5000); // Verificar cada 5 segundos
    return () => clearInterval(interval);
  }, []);

  if (isConnected) {
    return (
      <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center">
        <div className="text-green-600 dark:text-green-400 font-semibold mb-2">
          ✓ WhatsApp conectado
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Tu cuenta de WhatsApp está vinculada y lista para enviar mensajes.
        </p>
        <button
          onClick={initializeWhatsApp}
          className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
        >
          Reconectar
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Conectar WhatsApp
      </h3>
      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}
      {qrCode ? (
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Escanea este código QR con WhatsApp:
          </p>
          <div className="flex justify-center mb-4">
            <img
              src={qrCode}
              alt="QR Code"
              className="border border-gray-300 dark:border-gray-600 rounded"
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            1. Abre WhatsApp en tu teléfono
            <br />
            2. Ve a Configuración → Dispositivos vinculados
            <br />
            3. Toca "Vincular un dispositivo"
            <br />
            4. Escanea este código QR
          </p>
        </div>
      ) : (
        <div className="text-center">
          {isInitializing || isLoading ? (
            <div className="flex flex-col items-center">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Inicializando WhatsApp...
              </p>
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                Esto puede tardar unos segundos
              </p>
            </div>
          ) : !error ? (
            <>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Inicia la conexión con WhatsApp
              </p>
              <button
                onClick={initializeWhatsApp}
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Generar código QR
              </button>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default QRScanner;
