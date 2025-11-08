"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { useAuthStore } from "@/lib/stores/authStore";
import type { Message } from "@/lib/types/api";

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
}

/**
 * Hook para manejar la conexión WebSocket a /conversations
 * Conecta automáticamente cuando el usuario está autenticado
 * Desconecta al desmontar o cuando el usuario se desautentica
 */
export function useWebSocket(): UseWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    // No conectar si no hay token
    if (!token) {
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
      return;
    }

    // Evitar múltiples conexiones
    if (socketRef.current?.connected) {
      return;
    }

    setIsConnecting(true);

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    if (!socketUrl) {
      console.error(
        "❌ [WebSocket] NEXT_PUBLIC_SOCKET_URL no está configurada",
      );
      setIsConnecting(false);
      return;
    }

    console.log("🔌 [WebSocket] Conectando a:", socketUrl);

    const socket = io(`${socketUrl}/conversations`, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      transports: ["websocket", "polling"],
    });

    // ===== Eventos de Conexión =====

    socket.on("connect", () => {
      console.log("✅ [WebSocket] Conectado al servidor");
      setIsConnected(true);
      setIsConnecting(false);
    });

    socket.on("disconnect", (reason) => {
      console.log("⚠️  [WebSocket] Desconectado:", reason);
      setIsConnected(false);
    });

    socket.on("error", (error) => {
      console.error("❌ [WebSocket] Error:", error);
      setIsConnecting(false);
    });

    socket.on("connect_error", (error) => {
      console.error("❌ [WebSocket] Error de conexión:", error);
      setIsConnecting(false);
    });

    // ===== Eventos de Mensajes =====

    /**
     * Evento: new-message
     * Recibido cuando otra persona envía un mensaje en la conversación
     */
    socket.on("new-message", (message: Message) => {
      console.log("💬 [WebSocket] Nuevo mensaje recibido:", message);

      // Validar estructura del mensaje
      if (!message?.id || !message?.conversationId || !message?.content) {
        console.error(
          "❌ [WebSocket] Mensaje inválido - falta estructura requerida:",
          message,
        );
        return;
      }

      // Actualizar cache de React Query con el nuevo mensaje
      queryClient.setQueryData(
        ["conversations", message.conversationId, "messages"],
        (old: Message[] | undefined) => {
          if (!old) return [message];
          // Evitar duplicados
          const isDuplicate = old.some((msg) => msg?.id === message.id);
          return isDuplicate ? old : [...old, message];
        },
      );

      // Opcional: Mostrar notificación
      if (typeof window !== "undefined" && "Notification" in window) {
        new Notification("Nuevo mensaje", {
          body: message.content,
          icon: "/logo.svg",
        });
      }
    });

    /**
     * Evento: user-typing
     * Recibido cuando el otro usuario está escribiendo
     */
    socket.on(
      "user-typing",
      (data: { conversationId?: string; userId?: string }) => {
        // Validar estructura del evento
        if (!data?.conversationId || !data?.userId) {
          console.warn(
            "⚠️ [WebSocket] Evento user-typing con estructura inválida:",
            data,
          );
          return;
        }
        const { conversationId, userId } = data;
        console.log(
          `⌨️  [WebSocket] ${userId} está escribiendo en ${conversationId}`,
        );
        // El componente ChatWindow escuchará este evento a través del hook
      },
    );

    /**
     * Evento: user-stop-typing
     * Recibido cuando el otro usuario deja de escribir
     */
    socket.on("user-stop-typing", (data: { userId?: string }) => {
      // Validar estructura del evento
      if (!data?.userId) {
        console.warn(
          "⚠️ [WebSocket] Evento user-stop-typing con estructura inválida:",
          data,
        );
        return;
      }
      const { userId } = data;
      console.log(`⌨️  [WebSocket] ${userId} dejó de escribir`);
    });

    /**
     * Evento: match:updated
     * Recibido cuando el estado de un match cambia (ej: charter acepta/rechaza)
     */
    socket.on(
      "match:updated",
      (data: { matchId?: string; status?: string }) => {
        // Validar estructura del evento
        if (!data?.matchId || !data?.status) {
          console.warn(
            "⚠️ [WebSocket] Evento match:updated con estructura inválida:",
            data,
          );
          return;
        }

        const { matchId, status } = data;
        console.log(`🔄 [WebSocket] Match ${matchId} actualizado: ${status}`);

        // Invalidar queries relacionadas a matches cuando el estado cambia
        queryClient.invalidateQueries({ queryKey: ["userMatches"] });
        queryClient.invalidateQueries({ queryKey: ["charterMatches"] });
        queryClient.invalidateQueries({ queryKey: ["match", matchId] });
      },
    );

    socketRef.current = socket;

    // Cleanup: desconectar al desmontar o cuando cambie el token
    return () => {
      console.log("🔌 [WebSocket] Limpieza de conexión");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setIsConnected(false);
    };
  }, [token, queryClient]);

  return {
    socket: socketRef.current,
    isConnected,
    isConnecting,
  };
}

/**
 * Hook personalizado para usar la instancia de socket en un componente
 * Útil para emitir eventos desde componentes
 */
export function useSocketEmit() {
  const { socket } = useWebSocket();

  return {
    joinConversation: (conversationId: string) => {
      if (socket?.connected) {
        console.log("📍 [WebSocket] Uniéndose a conversación:", conversationId);
        socket.emit("join-conversation", { conversationId });
      }
    },

    sendMessage: (conversationId: string, content: string) => {
      if (socket?.connected) {
        console.log("💬 [WebSocket] Enviando mensaje:", content);
        socket.emit("send-message", { conversationId, content });
      } else {
        console.warn(
          "⚠️  [WebSocket] No conectado. No se puede enviar mensaje.",
        );
      }
    },

    notifyTyping: (conversationId: string) => {
      if (socket?.connected) {
        socket.emit("typing", { conversationId });
      }
    },

    notifyStopTyping: (conversationId: string) => {
      if (socket?.connected) {
        socket.emit("stop-typing", { conversationId });
      }
    },
  };
}

/**
 * Hook para suscribirse a cambios de estado de un match específico
 * Útil para la página de matching para detectar cuando charter acepta
 */
export function useMatchUpdateListener(
  matchId: string | undefined,
  onMatchUpdated?: (status: string) => void,
): void {
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket?.connected || !matchId) {
      return;
    }

    const handleMatchUpdate = (data: { matchId?: string; status?: string }) => {
      if (data?.matchId === matchId && data?.status) {
        console.log(
          `📬 [MATCH LISTENER] Match ${matchId} actualizado: ${data.status}`,
        );
        onMatchUpdated?.(data.status);
      }
    };

    socket.on("match:updated", handleMatchUpdate);

    return () => {
      socket.off("match:updated", handleMatchUpdate);
    };
  }, [socket, matchId, onMatchUpdated]);
}
