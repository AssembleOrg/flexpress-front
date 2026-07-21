import api from "../api";
import type {
  ApiResponse,
  CharterDriver,
  CharterDriverDocument,
  CharterDriverDocumentType,
  CharterHelper,
  CharterHelperDocument,
  CharterHelperDocumentType,
  DocumentReviewStatus,
  DocumentSide,
  VerificationStatus,
} from "../types/api";

export interface CreateDriverPayload {
  firstName: string;
  lastName: string;
  phone?: string;
  photoUrl?: string;
}

export interface UpdateDriverPayload {
  firstName?: string;
  lastName?: string;
  phone?: string;
  photoUrl?: string;
}

export interface CreateDriverDocumentPayload {
  type: CharterDriverDocumentType;
  side?: DocumentSide;
  fileUrl: string;
  expiresAt?: string;
}

export interface CreateHelperPayload {
  firstName: string;
  lastName: string;
  photoUrl?: string;
}

export interface UpdateHelperPayload {
  firstName?: string;
  lastName?: string;
  photoUrl?: string;
}

export interface CreateHelperDocumentPayload {
  type: CharterHelperDocumentType;
  side: DocumentSide;
  fileUrl: string;
}

export interface ReviewEntityPayload {
  status: Extract<
    VerificationStatus,
    VerificationStatus.VERIFIED | VerificationStatus.REJECTED
  >;
  rejectionReason?: string;
}

export interface ReviewDocumentPayload {
  status: Extract<
    DocumentReviewStatus,
    DocumentReviewStatus.APPROVED | DocumentReviewStatus.REJECTED
  >;
  rejectionReason?: string;
}

export const charterPersonnelApi = {
  // Drivers
  listMyDrivers: async (): Promise<CharterDriver[]> => {
    const res = await api.get<ApiResponse<CharterDriver[]>>(
      "/charter-personnel/drivers/me",
    );
    return res.data.data ?? [];
  },
  getDriver: async (id: string): Promise<CharterDriver | null> => {
    const res = await api.get<ApiResponse<CharterDriver>>(
      `/charter-personnel/drivers/${id}`,
    );
    return res.data.data ?? null;
  },
  createDriver: async (
    payload: CreateDriverPayload,
  ): Promise<CharterDriver> => {
    const res = await api.post<ApiResponse<CharterDriver>>(
      "/charter-personnel/drivers",
      payload,
    );
    return res.data.data as CharterDriver;
  },
  updateDriver: async (
    id: string,
    payload: UpdateDriverPayload,
  ): Promise<CharterDriver> => {
    const res = await api.patch<ApiResponse<CharterDriver>>(
      `/charter-personnel/drivers/${id}`,
      payload,
    );
    return res.data.data as CharterDriver;
  },
  toggleDriverEnabled: async (id: string): Promise<CharterDriver> => {
    const res = await api.patch<ApiResponse<CharterDriver>>(
      `/charter-personnel/drivers/${id}/toggle-enabled`,
    );
    return res.data.data as CharterDriver;
  },
  deleteDriver: async (id: string): Promise<void> => {
    await api.delete(`/charter-personnel/drivers/${id}`);
  },
  uploadDriverDocument: async (
    driverId: string,
    payload: CreateDriverDocumentPayload,
  ): Promise<CharterDriverDocument> => {
    const res = await api.post<ApiResponse<CharterDriverDocument>>(
      `/charter-personnel/drivers/${driverId}/documents`,
      payload,
    );
    return res.data.data as CharterDriverDocument;
  },

  // Helpers
  listMyHelpers: async (): Promise<CharterHelper[]> => {
    const res = await api.get<ApiResponse<CharterHelper[]>>(
      "/charter-personnel/helpers/me",
    );
    return res.data.data ?? [];
  },
  getHelper: async (id: string): Promise<CharterHelper | null> => {
    const res = await api.get<ApiResponse<CharterHelper>>(
      `/charter-personnel/helpers/${id}`,
    );
    return res.data.data ?? null;
  },
  createHelper: async (
    payload: CreateHelperPayload,
  ): Promise<CharterHelper> => {
    const res = await api.post<ApiResponse<CharterHelper>>(
      "/charter-personnel/helpers",
      payload,
    );
    return res.data.data as CharterHelper;
  },
  updateHelper: async (
    id: string,
    payload: UpdateHelperPayload,
  ): Promise<CharterHelper> => {
    const res = await api.patch<ApiResponse<CharterHelper>>(
      `/charter-personnel/helpers/${id}`,
      payload,
    );
    return res.data.data as CharterHelper;
  },
  toggleHelperEnabled: async (id: string): Promise<CharterHelper> => {
    const res = await api.patch<ApiResponse<CharterHelper>>(
      `/charter-personnel/helpers/${id}/toggle-enabled`,
    );
    return res.data.data as CharterHelper;
  },
  deleteHelper: async (id: string): Promise<void> => {
    await api.delete(`/charter-personnel/helpers/${id}`);
  },
  uploadHelperDocument: async (
    helperId: string,
    payload: CreateHelperDocumentPayload,
  ): Promise<CharterHelperDocument> => {
    const res = await api.post<ApiResponse<CharterHelperDocument>>(
      `/charter-personnel/helpers/${helperId}/documents`,
      payload,
    );
    return res.data.data as CharterHelperDocument;
  },

  // Admin
  adminListPendingDrivers: async (): Promise<CharterDriver[]> => {
    const res = await api.get<ApiResponse<CharterDriver[]>>(
      "/charter-personnel/admin/drivers/pending",
    );
    return res.data.data ?? [];
  },
  adminListPendingHelpers: async (): Promise<CharterHelper[]> => {
    const res = await api.get<ApiResponse<CharterHelper[]>>(
      "/charter-personnel/admin/helpers/pending",
    );
    return res.data.data ?? [];
  },
  adminReviewDriver: async (
    id: string,
    payload: ReviewEntityPayload,
  ): Promise<CharterDriver> => {
    const res = await api.patch<ApiResponse<CharterDriver>>(
      `/charter-personnel/admin/drivers/${id}/review`,
      payload,
    );
    return res.data.data as CharterDriver;
  },
  adminReviewHelper: async (
    id: string,
    payload: ReviewEntityPayload,
  ): Promise<CharterHelper> => {
    const res = await api.patch<ApiResponse<CharterHelper>>(
      `/charter-personnel/admin/helpers/${id}/review`,
      payload,
    );
    return res.data.data as CharterHelper;
  },
  adminReviewDriverDocument: async (
    docId: string,
    payload: ReviewDocumentPayload,
  ): Promise<CharterDriverDocument> => {
    const res = await api.patch<ApiResponse<CharterDriverDocument>>(
      `/charter-personnel/admin/drivers/documents/${docId}/review`,
      payload,
    );
    return res.data.data as CharterDriverDocument;
  },
  adminReviewHelperDocument: async (
    docId: string,
    payload: ReviewDocumentPayload,
  ): Promise<CharterHelperDocument> => {
    const res = await api.patch<ApiResponse<CharterHelperDocument>>(
      `/charter-personnel/admin/helpers/documents/${docId}/review`,
      payload,
    );
    return res.data.data as CharterHelperDocument;
  },
};
