import { useState, useEffect, useRef } from "react";
import { useWebSocket } from "../hooks/useWebSocket";
import { useQuery } from "@tanstack/react-query";
import { messageAPI } from "../services/messageService";
import { useAuth } from "../hooks/useAuth";
import type { Message } from "../types";

interface ChatRoomProps {
  roomId: string;
}

export const ChatRoom = ({ roomId }: ChatRoomProps) => {
  const { user } = useAuth();
  const [inputMessage, setInputMessage] = useState("");
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isTypingRef = useRef(false);
  const hasLoadedHistory = useRef(false);

  // Fetch message history
  const { data: historyData } = useQuery({
    queryKey: ["messages", roomId],
    queryFn: () => messageAPI.getHistory(roomId),
    enabled: !!roomId,
  });

  // WebSocket connection with message handler
  const { isConnected, sendMessage } = useWebSocket({
    roomId,
    onMessage: (message: Message) => {
      // Add message directly in callback to avoid duplicates
      if (message.type !== "typing") {
        setAllMessages((prev) => {
          // Check if message already exists
          const exists = prev.some(
            (m) =>
              m.id === message.id ||
              (m.content === message.content &&
                m.user_id === message.user_id &&
                m.created_at === message.created_at)
          );
          if (exists) return prev;
          return [...prev, message];
        });
      }
    },
  });

  // Load history only once
  useEffect(() => {
    if (historyData?.messages && !hasLoadedHistory.current) {
      setAllMessages(historyData.messages.reverse());
      hasLoadedHistory.current = true;
    }
  }, [historyData]);

  // Reset when room changes
  useEffect(() => {
    setAllMessages([]);
    hasLoadedHistory.current = false;
  }, [roomId]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputMessage.trim() && isConnected) {
      sendMessage(inputMessage, "message");
      setInputMessage("");
      isTypingRef.current = false;
    }
  };

  const handleTyping = () => {
    if (!isConnected) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    if (!isTypingRef.current) {
      sendMessage("is typing...", "typing");
      isTypingRef.current = true;
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
    }, 3000);
  };

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow">
      {/* Header */}
      <div className="bg-blue-500 text-white p-4 rounded-t-lg">
        <h2 className="text-xl font-bold">#{roomId}</h2>
        <p className="text-sm">
          {isConnected ? (
            <span className="text-green-200">● Connected</span>
          ) : (
            <span className="text-red-200">● Disconnected</span>
          )}
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
        {allMessages.map((msg, index) => {
          const isOwnMessage = msg.user_id === user?.id;
          const isSystemMessage =
            msg.type === "user_joined" || msg.type === "user_left";

          if (isSystemMessage) {
            return (
              <div
                key={`system-${index}-${msg.created_at}`}
                className="text-center"
              >
                <span className="text-xs text-gray-500 bg-gray-200 px-3 py-1 rounded-full">
                  {msg.content}
                </span>
              </div>
            );
          }

          return (
            <div
              key={msg.id ? `msg-${msg.id}` : `temp-${index}-${msg.created_at}`}
              className={`flex ${
                isOwnMessage ? "justify-end" : "justify-start"
              } animate-fade-in`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg shadow-sm ${
                  isOwnMessage
                    ? "bg-blue-500 text-white rounded-br-none"
                    : "bg-white text-gray-900 rounded-bl-none border border-gray-200"
                }`}
              >
                {!isOwnMessage && (
                  <p className="text-xs font-semibold mb-1 text-blue-600">
                    {msg.username}
                  </p>
                )}
                <p className="break-words">{msg.content}</p>
                <p
                  className={`text-xs mt-1 ${
                    isOwnMessage ? "text-blue-100" : "text-gray-500"
                  }`}
                >
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="border-t bg-white p-4 rounded-b-lg"
      >
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => {
              setInputMessage(e.target.value);
              handleTyping();
            }}
            placeholder="Type a message..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!isConnected || !inputMessage.trim()}
            className="bg-blue-500 text-white px-8 py-3 rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
};
