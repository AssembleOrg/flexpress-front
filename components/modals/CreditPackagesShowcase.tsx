"use client";

import {
  ArrowBackRounded,
  AutoAwesomeRounded,
  CheckCircleRounded,
  CloseRounded,
  CloudUploadRounded,
  DiamondRounded,
  MilitaryTechRounded,
  WorkspacePremiumRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import { useCreatePaymentRequest } from "@/lib/hooks/mutations/usePaymentMutations";
import { usePublicPricing } from "@/lib/hooks/queries/useSystemConfigQueries";
import { useCreditPurchaseStore } from "@/lib/stores/creditPurchaseStore";
import { useUploadThing } from "@/lib/uploadthing";

/**
 * Modal REAL de recarga de créditos (premium bottom-sheet).
 * Reemplaza al Dialog viejo. Controlado por creditPurchaseStore.
 *
 * IMPORTANTE: la lógica de pago NO cambia — sigue siendo transferencia manual +
 * comprobante + useCreatePaymentRequest → aprobación del admin. La pasarela de
 * pago (MercadoPago) se integrará después; los paquetes están hardcodeados.
 */

interface CreditPackage {
  tier: "bronce" | "plata" | "oro";
  label: string;
  amountARS: number;
  baseCredits: number;
  bonusCredits: number;
  badge?: string;
  accentColor: string;
  icon: ReactNode;
}

const GOLD = "#DCA621";
const BORDO = "#380116";

const PREMIUM_PACKAGES: CreditPackage[] = [
  {
    tier: "bronce",
    label: "Bronce",
    amountARS: 10000,
    baseCredits: 5,
    bonusCredits: 0,
    accentColor: "#B87333",
    icon: <MilitaryTechRounded sx={{ fontSize: 26 }} />,
  },
  {
    tier: "plata",
    label: "Plata",
    amountARS: 25000,
    baseCredits: 12,
    bonusCredits: 2,
    badge: "POPULAR",
    accentColor: "#C0C0C0",
    icon: <WorkspacePremiumRounded sx={{ fontSize: 26 }} />,
  },
  {
    tier: "oro",
    label: "Oro",
    amountARS: 50000,
    baseCredits: 30,
    bonusCredits: 8,
    badge: "MEJOR VALOR",
    accentColor: GOLD,
    icon: <DiamondRounded sx={{ fontSize: 26 }} />,
  },
];

const formatARS = (value: number) => `$${value.toLocaleString("es-AR")}`;

const SHEET_SPRING = { type: "spring", damping: 30, stiffness: 300 } as const;

type Step = "select" | "checkout";

export function CreditPackagesShowcase() {
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

  const { data: pricing } = usePublicPricing();
  const createPaymentMutation = useCreatePaymentRequest();
  const { startUpload, isUploading } = useUploadThing("receiptUploader");

  const [step, setStep] = useState<Step>("select");
  const [customARS, setCustomARS] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Desglose visual (base/bonus) del paquete elegido — el backend solo guarda el total.
  const [breakdown, setBreakdown] = useState<{ base: number; bonus: number }>({
    base: 0,
    bonus: 0,
  });

  const calculateCreditsFromARS = (ars: number) => {
    if (!pricing) return 0;
    return Math.floor(ars / pricing.creditPrice);
  };

  const handleClose = () => {
    if (createPaymentMutation.isPending) return;
    resetPurchase();
    setCustomARS(0);
    setUploadError(null);
    setBreakdown({ base: 0, bonus: 0 });
    setStep("select");
    closeModal();
  };

  const handleSelectPackage = (pkg: CreditPackage) => {
    setCustomAmount(pkg.amountARS);
    setCustomCredits(pkg.baseCredits + pkg.bonusCredits);
    setBreakdown({ base: pkg.baseCredits, bonus: pkg.bonusCredits });
    setStep("checkout");
  };

  const handleConfirmCustom = () => {
    if (customARS <= 0) {
      toast.error("Por favor ingresá un monto válido");
      return;
    }
    const credits = calculateCreditsFromARS(customARS);
    setCustomAmount(customARS);
    setCustomCredits(credits);
    setBreakdown({ base: credits, bonus: 0 });
    setStep("checkout");
  };

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    setUploadError(null);
    try {
      const result = await startUpload(Array.from(files));
      if (result?.[0]) {
        setReceiptUrl(result[0].url);
        toast.success("Comprobante subido correctamente");
      }
    } catch {
      setUploadError("Error al subir el comprobante");
      toast.error("Error al subir el comprobante");
    }
  };

  const handleSubmit = () => {
    if (customAmount <= 0) {
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
          setCustomARS(0);
          setBreakdown({ base: 0, bonus: 0 });
          setStep("select");
          closeModal();
        },
      },
    );
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          sx={{
            position: "fixed",
            inset: 0,
            zIndex: 1400,
            display: "flex",
            alignItems: { xs: "stretch", md: "center" },
            justifyContent: "center",
            bgcolor: "rgba(20, 0, 8, 0.45)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
        >
          <Box
            component={motion.div}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={SHEET_SPRING}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.5 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > 120 || info.velocity.y > 500) handleClose();
            }}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: { xs: "100%", md: 1080 },
              height: { xs: "100%", md: "auto" },
              maxHeight: { xs: "100%", md: "92vh" },
              overflowY: "auto",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderBottomLeftRadius: { xs: 0, md: 28 },
              borderBottomRightRadius: { xs: 0, md: 28 },
              background: `linear-gradient(160deg, #1a0009 0%, ${BORDO} 55%, #2a0011 100%)`,
              boxShadow: "0 -12px 48px rgba(0,0,0,0.45)",
              px: { xs: 2.5, md: 5 },
              pt: 1.5,
              pb: { xs: 4, md: 5 },
            }}
          >
            {/* Grabber estilo iOS */}
            <Box
              sx={{
                width: 44,
                height: 5,
                borderRadius: 999,
                bgcolor: "rgba(255,255,255,0.3)",
                mx: "auto",
                mb: 2,
                cursor: "grab",
              }}
            />

            {/* Botón cerrar */}
            <Button
              onClick={handleClose}
              aria-label="Cerrar"
              sx={{
                position: "absolute",
                top: 14,
                right: 14,
                minWidth: 0,
                width: 40,
                height: 40,
                borderRadius: "50%",
                color: "rgba(255,255,255,0.8)",
                bgcolor: "rgba(255,255,255,0.08)",
                backdropFilter: "blur(6px)",
                "&:hover": { bgcolor: "rgba(255,255,255,0.16)" },
              }}
            >
              <CloseRounded />
            </Button>

            <AnimatePresence mode="wait">
              {step === "select" ? (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={SHEET_SPRING}
                >
                  <SelectStep
                    customARS={customARS}
                    setCustomARS={setCustomARS}
                    calculateCreditsFromARS={calculateCreditsFromARS}
                    onSelectPackage={handleSelectPackage}
                    onConfirmCustom={handleConfirmCustom}
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="checkout"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={SHEET_SPRING}
                >
                  <CheckoutStep
                    credits={customCredits}
                    baseCredits={breakdown.base}
                    bonusCredits={breakdown.bonus}
                    amount={customAmount}
                    receiptUrl={receiptUrl}
                    onBack={() => setStep("select")}
                    onChangeReceipt={() => setReceiptUrl(null)}
                    onFileUpload={handleFileUpload}
                    onSubmit={handleSubmit}
                    isUploading={isUploading}
                    uploadError={uploadError}
                    isSubmitting={createPaymentMutation.isPending}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </Box>
        </Box>
      )}
    </AnimatePresence>
  );
}

