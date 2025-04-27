import { useState, useEffect, useCallback, useRef } from "react";
import { useToast } from "@/hooks/use-toast";

interface UseSocketReturn {
  connectWebSocket: (userId: string) => void;
  disconnectWebSocket: () => void;
  isConnected: boolean;
  sendMessage: (data: any) => void;
}

export function useSocket(): UseSocketReturn {
  const [isConnected, setIsConnected] = useState(false);
  const webSocketRef = useRef<WebSocket | null>(null);
  const { toast } = useToast();

  const connectWebSocket = useCallback((userId: string) => {
    if (webSocketRef.current) {
      disconnectWebSocket();
    }

    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    webSocketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      // Authenticate the WebSocket connection with the user ID
      ws.send(JSON.stringify({ type: "AUTH", userId }));
    };

    ws.onclose = () => {
      setIsConnected(false);
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
      setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        
        // Handle different message types
        if (data.type === "NOTIFICATION") {
          handleNotification(data.payload);
        }
      } catch (error) {
        console.error("Failed to parse WebSocket message:", error);
      }
    };
  }, []);

  const disconnectWebSocket = useCallback(() => {
    if (webSocketRef.current) {
      webSocketRef.current.close();
      webSocketRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((data: any) => {
    if (webSocketRef.current && isConnected) {
      webSocketRef.current.send(JSON.stringify(data));
    } else {
      console.warn("WebSocket is not connected");
    }
  }, [isConnected]);

  const handleNotification = useCallback((notification: any) => {
    // Show a toast notification
    toast({
      title: notification.type === "follow" 
        ? "New Follower" 
        : notification.type === "like" 
        ? "New Like" 
        : "New Comment",
      description: notification.content,
      duration: 5000,
    });
  }, [toast]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      disconnectWebSocket();
    };
  }, [disconnectWebSocket]);

  return {
    connectWebSocket,
    disconnectWebSocket,
    isConnected,
    sendMessage,
  };
}
