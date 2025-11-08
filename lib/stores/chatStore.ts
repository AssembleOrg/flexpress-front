import { create } from "zustand";
import type { Message } from "@/lib/types/api";
import type { ChatState } from "@/lib/types/chat";

interface ChatActions {
  addMessage: (message: Message) => void;
  // updateMessageStatus: (messageId: string, status: Message["status"]) => void; // TODO: Not in official Message type
  setMessages: (messages: Message[]) => void;
  clearMessages: () => void;
  setConnected: (connected: boolean) => void;
  setLoading: (loading: boolean) => void;
}

export const useChatStore = create<ChatState & ChatActions>()((set) => ({
  // Estado inicial
  messages: [],
  isConnected: false,
  isLoading: false,

  // Acciones
  addMessage: (message: Message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  // updateMessageStatus: (messageId: string, status: Message["status"]) =>
  //   set((state) => ({
  //     messages: state.messages.map((msg) =>
  //       msg.id === messageId ? { ...msg, status } : msg,
  //     ),
  //   })),

  setMessages: (messages: Message[]) => set({ messages }),

  clearMessages: () => set({ messages: [] }),

  setConnected: (connected: boolean) => set({ isConnected: connected }),

  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));
