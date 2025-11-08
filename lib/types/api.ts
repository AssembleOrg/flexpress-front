// ============================================
// ENUMS
// ============================================

export enum UserRole {
  ADMIN = "admin",
  SUBADMIN = "subadmin",
  USER = "user",
  CHARTER = "charter",
}

export enum TravelMatchStatus {
  SEARCHING = "searching",
  PENDING = "pending",
  ACCEPTED = "accepted",
  REJECTED = "rejected",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
}

export enum ConversationStatus {
  ACTIVE = "active",
  CLOSED = "closed",
  EXPIRED = "expired",
}

export enum ReportStatus {
  PENDING = "pending",
  INVESTIGATING = "investigating",
  RESOLVED = "resolved",
  DISMISSED = "dismissed",
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  REJECTED = "rejected",
  ACCEPTED = "accepted",
}

// ============================================
// INTERFACES
// ============================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  credits: number;
  address: string;
  number: string;
  avatar: string | null;
  originAddress: string | null; // Solo charters
  originLatitude: string | null;
  originLongitude: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface Trip {
  id: string;
  userId: string;
  charterId: string;
  address: string; // Dirección completa
  latitude: string;
  longitude: string;
  workersCount: number;
  scheduledDate: string | null;
  createdAt: string;
  updatedAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
  };
  charter?: {
    id: string;
    name: string;
    email: string;
  };
}

export interface TravelMatch {
  id: string;
  userId: string;
  charterId: string | null;
  pickupAddress: string;
  pickupLatitude: string;
  pickupLongitude: string;
  destinationAddress: string;
  destinationLatitude: string;
  destinationLongitude: string;
  distanceKm: number | null;
  estimatedCredits: number | null;
  maxRadiusKm: number;
  status: TravelMatchStatus;
  workersCount: number;
  scheduledDate: string | null;
  expiresAt: string | null;
  conversationId?: string; // Created when charter accepts match
  tripId?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>;
  charter?: Partial<User>;
}

export interface AvailableCharter {
  charterId: string;
  charterName: string;
  charterEmail: string;
  charterNumber: string;
  charterAvatar: string | null;
  originAddress: string;
  originLatitude: string;
  originLongitude: string;
  distanceToPickup: number; // km
  totalDistance: number; // km
  estimatedCredits: number;
}

export interface Conversation {
  id: string;
  matchId: string;
  userId: string;
  charterId: string;
  status: ConversationStatus;
  closedBy: string | null;
  closedAt: string | null;
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>;
  charter?: Partial<User>;
  lastMessage?: Message;
  unreadCount?: number;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    name: string;
    avatar: string | null;
    role: UserRole;
  };
}

export interface Report {
  id: string;
  conversationId: string;
  reporterId: string;
  reportedId: string;
  reason: string;
  description: string | null;
  status: ReportStatus;
  adminNotes: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: Partial<User>;
  reported?: Partial<User>;
  conversation?: Partial<Conversation>;
}

export interface Feedback {
  id: string;
  tripId: string;
  fromUserId: string;
  toUserId: string;
  rating: number; // 1-5
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  fromUser?: Partial<User>;
  toUser?: Partial<User>;
  trip?: Partial<Trip>;
}

export interface Payment {
  id: string;
  userId: string;
  credits: number;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SystemConfig {
  key: string;
  value: string;
  description: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  meta?: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// ============================================
// WEBSOCKET EVENTS
// ============================================

export interface JoinConversationEvent {
  conversationId: string;
  userId: string;
  charterId?: string;
}

export interface SendMessageEvent {
  conversationId: string;
  userId: string;
  userName: string;
  message: string;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
  userName: string;
  isTyping: boolean;
}

export interface NewMessageEvent {
  conversationId: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

export interface UserJoinedEvent {
  userId: string;
  userName?: string;
  timestamp: string;
}

export interface ConversationClosedEvent {
  conversationId: string;
  closedBy: string;
  timestamp: string;
}
