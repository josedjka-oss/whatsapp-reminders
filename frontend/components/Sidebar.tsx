"use client";

import { useRouter } from "next/navigation";

interface SidebarProps {
  onNewChat: () => void;
}

export const Sidebar = ({ onNewChat }: SidebarProps) => {
  const router = useRouter();

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-300 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-300 space-y-2">
        <button
          onClick={onNewChat}
          className="w-full bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors font-medium"
        >
          Nuevo chat
        </button>
        <button
          onClick={() => router.push("/reminders/new")}
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors font-medium"
        >
          📅 Crear Recordatorio
        </button>
      </div>

      {/* Chat List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          <div className="p-3 rounded-lg bg-white hover:bg-gray-50 cursor-pointer border border-gray-200">
            <div className="font-medium text-gray-900">Asistente</div>
            <div className="text-xs text-gray-500 mt-1">Asistente IA</div>
          </div>
        </div>
      </div>
    </div>
  );
};
