"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "assistant";
  content: string;
  actions?: Array<{ type: string; summary: string }>;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "¡Hola! Soy tu asistente para gestionar recordatorios de WhatsApp. Puedes decirme cosas como:\n\n• \"Enviar un mensaje a Juan todos los días a las 5 pm\"\n• \"Recuérdame todos los meses el día 15 pagar el recibo\"\n• \"¿Qué recordatorios tengo activos?\"\n• \"Cancela el recordatorio de Juan\"\n\n¿En qué puedo ayudarte?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // URL del proxy en Vercel (no llamar directo al backend)
  const API_URL = "/api/chat";
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking");

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Verificar si ya está autenticado (localStorage)
  useEffect(() => {
    const savedAuth = localStorage.getItem("whatsapp_reminders_auth");
    if (savedAuth === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Probar conexión al proxy
  const testConnection = async () => {
    setConnectionStatus("checking");
    try {
      // Probar el proxy con un mensaje de prueba
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: "test" }),
      });
      if (response.ok) {
        setConnectionStatus("connected");
      } else {
        setConnectionStatus("error");
      }
    } catch (error) {
      console.error("Error probando conexión:", error);
      setConnectionStatus("error");
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      testConnection();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Password fijo por ahora: 2023
    if (password === "2023") {
      localStorage.setItem("whatsapp_reminders_auth", "true");
      localStorage.setItem("whatsapp_reminders_auth_token", "2023");
      setIsAuthenticated(true);
    } else {
      alert("Contraseña incorrecta");
      setPassword("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Agregar mensaje del usuario
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      // Llamar al proxy de Vercel (no necesita autenticación, el proxy la maneja)
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: userMessage }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.reply || errorData.error || errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      const aiMessage: Message = {
        role: "assistant",
        content: data.reply,
        actions: data.actions,
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("Error al comunicarse con la IA:", error);
      const errorMessage: Message = {
        role: "assistant",
        content: `Lo siento, hubo un error: ${error.message}. Por favor, inténtalo de nuevo.`,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md">
          <h2 className="text-2xl font-bold mb-4">Ingresar Contraseña</h2>
          <input
            type="password"
            className="w-full p-2 border border-gray-300 rounded mb-4"
            placeholder="Contraseña de administrador"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button
            type="submit"
            className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
          >
            Ingresar
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-600 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Asistente de Recordatorios AI</h1>
          <button
            onClick={testConnection}
            className={`px-3 py-1 rounded text-sm ${
              connectionStatus === "connected"
                ? "bg-green-500 hover:bg-green-600"
                : connectionStatus === "error"
                ? "bg-red-500 hover:bg-red-600"
                : "bg-gray-500 hover:bg-gray-600"
            }`}
            title="Probar conexión con el backend"
          >
            {connectionStatus === "checking" ? "🔄" : connectionStatus === "connected" ? "✅" : "❌"}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-md p-3 rounded-lg shadow-md ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-white text-gray-800"
              }`}
            >
              <p className="whitespace-pre-line">{msg.content}</p>
              {msg.actions && msg.actions.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {msg.actions.map((action, actionIndex) => {
                    // Mostrar needs_clarification de forma especial
                    if (action.type === "needs_clarification") {
                      return (
                        <div
                          key={actionIndex}
                          className="w-full mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg"
                        >
                          <p className="text-sm text-blue-800 font-semibold mb-2">💬 Necesito más información:</p>
                          <p className="text-sm text-blue-700 whitespace-pre-line">{action.summary}</p>
                          <p className="text-xs text-blue-600 mt-2 italic">Responde con el número de la opción que deseas.</p>
                        </div>
                      );
                    }
                    return (
                      <span
                        key={actionIndex}
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          action.type === "created"
                            ? "bg-green-200 text-green-800"
                            : action.type === "canceled"
                            ? "bg-red-200 text-red-800"
                            : action.type === "error"
                            ? "bg-red-200 text-red-800"
                            : "bg-yellow-200 text-yellow-800"
                        }`}
                      >
                        {action.summary}
                      </span>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="max-w-md p-3 rounded-lg shadow-md bg-white text-gray-800">
              <p>Pensando...</p>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </main>

      <footer className="bg-white p-4 shadow-lg">
        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            className="flex-1 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Escribe tu instrucción aquí..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading}
          >
            Enviar
          </button>
        </form>
      </footer>
    </div>
  );
}
