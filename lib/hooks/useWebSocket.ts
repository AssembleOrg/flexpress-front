'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { io, type Socket } from 'socket.io-client';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/lib/stores/authStore';
import { queryKeys } from '@/lib/hooks/queries/queryFactory';
import { conversationKeys } from '@/lib/hooks/queries/useConversationQueries';
import type { Message } from '@/lib/types/api';

interface UseWebSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  isConnecting: boolean;
}

// Singleton a nivel de módulo — una sola conexión para toda la app.
// Esto evita que cada componente que llame useWebSocket() cree su propio socket.
let globalSocket: Socket | null = null;

// Cuántas instancias del hook están montadas actualmente.
// Solo cuando llega a 0 se desconecta el socket.
let mountCount = 0;

// Permite que hooks externos (ej: useConversationMessages) consulten el estado
// del socket sin suscribirse al ciclo de vida de React.
export function getSocketConnected(): boolean {
  return globalSocket?.connected ?? false;
}

/**
 * Hook para manejar la conexión WebSocket a /conversations.
 * Usa un singleton de módulo para garantizar una sola conexión activa.
 * Se inicializa en Providers.tsx para que el socket esté disponible en toda la app.
 */
export function useWebSocket(): UseWebSocketReturn {
  const socketRef = useRef<Socket | null>(globalSocket);
  const [isConnected, setIsConnected] = useState(globalSocket?.connected ?? false);
  const [isConnecting, setIsConnecting] = useState(false);
  const { token } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    mountCount++;

    // No conectar si no hay token
    if (!token) {
      if (globalSocket) {
        globalSocket.disconnect();
        globalSocket = null;
        socketRef.current = null;
      }
      setIsConnected(false);
      return () => { mountCount--; };
    }

    // Evitar múltiples conexiones — si el singleton ya está conectado, reutilizarlo
    if (globalSocket?.connected) {
      socketRef.current = globalSocket;
      setIsConnected(true);
      return () => { mountCount--; };
    }

    setIsConnecting(true);

    const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL;

    if (!socketUrl) {
      console.error(
        '❌ [WebSocket] NEXT_PUBLIC_SOCKET_URL no está configurada'
      );
      setIsConnecting(false);
      return;
    }

    console.log('🔌 [WebSocket] Conectando a:', socketUrl);

    const socket = io(`${socketUrl}/conversations`, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 20, // Aumentado de 5 a 20 intentos
      timeout: 20000, // 20s timeout para la conexión inicial
      transports: ['websocket', 'polling'],
    });

    // ===== Eventos de Conexión =====

    socket.on('connect', () => {
      console.log('✅ [WebSocket] Conectado al servidor');
      setIsConnected(true);
      setIsConnecting(false);
    });

    socket.on('disconnect', (reason) => {
      console.log('⚠️  [WebSocket] Desconectado:', reason);
      setIsConnected(false);
    });

    socket.on('error', (error) => {
      console.error('❌ [WebSocket] Error:', error);
      setIsConnecting(false);
    });

    socket.on('connect_error', (error) => {
      console.error('❌ [WebSocket] Error de conexión:', error);
      setIsConnecting(false);
    });

    // ===== Eventos de Mensajes =====

    /**
     * Evento: new-message
     * Recibido cuando otra persona envía un mensaje en la conversación
     *
     * 🔧 MEJORADO: Logging detallado para debugging
     */
    socket.on('new-message', (message: Message) => {
      console.log('💬 [WebSocket] Nuevo mensaje recibido:', {
        id: message?.id,
        conversationId: message?.conversationId,
        senderId: message?.senderId,
        content: message?.content?.substring(0, 50) + '...',
        timestamp: new Date().toISOString(),
      });

      // Validar estructura del mensaje
      if (!message?.id || !message?.conversationId || !message?.content) {
        console.error(
          '❌ [WebSocket] Mensaje inválido - falta estructura requerida:',
          {
            hasId: !!message?.id,
            hasConversationId: !!message?.conversationId,
            hasContent: !!message?.content,
            fullMessage: message,
          }
        );
        return;
      }

      // Actualizar cache de React Query con el nuevo mensaje
      console.log(
        `🔄 [WebSocket] Actualizando cache para conversación: ${message.conversationId}`
      );
      queryClient.setQueryData(
        conversationKeys.messages(message.conversationId),
        (old: Message[] | undefined) => {
          if (!old) {
            console.log('📝 [WebSocket] Cache vacío, creando con 1 mensaje');
            return [message];
          }
          // Evitar duplicados
          const isDuplicate = old.some((msg) => msg?.id === message.id);
          if (isDuplicate) {
            console.log(
              '⚠️  [WebSocket] Mensaje duplicado ignorado:',
              message.id
            );
            return old;
          }
          console.log(
            `✅ [WebSocket] Mensaje agregado al cache (${old.length} → ${
              old.length + 1
            })`
          );
          return [...old, message];
        }
      );

      // Opcional: Mostrar notificación
      if (typeof window !== 'undefined' && 'Notification' in window) {
        new Notification('Nuevo mensaje', {
          body: message.content,
          icon: '/logo.svg',
        });
      }
    });

    /**
     * Evento: match:updated
     * Recibido cuando el estado de un match cambia (ej: charter acepta/rechaza)
     */
    socket.on(
      'match:updated',
      (data: { matchId?: string; status?: string }) => {
        // Validar estructura del evento
        if (!data?.matchId || !data?.status) {
          console.warn(
            '⚠️ [WebSocket] Evento match:updated con estructura inválida:',
            data
          );
          return;
        }

        const { matchId, status } = data;
        console.log(`🔄 [WebSocket] Match ${matchId} actualizado: ${status}`);

        // Refetch all matches (force immediate update for real-time updates)
        queryClient.refetchQueries({
          queryKey: queryKeys.matches.all,
        });
      }
    );

    /**
     * Evento: notification:new
     * Recibido cuando el backend crea una notificación para este usuario.
     * Invalida el cache de React Query para actualizar el badge inmediatamente.
     */
    socket.on('notification:new', (data: { priority?: string; type?: string }) => {
      console.log('🔔 [WebSocket] Nueva notificación recibida:', data);
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      if (data?.priority === 'HIGH') {
        toast('Tenés una nueva notificación', {
          duration: 3000,
          style: { background: '#380116', color: '#FFFFFF', fontFamily: 'var(--font-lato), sans-serif' },
        });
      }
    });

    /**
     * Evento: trip:completed
     * Recibido cuando el charter finaliza el viaje
     */
    socket.on(
      'trip:completed',
      (data: { tripId?: string; matchId?: string }) => {
        if (!data?.tripId && !data?.matchId) {
          console.warn(
            '⚠️ [WebSocket] Evento trip:completed con estructura inválida:',
            data
          );
          return;
        }

        const { tripId, matchId } = data;
        console.log(`🏁 [WebSocket] Trip ${tripId} completado`);

        // Refetch all trips and matches (force immediate update for real-time updates)
        if (tripId) {
          queryClient.refetchQueries({
            queryKey: queryKeys.trips.all,
          });
        }
        if (matchId) {
          queryClient.refetchQueries({
            queryKey: queryKeys.matches.all,
          });
        }
      }
    );

    // Guardar en singleton de módulo Y en la ref local
    globalSocket = socket;
    socketRef.current = socket;

    // Cleanup: desconectar solo cuando no queda ninguna instancia montada
    return () => {
      mountCount--;
      console.log('🔌 [WebSocket] Instancia desmontada, quedan:', mountCount);
      if (mountCount <= 0) {
        console.log('🔌 [WebSocket] Última instancia — desconectando');
        globalSocket?.disconnect();
        globalSocket = null;
        mountCount = 0;
      }
      socketRef.current = null;
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
 *
 * 🔧 OPTIMIZACIÓN: Todas las funciones están memoizadas con useCallback
 * para evitar re-renders innecesarios en componentes que dependen de ellas.
 */
export function useSocketEmit() {
  const { socket } = useWebSocket();
  const { user } = useAuthStore();
  const userId = user?.id;

  // 🔧 MEMOIZE: Cada función es estable entre renders si sus dependencias no cambian
  const joinConversation = useCallback(
    (conversationId: string) => {
      if (socket?.connected) {
        console.log('📍 [WebSocket] Uniéndose a conversación:', conversationId);
        socket.emit('join-conversation', {
          conversationId,
          userId,
        });
      }
    },
    [socket, userId]
  );

  const leaveConversation = useCallback(
    (conversationId: string) => {
      if (socket?.connected) {
        console.log('📍 [WebSocket] Saliendo de conversación:', conversationId);
        socket.emit('leave-conversation', { conversationId });
      }
    },
    [socket]
  );

  const sendMessage = useCallback(
    (conversationId: string, content: string) => {
      if (socket?.connected) {
        console.log('💬 [WebSocket] Enviando mensaje:', content);
        socket.emit('send-message', { conversationId, content });
      } else {
        console.warn(
          '⚠️  [WebSocket] No conectado. No se puede enviar mensaje.'
        );
      }
    },
    [socket]
  );

  const notifyTyping = useCallback(
    (conversationId: string) => {
      if (socket?.connected) {
        socket.emit('typing', { conversationId });
      }
    },
    [socket]
  );

  // 🔧 MEMOIZE: El objeto retornado también es estable
  // Solo se recrea si alguna de sus propiedades cambia
  return useMemo(
    () => ({
      socket,
      joinConversation,
      leaveConversation,
      sendMessage,
      notifyTyping,
    }),
    [socket, joinConversation, leaveConversation, sendMessage, notifyTyping]
  );
}

export function useMatchUpdateListener(
  matchId: string | undefined,
  onMatchUpdated?: (status: string) => void
): void {
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket?.connected || !matchId) {
      return;
    }

    const handleMatchUpdate = (data: { matchId?: string; status?: string }) => {
      if (data?.matchId === matchId && data?.status) {
        console.log(
          `📬 [MATCH LISTENER] Match ${matchId} actualizado: ${data.status}`
        );
        onMatchUpdated?.(data.status);
      }
    };

    socket.on('match:updated', handleMatchUpdate);

    return () => {
      socket.off('match:updated', handleMatchUpdate);
    };
  }, [socket, matchId, onMatchUpdated]);
}

/**
 * Hook para escuchar cuando un viaje es completado por el charter
 * Útil para notificar al cliente cuando el transporte está listo
 */
export function useTripCompletedListener(
  matchId: string | undefined,
  onTripCompleted?: () => void
): void {
  const { socket } = useWebSocket();

  useEffect(() => {
    if (!socket?.connected || !matchId) {
      return;
    }

    const handleTripCompleted = (data: {
      tripId?: string;
      matchId?: string;
    }) => {
      if (data?.matchId === matchId) {
        console.log(
          `🏁 [TRIP COMPLETED LISTENER] Trip completado para match ${matchId}`
        );
        onTripCompleted?.();
      }
    };

    socket.on('trip:completed', handleTripCompleted);

    return () => {
      socket.off('trip:completed', handleTripCompleted);
    };
  }, [socket, matchId, onTripCompleted]);
}
