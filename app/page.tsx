"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { subscribeToMessages } from "@/lib/messages";
import type { ScheduledMessage } from "@/types/message";
import MessageCard from "@/components/MessageCard";
import QRScanner from "@/components/QRScanner";
// Note: date-fns locale import will be handled in components that need it

export default function Home() {
  const [messages, setMessages] = useState<ScheduledMessage[]>([]);
  const [filter, setFilter] = useState<"all" | "pending" | "sent">("all");

  useEffect(() => {
    const unsubscribe = subscribeToMessages((newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, []);

  const filteredMessages = messages.filter((msg) => {
    if (filter === "all") return true;
    return msg.status === filter;
  });

  const pendingMessages = messages.filter((msg) => msg.status === "pending");
  const sentMessages = messages.filter((msg) => msg.status === "sent");

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            WhatsApp Scheduler
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Programa y envía mensajes de WhatsApp automáticamente
          </p>
        </header>

        <div className="mb-6">
          <QRScanner />
        </div>

        <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex gap-2">
            <button
              onClick={() => setFilter("all")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              }`}
            >
              Todos ({messages.length})
            </button>
            <button
              onClick={() => setFilter("pending")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "pending"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              }`}
            >
              Pendientes ({pendingMessages.length})
            </button>
            <button
              onClick={() => setFilter("sent")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === "sent"
                  ? "bg-blue-600 text-white"
                  : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600"
              }`}
            >
              Enviados ({sentMessages.length})
            </button>
          </div>
          <button
            onClick={() => window.location.href = '/create.html'}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            + Nuevo Mensaje
          </button>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-12 text-center border border-gray-200 dark:border-gray-700">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No hay mensajes {filter !== "all" && filter === "pending" ? "pendientes" : filter === "sent" ? "enviados" : ""}
            </p>
            <button
              onClick={() => window.location.href = '/create.html'}
              className="mt-4 inline-block text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              Crear tu primer mensaje programado
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMessages.map((message) => (
              <MessageCard
                key={message.id}
                message={message}
                onDelete={() => {
                  setMessages((prev) =>
                    prev.filter((msg) => msg.id !== message.id)
                  );
                }}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
