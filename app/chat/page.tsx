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

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput("");
    setIsLoading(true);

    // Agregar mensaje del usuario
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);

    try {
      // En producción, usar la misma URL (Next.js y Express están en el mismo servidor)
      // En desarrollo, usar localhost:3000
      const apiUrl = typeof window !== "undefined" 
        ? window.location.origin 
        : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000");
      const authToken = localStorage.getItem("whatsapp_reminders_auth_token") || process.env.ADMIN_PASSWORD || "";

      const response = await fetch(`${apiUrl}/api/ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ text: userMessage }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          // No autenticado, pedir password
          setIsAuthenticated(false);
          setMessages((prev) => [
            ...prev,
            {
              role: "assistant",
              content: "Por favor, ingresa tu contraseña para continuar.",
            },
          ]);
          return;
        }
        throw new Error("Error en la respuesta del servidor");
      }

      const data = await response.json();

      // Agregar respuesta del asistente
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: data.reply,
          actions: data.actions,
        },
      ]);
    } catch (error: any) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `Lo siento, ocurrió un error: ${error.message}. Por favor, intenta de nuevo.`,
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            WhatsApp Reminders
          </h1>
          <p className="text-gray-600 mb-6">
            Ingresa tu contraseña para acceder
          </p>
          <form onSubmit={handleLogin}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Contraseña"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
              required
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Ingresar
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <h1 className="text-xl font-bold text-gray-800">
            💬 WhatsApp Reminders Chat
          </h1>
          <p className="text-sm text-gray-600">
            Gestiona tus recordatorios con lenguaje natural
          </p>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto max-w-4xl w-full mx-auto px-4 py-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-3 ${
                message.role === "user"
                  ? "bg-blue-600 text-white"
                  : "bg-white text-gray-800 shadow-md"
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.actions && message.actions.length > 0 && (
                <div className="mt-3 space-y-2">
                  {message.actions.map((action, actionIndex) => (
                    <div
                      key={actionIndex}
                      className={`text-xs px-2 py-1 rounded ${
                        action.type === "created"
                          ? "bg-green-100 text-green-800"
                          : action.type === "canceled"
                          ? "bg-orange-100 text-orange-800"
                          : action.type === "error"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {action.summary}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white rounded-lg px-4 py-3 shadow-md">
              <div className="flex items-center space-x-2 text-gray-600">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.4s" }}></div>
                <span className="ml-2">Pensando...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <form onSubmit={handleSend} className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu instrucción aquí..."
              className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              Enviar
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