function SelectStep({
  customARS,
  setCustomARS,
  calculateCreditsFromARS,
  onSelectPackage,
  onConfirmCustom,
}: {
  customARS: number;
  setCustomARS: (v: number) => void;
  calculateCreditsFromARS: (ars: number) => number;
  onSelectPackage: (pkg: CreditPackage) => void;
  onConfirmCustom: () => void;
}) {
  const customCredits = useMemo(
    () => calculateCreditsFromARS(customARS),
    [customARS, calculateCreditsFromARS],
  );

  return (
    <>
      {/* Encabezado */}
      <Stack
        alignItems="center"
        textAlign="center"
        gap={0.75}
        mb={{ xs: 2.5, md: 3 }}
      >
        <Typography
          sx={{
            fontFamily: "var(--font-playfair), serif",
            fontWeight: 700,
            color: "#fff",
            fontSize: { xs: "1.5rem", md: "2rem" },
            letterSpacing: "-0.5px",
          }}
        >
          Recargá y desbloqueá bonos
        </Typography>
        <Typography
          sx={{
            color: "rgba(255,255,255,0.6)",
            fontSize: { xs: "0.85rem", md: "0.95rem" },
            maxWidth: 460,
          }}
        >
          Mientras más cargás, más créditos extra recibís de regalo.
        </Typography>
      </Stack>

      {/* Tarjetas de paquetes (filas compactas apiladas) */}
      <Stack
        component={motion.div}
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
        }}
        spacing={1.5}
        sx={{ maxWidth: 560, mx: "auto" }}
      >
        {PREMIUM_PACKAGES.map((pkg) => (
          <PackageCard
            key={pkg.tier}
            pkg={pkg}
            onSelect={() => onSelectPackage(pkg)}
          />
        ))}
      </Stack>

      {/* Otro monto (libre) */}
      <Box
        sx={{
          mt: { xs: 2.5, md: 3 },
          maxWidth: 560,
          mx: "auto",
          p: { xs: 2, md: 2.5 },
          borderRadius: 18,
          bgcolor: "rgba(255,255,255,0.05)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        <Typography
          sx={{ color: "#fff", fontWeight: 700, fontSize: "1rem", mb: 1.5 }}
        >
          ¿Otro monto?
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            type="number"
            placeholder="Ej: 30000"
            value={customARS || ""}
            onChange={(e) => setCustomARS(Number(e.target.value))}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
                    $
                  </Typography>
                </InputAdornment>
              ),
            }}
            inputProps={{ min: 0 }}
            sx={{
              flex: 1,
              "& .MuiOutlinedInput-root": {
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.06)",
                borderRadius: 12,
                "& fieldset": { borderColor: "rgba(255,255,255,0.2)" },
                "&:hover fieldset": { borderColor: GOLD },
                "&.Mui-focused fieldset": { borderColor: GOLD },
              },
            }}
          />
          <Button
            variant="contained"
            color="secondary"
            onClick={onConfirmCustom}
            disabled={customARS <= 0}
            sx={{
              fontWeight: 800,
              borderRadius: 12,
              color: "#212121",
              whiteSpace: "nowrap",
            }}
          >
            Continuar
          </Button>
        </Stack>
        {customARS > 0 && (
          <Typography
            sx={{ mt: 1, color: GOLD, fontSize: "0.85rem", fontWeight: 600 }}
          >
            → Recibirás {customCredits} créditos
          </Typography>
        )}
      </Box>
    </>
  );
}

