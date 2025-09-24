import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./stores/authStore";
import { useChatStore } from "./stores/chatStore";
import { useTripStore } from "./stores/tripStore";
import { Message } from "./types/chat";
import { Trip } from "./types/trip";
import toast from "react-hot-toast";

class SocketService {
  private socket: Socket | null = null;
  private isInitialized = false;

  init() {
    if (this.isInitialized) return;

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

    this.socket.on(
      "message_status",
      (data: { messageId: string; status: Message["status"] }) => {
        useChatStore
          .getState()
          .updateMessageStatus(data.messageId, data.status);
      },
    );

    // Eventos de viajes
    this.socket.on("trip_accepted", (trip: Trip) => {
      useTripStore.getState().setCurrentTrip(trip);
      useTripStore.getState().removeAvailableTrip(trip.id);

      toast.success("¡Un conductor aceptó tu viaje!", {
        duration: 6000,
      });
    });

    this.socket.on("new_trip", (trip: Trip) => {
      const user = useAuthStore.getState().user;

      // Solo mostrar a conductores
      if (user?.role === "driver") {
        useTripStore.getState().addAvailableTrip(trip);

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
        useTripStore.getState().updateTripStatus(data.tripId, data.status);
      },
    );

    this.socket.on("trip_confirmed", (trip: Trip) => {
      useTripStore.getState().setCurrentTrip(trip);

      toast.success("¡Viaje confirmado!", {
        duration: 5000,
      });
    });

    this.socket.on(
      "trip_cancelled",
      (data: { tripId: string; reason?: string }) => {
        useTripStore.getState().updateTripStatus(data.tripId, "cancelled");

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
    this.disconnect();
    this.init();
  }
}

export const socketService = new SocketService();
