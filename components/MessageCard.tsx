"use client";

import { format } from "date-fns";
import type { ScheduledMessage } from "@/types/message";
import { deleteScheduledMessage } from "@/lib/messages";
import { useState } from "react";

interface MessageCardProps {
  message: ScheduledMessage;
  onDelete: () => void;
}

const MessageCard = ({ message, onDelete }: MessageCardProps) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("¿Estás seguro de que deseas eliminar este mensaje?")) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteScheduledMessage(message.id);
      onDelete();
    } catch (error) {
      console.error("Error al eliminar mensaje:", error);
      alert("Error al eliminar el mensaje");
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "sent":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "error":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "pending":
        return "Pendiente";
      case "sent":
        return "Enviado";
      case "error":
        return "Error";
      default:
        return status;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-semibold text-lg text-gray-900 dark:text-white">
              {message.phoneNumber}
            </span>
            <span
              className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                message.status
              )}`}
            >
              {getStatusText(message.status)}
            </span>
            {message.type !== "unique" && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                {message.type === "daily"
                  ? "Diario"
                  : message.type === "biweekly"
                  ? "Cada 2 semanas"
                  : "Mensual"}
              </span>
            )}
          </div>
          <p className="text-gray-700 dark:text-gray-300 mb-3">
            {message.message}
          </p>
          <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
            <p>
              <span className="font-medium">Programado para:</span>{" "}
              {format(message.scheduledDate, "dd/MM/yyyy 'a las' HH:mm")}
            </p>
            {message.sentAt && (
              <p>
                <span className="font-medium">Enviado:</span>{" "}
                {format(message.sentAt, "dd/MM/yyyy 'a las' HH:mm")}
              </p>
            )}
            {message.errorMessage && (
              <p className="text-red-600 dark:text-red-400">
                <span className="font-medium">Error:</span> {message.errorMessage}
              </p>
            )}
          </div>
        </div>
        {message.status === "pending" && (
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="ml-4 px-3 py-1 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50"
            aria-label="Eliminar mensaje"
          >
            {isDeleting ? "Eliminando..." : "Eliminar"}
          </button>
        )}
      </div>
    </div>
  );
};

export default MessageCard;
