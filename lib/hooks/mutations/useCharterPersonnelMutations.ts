import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import {
  type CreateDriverDocumentPayload,
  type CreateDriverPayload,
  type CreateHelperDocumentPayload,
  type CreateHelperPayload,
  charterPersonnelApi,
  type ReviewDocumentPayload,
  type ReviewEntityPayload,
  type UpdateDriverPayload,
  type UpdateHelperPayload,
} from "@/lib/api/charterPersonnel";
import { queryKeys } from "@/lib/hooks/queries/queryFactory";

const driversKey = queryKeys.charterPersonnel.myDrivers();
const helpersKey = queryKeys.charterPersonnel.myHelpers();
const pendingDriversKey = queryKeys.admin.drivers.pending();
const pendingHelpersKey = queryKeys.admin.helpers.pending();

function toastError(err: any, fallback: string) {
  const message = err?.response?.data?.message || fallback;
  toast.error(Array.isArray(message) ? message[0] : message);
}

// ─── Drivers ────────────────────────────────────────────────────────────────

export function useCreateDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDriverPayload) =>
      charterPersonnelApi.createDriver(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: driversKey });
      toast.success(
        "Conductor creado. Subí los documentos y esperá la verificación.",
      );
    },
    onError: (err) => toastError(err, "Error al crear conductor"),
  });
}

export function useUpdateDriver(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateDriverPayload) =>
      charterPersonnelApi.updateDriver(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: driversKey });
      qc.invalidateQueries({
        queryKey: queryKeys.charterPersonnel.driverDetail(id),
      });
      toast.success("Conductor actualizado. Pendiente de re-verificación.");
    },
    onError: (err) => toastError(err, "Error al actualizar conductor"),
  });
}

export function useToggleDriverEnabled(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => charterPersonnelApi.toggleDriverEnabled(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: driversKey });
      qc.invalidateQueries({
        queryKey: queryKeys.charterPersonnel.driverDetail(id),
      });
    },
    onError: (err) => toastError(err, "Error al cambiar estado del conductor"),
  });
}

export function useDeleteDriver(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => charterPersonnelApi.deleteDriver(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: driversKey });
      toast.success("Conductor eliminado");
    },
    onError: (err) => toastError(err, "No se pudo eliminar el conductor"),
  });
}

export function useUploadDriverDocument(driverId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateDriverDocumentPayload) =>
      charterPersonnelApi.uploadDriverDocument(driverId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: driversKey });
      qc.invalidateQueries({
        queryKey: queryKeys.charterPersonnel.driverDetail(driverId),
      });
    },
    onError: (err) => toastError(err, "Error al subir documento"),
  });
}

// ─── Helpers ────────────────────────────────────────────────────────────────

export function useCreateHelper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHelperPayload) =>
      charterPersonnelApi.createHelper(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: helpersKey });
      toast.success("Ayudante creado. Subí el DNI y esperá la verificación.");
    },
    onError: (err) => toastError(err, "Error al crear ayudante"),
  });
}

export function useUpdateHelper(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateHelperPayload) =>
      charterPersonnelApi.updateHelper(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: helpersKey });
      qc.invalidateQueries({
        queryKey: queryKeys.charterPersonnel.helperDetail(id),
      });
      toast.success("Ayudante actualizado. Pendiente de re-verificación.");
    },
    onError: (err) => toastError(err, "Error al actualizar ayudante"),
  });
}

export function useToggleHelperEnabled(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => charterPersonnelApi.toggleHelperEnabled(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: helpersKey });
      qc.invalidateQueries({
        queryKey: queryKeys.charterPersonnel.helperDetail(id),
      });
    },
    onError: (err) => toastError(err, "Error al cambiar estado del ayudante"),
  });
}

export function useDeleteHelper(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => charterPersonnelApi.deleteHelper(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: helpersKey });
      toast.success("Ayudante eliminado");
    },
    onError: (err) => toastError(err, "No se pudo eliminar el ayudante"),
  });
}

export function useUploadHelperDocument(helperId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateHelperDocumentPayload) =>
      charterPersonnelApi.uploadHelperDocument(helperId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: helpersKey });
      qc.invalidateQueries({
        queryKey: queryKeys.charterPersonnel.helperDetail(helperId),
      });
    },
    onError: (err) => toastError(err, "Error al subir documento"),
  });
}

// ─── Admin ──────────────────────────────────────────────────────────────────

export function useAdminReviewDriver() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReviewEntityPayload;
    }) => charterPersonnelApi.adminReviewDriver(id, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: pendingDriversKey });
      toast.success(
        vars.payload.status === "verified"
          ? "Conductor aprobado"
          : "Conductor rechazado",
      );
    },
    onError: (err) => toastError(err, "Error al revisar conductor"),
  });
}

export function useAdminReviewHelper() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: ReviewEntityPayload;
    }) => charterPersonnelApi.adminReviewHelper(id, payload),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: pendingHelpersKey });
      toast.success(
        vars.payload.status === "verified"
          ? "Ayudante aprobado"
          : "Ayudante rechazado",
      );
    },
    onError: (err) => toastError(err, "Error al revisar ayudante"),
  });
}

export function useAdminReviewDriverDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      docId,
      payload,
    }: {
      docId: string;
      payload: ReviewDocumentPayload;
    }) => charterPersonnelApi.adminReviewDriverDocument(docId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pendingDriversKey });
    },
    onError: (err) => toastError(err, "Error al revisar documento"),
  });
}

export function useAdminReviewHelperDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      docId,
      payload,
    }: {
      docId: string;
      payload: ReviewDocumentPayload;
    }) => charterPersonnelApi.adminReviewHelperDocument(docId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: pendingHelpersKey });
    },
    onError: (err) => toastError(err, "Error al revisar documento"),
  });
}
