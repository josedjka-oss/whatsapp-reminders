"use client";

import { Sidebar } from "./Sidebar";
import { ChatWindow, Message } from "./ChatWindow";

interface ChatLayoutProps {
  messages: Message[];
  isLoading: boolean;
  onSend: (message: string) => void;
  onNewChat: () => void;
}

export const ChatLayout = ({
  messages,
  isLoading,
  onSend,
  onNewChat,
}: ChatLayoutProps) => {
  return (
    <div className="flex h-screen bg-gray-200">
      <Sidebar onNewChat={onNewChat} />
      <div className="flex-1 flex flex-col">
        <ChatWindow
          messages={messages}
          isLoading={isLoading}
          onSend={onSend}
        />
      </div>
    </div>
  );
};