function CheckoutStep({
  credits,
  baseCredits,
  bonusCredits,
  amount,
  receiptUrl,
  onBack,
  onChangeReceipt,
  onFileUpload,
  onSubmit,
  isUploading,
  uploadError,
  isSubmitting,
}: {
  credits: number;
  baseCredits: number;
  bonusCredits: number;
  amount: number;
  receiptUrl: string | null;
  onBack: () => void;
  onChangeReceipt: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isUploading: boolean;
  uploadError: string | null;
  isSubmitting: boolean;
}) {
  return (
    <Box sx={{ maxWidth: 560, mx: "auto" }}>
      {/* Header del paso */}
      <Stack direction="row" alignItems="center" gap={1} mb={2}>
        <Button
          onClick={onBack}
          startIcon={<ArrowBackRounded />}
          sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 600, minWidth: 0 }}
        >
          Volver
        </Button>
      </Stack>

      {/* Resumen del paquete elegido */}
      <Box
        sx={{
          p: 2,
          borderRadius: 18,
          mb: 2.5,
          background: `linear-gradient(135deg, ${GOLD}22, rgba(255,255,255,0.04))`,
          border: `1px solid ${GOLD}55`,
        }}
      >
        <Typography sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}>
          Vas a recargar
        </Typography>
        <Stack
          direction="row"
          alignItems="baseline"
          justifyContent="space-between"
          mt={0.5}
        >
          <Stack direction="row" alignItems="baseline" gap={0.75}>
            <Typography
              sx={{
                color: "#fff",
                fontWeight: 800,
                fontSize: "1.8rem",
                lineHeight: 1,
              }}
            >
              {credits}
            </Typography>
            <Typography
              sx={{ color: "rgba(255,255,255,0.65)", fontSize: "0.85rem" }}
            >
              créditos
            </Typography>
          </Stack>
          <Typography sx={{ color: GOLD, fontWeight: 800, fontSize: "1.3rem" }}>
            {formatARS(amount)}
          </Typography>
        </Stack>

        {bonusCredits > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            gap={1}
            mt={1}
            flexWrap="wrap"
          >
            <Stack
              direction="row"
              alignItems="center"
              gap={0.35}
              sx={{
                px: 0.75,
                py: 0.15,
                borderRadius: 999,
                bgcolor: `${GOLD}22`,
                border: `1px solid ${GOLD}66`,
              }}
            >
              <AutoAwesomeRounded sx={{ fontSize: 12, color: GOLD }} />
              <Typography
                sx={{
                  color: GOLD,
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  letterSpacing: "0.03em",
                }}
              >
                +{bonusCredits} BONUS
              </Typography>
            </Stack>
            <Typography
              sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.78rem" }}
            >
              {baseCredits} base + {bonusCredits} de regalo
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Datos de transferencia */}
      <Typography
        sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", mb: 1 }}
      >
        Realizá la transferencia a:
      </Typography>
      <Box
        sx={{
          p: 2,
          borderRadius: 14,
          mb: 2.5,
          bgcolor: "rgba(255,255,255,0.06)",
          border: "1px solid rgba(255,255,255,0.12)",
        }}
      >
        <Typography
          sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.9rem" }}
        >
          <strong>CBU:</strong> 0000003100012345678900
          <br />
          <strong>Alias:</strong> FLEXPRESS.PAGOS
        </Typography>
      </Box>

      {/* Upload de comprobante */}
      <Typography
        sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", mb: 1 }}
      >
        Subí tu comprobante
      </Typography>
      <Box
        sx={{
          border: "2px dashed",
          borderColor: receiptUrl ? GOLD : "rgba(255,255,255,0.25)",
          borderRadius: 14,
          p: 3,
          textAlign: "center",
          bgcolor: "rgba(255,255,255,0.03)",
        }}
      >
        {receiptUrl ? (
          <Box>
            <CheckCircleRounded sx={{ fontSize: 44, color: GOLD, mb: 1 }} />
            <Typography sx={{ color: GOLD, fontWeight: 600 }}>
              Comprobante cargado
            </Typography>
            <Box mt={2}>
              <Box
                component="img"
                src={receiptUrl}
                alt="Comprobante"
                sx={{ maxWidth: 200, borderRadius: 2 }}
              />
            </Box>
            <Button
              size="small"
              onClick={onChangeReceipt}
              sx={{ mt: 1, color: "rgba(255,255,255,0.8)" }}
            >
              Cambiar imagen
            </Button>
          </Box>
        ) : (
          <Box>
            <CloudUploadRounded
              sx={{ fontSize: 44, color: "rgba(255,255,255,0.5)", mb: 1 }}
            />
            <Typography
              sx={{ color: "rgba(255,255,255,0.85)", fontWeight: 600, mb: 0.5 }}
            >
              Tocá para seleccionar el comprobante
            </Typography>
            <Typography
              sx={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.75rem",
                mb: 2,
              }}
            >
              Formatos: JPG, PNG (máx 4MB)
            </Typography>
            <Button
              component="label"
              variant="contained"
              color="secondary"
              disabled={isUploading}
              startIcon={
                isUploading ? (
                  <CircularProgress size={20} />
                ) : (
                  <CloudUploadRounded />
                )
              }
              sx={{ fontWeight: 700, borderRadius: 12, color: "#212121" }}
            >
              {isUploading ? "Subiendo..." : "Seleccionar archivo"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={onFileUpload}
              />
            </Button>
            {uploadError && (
              <Typography sx={{ color: "#ff8a80", fontSize: "0.75rem", mt: 1 }}>
                {uploadError}
              </Typography>
            )}
          </Box>
        )}
      </Box>

      {/* Enviar */}
      <Button
        fullWidth
        variant="contained"
        color="secondary"
        size="large"
        onClick={onSubmit}
        disabled={amount <= 0 || !receiptUrl || isSubmitting || isUploading}
        startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
        sx={{ mt: 3, fontWeight: 800, borderRadius: 12, color: "#212121" }}
      >
        {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
      </Button>
    </Box>
  );
}

