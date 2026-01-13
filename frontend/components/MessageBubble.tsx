"use client";

import { format } from "date-fns";
import { es } from "date-fns/locale";

interface MessageBubbleProps {
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export const MessageBubble = ({ text, isUser, timestamp }: MessageBubbleProps) => {
  const formattedTime = format(timestamp, "HH:mm", { locale: es });

  return (
    <div className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-2`}>
      <div
        className={`max-w-[70%] rounded-lg px-4 py-2 ${
          isUser
            ? "bg-green-500 text-white rounded-tr-none"
            : "bg-gray-200 text-gray-900 rounded-tl-none"
        }`}
      >
        <p className="text-sm whitespace-pre-wrap break-words">{text}</p>
        <p
          className={`text-xs mt-1 ${
            isUser ? "text-green-100" : "text-gray-500"
          }`}
        >
          {formattedTime}
        </p>
      </div>
    </div>
  );
};
