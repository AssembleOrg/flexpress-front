import type { QueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { io, type Socket } from "socket.io-client";
import { queryKeys } from "./hooks/queries/queryFactory";
import { useAuthStore } from "./stores/authStore";
import { useChatStore } from "./stores/chatStore";
import type { Message } from "./types/api";
import type { Trip } from "./types/trip";

class SocketService {
  private socket: Socket | null = null;
  private isInitialized = false;
  private queryClient: QueryClient | null = null;

  init(queryClient: QueryClient) {
    if (this.isInitialized) return;

    this.queryClient = queryClient;

    const SOCKET_URL =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:8000";
    const token = useAuthStore.getState().token;

    if (!token) return;

    this.socket = io(SOCKET_URL, {
      auth: {
        token,
      },
    });

    this.setupEventListeners();
    this.isInitialized = true;
  }

  private setupEventListeners() {
    if (!this.socket) return;

    // Eventos de conexión
    this.socket.on("connect", () => {
      console.log("Conectado al servidor Socket.IO");
      useChatStore.getState().setConnected(true);
    });

    this.socket.on("disconnect", () => {
      console.log("Desconectado del servidor Socket.IO");
      useChatStore.getState().setConnected(false);
    });

    // Eventos de chat
    this.socket.on("message_received", (message: Message) => {
      useChatStore.getState().addMessage(message);
    });

    // Note: message_status listener disabled because updateMessageStatus doesn't exist on chatStore
    // The official Message type from api.ts doesn't have a status property
    // Message status tracking is not currently supported by the backend
    // this.socket.on(
    //   "message_status",
    //   (data: { messageId: string; status: Message["status"] }) => {
    //     useChatStore
    //       .getState()
    //       .updateMessageStatus(data.messageId, data.status);
    //   },
    // );

    // Eventos de viajes - Invalidar React Query cache
    this.socket.on("trip_accepted", (trip: Trip) => {
      // Invalidate trip details and available trips list
      if (this.queryClient) {
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.trips.detail(trip.id),
        });
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.trips.available(),
        });
      }

      toast.success("¡Un conductor aceptó tu viaje!", {
        duration: 6000,
      });
    });

    this.socket.on("new_trip", (_trip: Trip) => {
      const user = useAuthStore.getState().user;

      // Solo mostrar a conductores
      if (user?.role === "charter") {
        // Invalidate available trips list to refetch with new trip
        if (this.queryClient) {
          this.queryClient.invalidateQueries({
            queryKey: queryKeys.trips.available(),
          });
        }

        toast("Nuevo viaje disponible", {
          duration: 8000,
          style: {
            background: "#2C3E50",
            color: "#FFFFFF",
          },
        });
      }
    });

    this.socket.on(
      "trip_status_changed",
      (data: { tripId: string; status: Trip["status"] }) => {
        // Invalidate trip details when status changes
        if (this.queryClient) {
          this.queryClient.invalidateQueries({
            queryKey: queryKeys.trips.detail(data.tripId),
          });
        }
      },
    );

    this.socket.on("trip_confirmed", (trip: Trip) => {
      // Invalidate trip details and user's trips
      if (this.queryClient) {
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.trips.detail(trip.id),
        });
        this.queryClient.invalidateQueries({
          queryKey: queryKeys.trips.all,
        });
      }

      toast.success("¡Viaje confirmado!", {
        duration: 5000,
      });
    });

    this.socket.on(
      "trip_cancelled",
      (data: { tripId: string; reason?: string }) => {
        // Invalidate trip details when cancelled
        if (this.queryClient) {
          this.queryClient.invalidateQueries({
            queryKey: queryKeys.trips.detail(data.tripId),
          });
          this.queryClient.invalidateQueries({
            queryKey: queryKeys.trips.available(),
          });
        }

        toast.error(`Viaje cancelado${data.reason ? `: ${data.reason}` : ""}`, {
          duration: 6000,
        });
      },
    );
  }

  // Enviar mensaje
  sendMessage(tripId: string, content: string) {
    if (!this.socket) return;

    const message = {
      tripId,
      content,
      timestamp: new Date().toISOString(),
    };

    this.socket.emit("send_message", message);
  }

  // Unirse a la sala del viaje
  joinTripRoom(tripId: string) {
    if (!this.socket) return;
    this.socket.emit("join_trip", tripId);
  }

  // Salir de la sala del viaje
  leaveTripRoom(tripId: string) {
    if (!this.socket) return;
    this.socket.emit("leave_trip", tripId);
  }

  // Actualizar disponibilidad del conductor
  updateDriverAvailability(available: boolean) {
    if (!this.socket) return;
    this.socket.emit("driver_availability", available);
  }

  // Desconectar
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isInitialized = false;
      useChatStore.getState().setConnected(false);
    }
  }

  // Reconectar
  reconnect() {
    if (!this.queryClient) return;
    this.disconnect();
    this.init(this.queryClient);
  }
}

export const socketService = new SocketService();
