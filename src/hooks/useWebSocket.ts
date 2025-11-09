import { useEffect, useRef, useCallback, useState } from "react";
import { useAuthStore } from "../store/authStore";
import type { Message } from "../types";

interface UseWebSocketOptions {
  roomId: string;
  onMessage?: (message: Message) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

export const useWebSocket = ({
  roomId,
  onMessage,
  onConnect,
  onDisconnect,
}: UseWebSocketOptions) => {
  const { token, user } = useAuthStore();
  const [isConnected, setIsConnected] = useState(false);
  const ws = useRef<WebSocket | null>(null);
  const isConnecting = useRef(false);
  const hasConnected = useRef(false);

  const disconnect = useCallback(() => {
    if (ws.current) {
      ws.current.close(1000, "Component unmounting");
      ws.current = null;
    }
    setIsConnected(false);
    isConnecting.current = false;
    hasConnected.current = false;
  }, []);

  const connect = useCallback(() => {
    if (
      !token ||
      !user ||
      !roomId ||
      isConnecting.current ||
      hasConnected.current
    ) {
      return;
    }

    isConnecting.current = true;
    const wsUrl = `ws://localhost:8080/api/v1/ws?room_id=${roomId}&username=${user.username}&token=${token}`;

    console.log("🔄 Connecting to:", roomId);

    try {
      const socket = new WebSocket(wsUrl);

      socket.addEventListener("open", () => {
        console.log("✅ Connected:", roomId);
        setIsConnected(true);
        isConnecting.current = false;
        hasConnected.current = true;
        onConnect?.();
      });

      socket.addEventListener("message", (event) => {
        try {
          const message: Message = JSON.parse(event.data);
          console.log("📨 Received:", message);
          // Call the onMessage callback directly - don't store in state
          onMessage?.(message);
        } catch (error) {
          console.error("Error parsing message:", error);
        }
      });

      socket.addEventListener("close", (event) => {
        console.log("🔌 Closed:", event.code);
        setIsConnected(false);
        isConnecting.current = false;
        onDisconnect?.();
      });

      socket.addEventListener("error", (error) => {
        console.error("❌ WebSocket error:", error);
        isConnecting.current = false;
      });

      ws.current = socket;
    } catch (error) {
      console.error("Failed to create WebSocket:", error);
      isConnecting.current = false;
    }
  }, [token, user, roomId, onMessage, onConnect, onDisconnect]);

  const sendMessage = useCallback(
    (content: string, type: string = "message") => {
      if (ws.current?.readyState === WebSocket.OPEN) {
        const message = {
          type,
          content,
          room_id: roomId,
        };
        console.log("📤 Sending:", message);
        ws.current.send(JSON.stringify(message));
      }
    },
    [roomId]
  );

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [roomId]);

  return {
    isConnected,
    sendMessage,
    disconnect,
  };
};
