"use client";

import { CheckCircle } from "@mui/icons-material";
import { Alert, AlertTitle, Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import toast from "react-hot-toast";
import { MobileContainer } from "@/components/layout/MobileContainer";
import { DniUpload } from "@/components/ui/DniUpload";
import { useCreateUserDocument } from "@/lib/hooks/mutations/useCreateUserDocument";
import { useResubmitVerification } from "@/lib/hooks/mutations/useResubmitVerification";
import { useAuthStore } from "@/lib/stores/authStore";
import { DocumentSide, UserDocumentType } from "@/lib/types/api";
import { uploadToStorage } from "@/lib/upload";

export default function ResubmitVerificationPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const [dniFront, setDniFront] = useState<File | null>(null);
  const [dniBack, setDniBack] = useState<File | null>(null);
  const [dniError, setDniError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const createUserDocument = useCreateUserDocument();
  const resubmit = useResubmitVerification();

  // DniUpload emite por useEffect: el callback debe ser estable.
  const handleFiles = useCallback((front: File | null, back: File | null) => {
    setDniFront(front);
    setDniBack(back);
  }, []);

  const handleSubmit = async () => {
    setDniError("");

    // El DNI es opcional: un rechazo pudo ser por otro motivo. Pero si el
    // usuario adjuntó una cara, debe adjuntar ambas.
    const hasPartialDni = Boolean(dniFront) !== Boolean(dniBack);
    if (hasPartialDni) {
      setDniError("Subí ambas caras del DNI, o ninguna.");
      return;
    }

    if (!user?.id) {
      toast.error("Sesión no válida. Volvé a iniciar sesión.");
      return;
    }

    setSubmitting(true);
    try {
      // PASO 1: si adjuntó DNI nuevo, subirlo y persistirlo ANTES de reabrir.
      if (dniFront && dniBack) {
        const [uploadedFront, uploadedBack] = await Promise.all([
          uploadToStorage("user-dni", dniFront, user.id),
          uploadToStorage("user-dni", dniBack, user.id),
        ]);
        await createUserDocument.mutateAsync({
          type: UserDocumentType.DNI,
          side: DocumentSide.FRONT,
          fileUrl: uploadedFront.url,
        });
        await createUserDocument.mutateAsync({
          type: UserDocumentType.DNI,
          side: DocumentSide.BACK,
          fileUrl: uploadedBack.url,
        });
      }

      // PASO 2: reabrir el caso (vuelve a 'pending' en el backend).
      await resubmit.mutateAsync();

      // No tocamos el estado local a propósito (evita race conditions): el
      // charter verá 'pending' al volver a entrar.
      setDone(true);
    } catch {
      // El toast de error ya lo emiten los hooks.
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    clearAuth();
    router.push("/login");
  };

  if (done) {
    return (
      <MobileContainer maxWidth="sm">
        <Box sx={{ textAlign: "center", mt: 6 }}>
          <CheckCircle sx={{ fontSize: 64, color: "success.main", mb: 2 }} />
          <Typography variant="h5" fontWeight={700} mb={2}>
            Documentación reenviada
          </Typography>
          <Typography color="text.secondary" mb={4}>
            Tu cuenta volvió a revisión. Un administrador la evaluará
            nuevamente. Cerrá sesión y volvé a entrar más tarde para ver el
            estado actualizado.
          </Typography>
          <Button variant="contained" size="large" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </Box>
      </MobileContainer>
    );
  }

  return (
    <MobileContainer maxWidth="sm">
      <Box sx={{ mb: 3, textAlign: "center" }}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          Reenviar documentación
        </Typography>
        <Typography color="text.secondary">
          Revisá el motivo del rechazo y reenviá tu solicitud para que un
          administrador la evalúe de nuevo.
        </Typography>
      </Box>

      {user?.rejectionReason && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <AlertTitle>Motivo del rechazo anterior</AlertTitle>
          {user.rejectionReason}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
        Si el rechazo fue por tu DNI, subí ambas caras nuevamente. Si fue por
        otro motivo, podés reenviar sin cambiar el DNI.
      </Typography>

      <Box sx={{ mb: 3 }}>
        <DniUpload onFilesSelected={handleFiles} error={dniError} />
      </Box>

      <Button
        variant="contained"
        color="secondary"
        size="large"
        fullWidth
        onClick={handleSubmit}
        disabled={submitting}
      >
        {submitting ? "Reenviando..." : "Reenviar solicitud"}
      </Button>
    </MobileContainer>
  );
}
