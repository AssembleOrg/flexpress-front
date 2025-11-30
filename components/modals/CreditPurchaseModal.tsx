"use client";

import { useState, useMemo } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
  CircularProgress,
  Alert,
  InputAdornment,
  Chip,
} from "@mui/material";
import {
  CheckCircle,
  CloudUpload,
} from "@mui/icons-material";
import toast from "react-hot-toast";
import { useCreditPurchaseStore } from "@/lib/stores/creditPurchaseStore";
import { useCreatePaymentRequest } from "@/lib/hooks/mutations/usePaymentMutations";
import { useUploadThing } from "@/lib/uploadthing";
import { usePublicPricing } from "@/lib/hooks/queries/useSystemConfigQueries";

// Ejemplos informativos (NO seleccionables)
const EXAMPLE_PACKAGES = [
  { label: "Básico", amountARS: 10000 },
  { label: "Popular", amountARS: 25000 },
  { label: "Premium", amountARS: 50000 },
];

export function CreditPurchaseModal() {
  const {
    isModalOpen,
    closeModal,
    customCredits,
    customAmount,
    setCustomCredits,
    setCustomAmount,
    receiptUrl,
    setReceiptUrl,
    resetPurchase,
  } = useCreditPurchaseStore();

  const createPaymentMutation = useCreatePaymentRequest();
  const { startUpload, isUploading } = useUploadThing("receiptUploader");
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch pricing configuration
  const { data: pricing } = usePublicPricing();

  // Amount in ARS that user will transfer
  const [amountARS, setAmountARS] = useState(0);

  // Helper para calcular créditos desde ARS
  const calculateCreditsFromARS = (ars: number) => {
    if (!pricing) return 0;
    return Math.floor(ars / pricing.creditPrice);
  };

  // Helper para calcular KMs aproximados
  const calculateApproximateKms = (credits: number) => {
    if (!pricing) return 0;
    return Math.floor(credits / pricing.creditsPerKm);
  };

  // Calcular ejemplos dinámicamente
  const examplesWithConversion = useMemo(() => {
    return EXAMPLE_PACKAGES.map((pkg) => {
      const credits = calculateCreditsFromARS(pkg.amountARS);
      const kms = calculateApproximateKms(credits);
      return { ...pkg, credits, kms };
    });
  }, [pricing]);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadError(null);
    try {
      const result = await startUpload(Array.from(files));
      if (result && result[0]) {
        setReceiptUrl(result[0].url);
        toast.success("Comprobante subido correctamente");
      }
    } catch (error) {
      setUploadError("Error al subir el comprobante");
      toast.error("Error al subir el comprobante");
    }
  };

  const handleSubmit = () => {
    if (amountARS <= 0) {
      toast.error("Por favor ingresá un monto válido");
      return;
    }

    if (!receiptUrl) {
      toast.error("Por favor subí el comprobante de pago");
      return;
    }

    createPaymentMutation.mutate(
      { credits: customCredits, amount: customAmount, receiptUrl },
      {
        onSuccess: () => {
          resetPurchase();
          setAmountARS(0);
          closeModal();
        },
      },
    );
  };

  const handleClose = () => {
    if (!createPaymentMutation.isPending) {
      resetPurchase();
      setAmountARS(0);
      closeModal();
    }
  };

  return (
    <Dialog open={isModalOpen} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ fontWeight: 700, pb: 1, fontSize: "1.1rem" }}>
        Recargar Créditos
      </DialogTitle>

      <DialogContent>
        {/* 1. INPUT DE MONTO EN ARS (PROMOVIDO ARRIBA) */}
        <Typography
          variant="subtitle1"
          fontWeight={600}
          mb={{ xs: 1, md: 2 }}
          fontSize={{ xs: "0.95rem", md: "1.1rem" }}
        >
          ¿Cuánto vas a transferir?
        </Typography>
        <TextField
          fullWidth
          type="number"
          label="Monto en ARS"
          placeholder="Ej: 30000"
          value={amountARS || ""}
          onChange={(e) => {
            const ars = Number(e.target.value);
            setAmountARS(ars);
            const credits = calculateCreditsFromARS(ars);
            setCustomCredits(credits);
            setCustomAmount(ars);
          }}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
          }}
          inputProps={{ min: 0 }}
          sx={{ mb: 2 }}
        />

        {/* 2. CONVERSIÓN EN TIEMPO REAL */}
        {amountARS > 0 && (
          <Alert severity="success" sx={{ mb: { xs: 2, md: 3 } }}>
            <Typography variant="body2">
              → Recibirás:{" "}
              <strong>{calculateCreditsFromARS(amountARS)} créditos</strong> (≈{" "}
              {calculateApproximateKms(calculateCreditsFromARS(amountARS))} KM)
            </Typography>
          </Alert>
        )}

        {/* ============================================================
            BONUS SECTION - Para implementación futura
            ============================================================

            Sistema de Bonuses: Arquitectura preparada para:
            1. Primera compra bonus (ej: +10% en primer recarga)
            2. Bonus por monto (ej: >$50k +10%, >$100k +15%)
            3. Bonus temporal/promocional (ej: "Este mes +20%")

            Variables necesarias (agregar cuando se implemente):
            - hasActivePromo: boolean
            - bonusPercentage: number (ej: 10 para +10%)
            - bonusType: "first_purchase" | "amount_threshold" | "promotional"
            - bonusDescription: string

            ============================================================ */}

        {/* IMPLEMENTACIÓN SUGERIDA - Descomentar cuando se necesite:

        {hasActivePromo && (
          <Alert
            severity="success"
            icon={<LocalOffer />}  // Agregar import: LocalOffer from @mui/icons-material
            sx={{
              mb: { xs: 2, md: 3 },
              bgcolor: "success.light",
              borderLeft: "4px solid",
              borderColor: "success.main"
            }}
          >
            <Box>
              <Typography variant="body2" fontWeight={700} color="success.dark">
                🎉 ¡Bonus Activo! +{bonusPercentage}% en créditos
              </Typography>
              <Typography variant="caption" color="success.dark" display="block" mt={0.5}>
                {bonusType === "first_purchase" && "Bonus por primera compra"}
                {bonusType === "amount_threshold" && `Transferí más de $${threshold?.toLocaleString()} y recibí bonus`}
                {bonusType === "promotional" && bonusDescription}
              </Typography>
            </Box>
          </Alert>
        )}

        */}

        {/* CONVERSIÓN MODIFICADA CON BONUS - Descomentar cuando se implemente:

        {amountARS > 0 && (
          <Alert severity="success" sx={{ mb: { xs: 2, md: 3 } }}>
            <Typography variant="body2">
              → Recibirás:{" "}
              <strong>{calculateCreditsFromARS(amountARS)} créditos base</strong>
              {hasActivePromo && (
                <>
                  {" + "}
                  <strong style={{ color: "green" }}>
                    {Math.floor(calculateCreditsFromARS(amountARS) * bonusPercentage / 100)} créditos bonus
                  </strong>
                  {" = "}
                  <strong style={{ fontSize: "1.1rem" }}>
                    {calculateCreditsFromARS(amountARS) + Math.floor(calculateCreditsFromARS(amountARS) * bonusPercentage / 100)} créditos totales
                  </strong>
                </>
              )}
              {" "}(≈ {calculateApproximateKms(calculateCreditsFromARS(amountARS))} KM)
            </Typography>
          </Alert>
        )}

        */}

        {/* 3. EJEMPLOS DE CONVERSIÓN (WRAPPING CHIPS) */}
        <Typography
          variant="subtitle1"
          fontWeight={600}
          mb={{ xs: 1, md: 2 }}
          fontSize={{ xs: "0.95rem", md: "1.1rem" }}
        >
          Ejemplos de conversión
        </Typography>
        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            gap: { xs: 1, md: 1.5 },
            mb: { xs: 2, md: 3 },
          }}
        >
          {examplesWithConversion.map((ex) => (
            <Chip
              key={ex.label}
              label={`$${ex.amountARS.toLocaleString()} → ${ex.credits} créditos`}
              variant="outlined"
              size="medium"
              sx={{
                fontSize: { xs: "0.8rem", md: "0.85rem" },
                height: { xs: 32, md: 36 },
                borderColor: "primary.main",
                color: "text.primary",
                fontWeight: 500,
                px: 0.5,
                minWidth: { xs: "auto", md: 140 },
                whiteSpace: "nowrap",
              }}
            />
          ))}
        </Box>

        {/* 4. INFO BANCARIA (COMPACTADA) */}
        <Typography
          variant="subtitle1"
          fontWeight={600}
          mb={{ xs: 1, md: 2 }}
          fontSize={{ xs: "0.95rem", md: "1.1rem" }}
        >
          Realizá la transferencia a:
        </Typography>
        <Alert
          severity="info"
          sx={{
            mb: 2,
            py: { xs: 1, md: 2 },
            fontSize: { xs: "0.85rem", md: "1rem" },
          }}
        >
          <Typography variant="body2" fontSize="inherit">
            <strong>CBU:</strong> 0000003100012345678900
            <br />
            <strong>Alias:</strong> FLEXPRESS.PAGOS
          </Typography>
        </Alert>

        {/* 5. UPLOAD DE COMPROBANTE */}
        <Typography
          variant="subtitle1"
          fontWeight={600}
          mb={{ xs: 1, md: 2 }}
          fontSize={{ xs: "0.95rem", md: "1.1rem" }}
        >
          Subí tu comprobante
        </Typography>
        <Box
          sx={{
            border: "2px dashed",
            borderColor: receiptUrl ? "success.main" : "divider",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            backgroundColor: "background.default",
          }}
        >
          {receiptUrl ? (
            <Box>
              <CheckCircle sx={{ fontSize: 48, color: "success.main", mb: 1 }} />
              <Typography variant="body2" color="success.main" fontWeight={600}>
                Comprobante cargado
              </Typography>
              <Box mt={2}>
                <img
                  src={receiptUrl}
                  alt="Comprobante"
                  style={{ maxWidth: "200px", borderRadius: 8 }}
                />
              </Box>
              <Button
                size="small"
                onClick={() => setReceiptUrl(null)}
                sx={{ mt: 1 }}
              >
                Cambiar imagen
              </Button>
            </Box>
          ) : (
            <Box>
              <CloudUpload sx={{ fontSize: 48, color: "text.secondary", mb: 1 }} />
              <Typography variant="body1" fontWeight={600} mb={1}>
                Arrastrá el comprobante aquí o hacé clic para seleccionar
              </Typography>
              <Typography variant="caption" color="text.secondary" mb={2}>
                Formatos: JPG, PNG (máx 4MB)
              </Typography>
              <Button
                component="label"
                variant="contained"
                color="primary"
                disabled={isUploading}
                startIcon={
                  isUploading ? <CircularProgress size={20} /> : <CloudUpload />
                }
                sx={{ mt: 1 }}
              >
                {isUploading ? "Subiendo..." : "Seleccionar archivo"}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={handleFileUpload}
                />
              </Button>
              {uploadError && (
                <Typography color="error" variant="caption" display="block" mt={1}>
                  {uploadError}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 2, gap: 1 }}>
        <Button
          onClick={handleClose}
          disabled={createPaymentMutation.isPending}
          size="large"
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          color="secondary"
          size="large"
          onClick={handleSubmit}
          disabled={
            amountARS <= 0 ||
            !receiptUrl ||
            createPaymentMutation.isPending ||
            isUploading
          }
          startIcon={
            createPaymentMutation.isPending ? (
              <CircularProgress size={20} />
            ) : undefined
          }
        >
          {createPaymentMutation.isPending ? "Enviando..." : "Enviar Solicitud"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
