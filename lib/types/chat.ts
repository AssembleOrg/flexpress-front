export interface Message {
  id: string;
  tripId: string;
  senderId: string;
  content: string;
  timestamp: string;
  status: "sent" | "delivered" | "failed";
}

export interface ChatState {
  messages: Message[];
  isConnected: boolean;
  isLoading: boolean;
}
