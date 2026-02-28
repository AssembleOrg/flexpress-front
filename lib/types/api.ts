import type { Trip } from "./trip";

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

export enum VerificationStatus {
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected",
}

export enum DocumentReviewStatus {
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
}

export enum DocumentSide {
  FRONT = "front",
  BACK = "back",
}

export enum UserDocumentType {
  DNI = "dni",
}

export enum VehicleDocumentType {
  FOTO = "foto",
  CEDULA = "cedula",
  SEGURO = "seguro",
  VTV = "vtv",
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
  pricePerKm: number | null; // Precio por km del charter
  documentationFrontUrl: string | null; // Solo charters
  documentationBackUrl: string | null; // Solo charters
  verificationStatus: VerificationStatus; // Charter verification status
  rejectionReason: string | null; // Reason if rejected
  verifiedAt: string | null;
  verifiedBy: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  token: string;
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
  conversation?: {
    id: string;
    status: ConversationStatus;
    createdAt: string;
  };
  tripId?: string | null;
  trip?: Trip; // Trip relation (populated when tripId exists)
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>;
  charter?: Partial<User>;
  canGiveFeedback?: boolean; // Added by useMatch hook (frontend-only)
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
  messages?: Message[]; // For admin report detail view
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
  amount: number;
  status: PaymentStatus;
  receiptUrl?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
  user?: Partial<User>;
}

export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description: string;
}

export interface UserDocument {
  id: string;
  userId: string;
  type: UserDocumentType;
  side: DocumentSide | null;
  fileUrl: string;
  status: DocumentReviewStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  uploadedAt: string;
  updatedAt: string;
}

export interface VehicleDocument {
  id: string;
  vehicleId: string;
  type: VehicleDocumentType;
  fileUrl: string;
  status: DocumentReviewStatus;
  rejectionReason: string | null;
  reviewedAt: string | null;
  reviewedBy: string | null;
  expiresAt: string | null;
  uploadedAt: string;
  updatedAt: string;
}

export interface Vehicle {
  id: string;
  charterId: string;
  plate: string;
  brand: string | null;
  model: string | null;
  year: number | null;
  alias: string | null;
  isEnabled: boolean;
  verificationStatus: VerificationStatus;
  rejectionReason: string | null;
  verifiedAt: string | null;
  verifiedBy: string | null;
  createdAt: string;
  updatedAt: string;
  documents?: VehicleDocument[];
}

export interface PendingCharterReviewItem {
  id: string;
  email: string;
  name: string;
  role: string;
  address: string;
  number: string;
  avatar: string | null;
  verificationStatus: VerificationStatus;
  rejectionReason: string | null;
  createdAt: string;
  // Charter fields
  originAddress?: string | null;
  originLatitude?: string | null;
  originLongitude?: string | null;
  // Legacy (compatibilidad)
  documentationFrontUrl: string | null;
  documentationBackUrl: string | null;
  // Nuevo (opcional para compatibilidad)
  userDocuments?: UserDocument[];
  vehicles?: Vehicle[];
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

// Re-export Trip for convenience (single source of truth: lib/types/trip.ts)
export type { Trip };
