import type { Message } from "@/lib/types/api";

export interface ChatState {
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
}