function PackageCard({
  pkg,
  onSelect,
}: {
  pkg: CreditPackage;
  onSelect: () => void;
}) {
  const featured = pkg.tier === "oro";
  const totalCredits = pkg.baseCredits + pkg.bonusCredits;

  return (
    <Box
      component={motion.div}
      variants={{
        hidden: { opacity: 0, y: 16 },
        show: { opacity: 1, y: 0, transition: SHEET_SPRING },
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onSelect}
      role="button"
      aria-label={`Elegir paquete ${pkg.label}`}
      sx={{
        position: "relative",
        cursor: "pointer",
        borderRadius: 18,
        p: { xs: 1.5, md: 1.75 },
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        // Degradado sólido por tier (sin fotos)
        background: `linear-gradient(135deg, ${pkg.accentColor}33 0%, rgba(255,255,255,0.04) 60%)`,
        border: featured
          ? `1.5px solid ${pkg.accentColor}`
          : "1px solid rgba(255,255,255,0.12)",
        boxShadow: featured
          ? `0 0 0 1px ${pkg.accentColor}40, 0 6px 22px ${pkg.accentColor}33`
          : "0 4px 16px rgba(0,0,0,0.25)",
      }}
    >
      {/* Ícono del tier en disco */}
      <Box
        sx={{
          flexShrink: 0,
          width: 48,
          height: 48,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          bgcolor: `${pkg.accentColor}22`,
          border: `1px solid ${pkg.accentColor}66`,
          color: pkg.accentColor,
        }}
      >
        {pkg.icon}
      </Box>

      {/* Centro: tier + badge + créditos + bonus */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
          <Typography
            sx={{
              fontFamily: "var(--font-playfair), serif",
              fontWeight: 700,
              color: "#fff",
              fontSize: "1.05rem",
              lineHeight: 1.1,
            }}
          >
            {pkg.label}
          </Typography>
          {pkg.badge && (
            <Box
              sx={{
                px: 0.85,
                py: 0.2,
                borderRadius: 999,
                bgcolor: pkg.accentColor,
                color: pkg.tier === "oro" ? "#212121" : "#1a0009",
                fontSize: "0.58rem",
                fontWeight: 800,
                letterSpacing: "0.05em",
                whiteSpace: "nowrap",
              }}
            >
              {pkg.badge}
            </Box>
          )}
        </Stack>

        <Stack direction="row" alignItems="baseline" gap={0.5} mt={0.25}>
          <Typography
            sx={{
              fontWeight: 800,
              color: "#fff",
              fontSize: "1.3rem",
              lineHeight: 1,
            }}
          >
            {totalCredits}
          </Typography>
          <Typography
            sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}
          >
            créditos
          </Typography>
          {pkg.bonusCredits > 0 && (
            <Stack
              direction="row"
              alignItems="center"
              gap={0.35}
              sx={{
                ml: 0.5,
                px: 0.75,
                py: 0.15,
                borderRadius: 999,
                bgcolor: `${GOLD}22`,
                border: `1px solid ${GOLD}66`,
              }}
            >
              <AutoAwesomeRounded sx={{ fontSize: 12, color: GOLD }} />
              <Typography
                sx={{
                  color: GOLD,
                  fontSize: "0.65rem",
                  fontWeight: 800,
                  letterSpacing: "0.03em",
                }}
              >
                +{pkg.bonusCredits} BONUS
              </Typography>
            </Stack>
          )}
        </Stack>
      </Box>

      {/* Derecha: precio + CTA */}
      <Stack alignItems="flex-end" gap={0.5} sx={{ flexShrink: 0 }}>
        <Typography sx={{ color: GOLD, fontWeight: 800, fontSize: "0.95rem" }}>
          {formatARS(pkg.amountARS)}
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          sx={{
            fontWeight: 800,
            borderRadius: 10,
            color: "#212121",
            py: 0.4,
            px: 1.5,
            minHeight: 0,
          }}
        >
          Elegir
        </Button>
      </Stack>
    </Box>
  );
}
