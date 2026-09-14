"use client";

import {
  ArrowBackRounded,
  AutoAwesomeRounded,
  CheckCircleRounded,
  CheckRounded,
  CloseRounded,
  CloudUploadRounded,
  ContentCopyRounded,
  DiamondRounded,
  MilitaryTechRounded,
  WhatsApp,
  WorkspacePremiumRounded,
} from "@mui/icons-material";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  IconButton,
  InputAdornment,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { AnimatePresence, motion } from "framer-motion";
import type { ReactNode } from "react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import {
  BANK_ACCOUNTS,
  type BankAccount,
  SUPPORT_WHATSAPP,
} from "@/lib/constants/bankAccounts";
import { useCreatePaymentRequest } from "@/lib/hooks/mutations/usePaymentMutations";
import { usePublicPricing } from "@/lib/hooks/queries/useSystemConfigQueries";
import { useCreditPurchaseStore } from "@/lib/stores/creditPurchaseStore";
import { uploadToStorage } from "@/lib/upload";

/**
 * Modal REAL de recarga de créditos (premium bottom-sheet).
 * Reemplaza al Dialog viejo. Controlado por creditPurchaseStore.
 *
 * IMPORTANTE: la lógica de pago NO cambia — sigue siendo transferencia manual +
 * comprobante + useCreatePaymentRequest → aprobación del admin. La pasarela de
 * pago (MercadoPago Checkout Pro) se integrará después.
 *
 * Modelo de precios: el MONTO deriva de la config (`créditos × creditPrice` de
 * usePublicPricing); los tiers (CREDIT_TIERS) solo agregan créditos bonus por
 * volumen. Así, si el admin cambia el precio, todo se recalcula solo.
 */

/**
 * Modelo "paquetes = solo bonus": el MONTO siempre deriva de la config
 * (`créditos × creditPrice`), nunca es un valor fijo. Los tiers son umbrales
 * en CRÉDITOS comprados que regalan créditos bonus. Así, si el admin cambia
 * `creditPrice`, los precios mostrados se recalculan solos (cero incoherencia).
 */
interface CreditTier {
  tier: "bronce" | "plata" | "oro";
  label: string;
  minCredits: number; // umbral de compra (en créditos) para desbloquear el bonus
  bonusCredits: number; // créditos de regalo al alcanzar el umbral
  badge?: string;
  accentColor: string;
  icon: ReactNode;
}

const GOLD = "#DCA621";
const BORDO = "#380116";

// Ordenados por umbral ascendente (tierForCredits/nextTier lo asumen).
const CREDIT_TIERS: CreditTier[] = [
  {
    tier: "bronce",
    label: "Bronce",
    minCredits: 5,
    bonusCredits: 1,
    accentColor: "#B87333",
    icon: <MilitaryTechRounded sx={{ fontSize: 26 }} />,
  },
  {
    tier: "plata",
    label: "Plata",
    minCredits: 10,
    bonusCredits: 2,
    badge: "POPULAR",
    accentColor: "#C0C0C0",
    icon: <WorkspacePremiumRounded sx={{ fontSize: 26 }} />,
  },
  {
    tier: "oro",
    label: "Oro",
    minCredits: 20,
    bonusCredits: 4,
    badge: "MEJOR VALOR",
    accentColor: GOLD,
    icon: <DiamondRounded sx={{ fontSize: 26 }} />,
  },
];

// Tier alcanzado por N créditos comprados (el de mayor umbral ≤ credits), o null.
export function tierForCredits(credits: number): CreditTier | null {
  let match: CreditTier | null = null;
  for (const t of CREDIT_TIERS) {
    if (credits >= t.minCredits) match = t;
  }
  return match;
}

// Próximo tier aún no alcanzado, para la recomendación de upsell (o null si ya está en el tope).
export function nextTier(credits: number): CreditTier | null {
  return CREDIT_TIERS.find((t) => credits < t.minCredits) ?? null;
}

const formatARS = (value: number) => `$${value.toLocaleString("es-AR")}`;

const SHEET_SPRING = { type: "spring", damping: 30, stiffness: 300 } as const;

type Step = "select" | "checkout" | "done";

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
  const [isUploading, setIsUploading] = useState(false);
  // Preview local del comprobante: el receipt es privado (se guarda la KEY, no una URL),
  // así que para mostrarlo en el checkout usamos un object URL del File en memoria.
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("select");
  // Resumen del paso "done": lo guardamos antes de resetPurchase para seguir mostrándolo.
  const [doneSummary, setDoneSummary] = useState<{
    credits: number;
    amount: number;
  }>({ credits: 0, amount: 0 });
  // El usuario ingresa CRÉDITOS; el monto se deriva de la config (creditPrice).
  const [customCreds, setCustomCreds] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  // Desglose visual (base/bonus) del paquete elegido — el backend solo guarda el total.
  const [breakdown, setBreakdown] = useState<{ base: number; bonus: number }>({
    base: 0,
    bonus: 0,
  });

  const creditPrice = pricing?.creditPrice ?? 0;
  const amountForCredits = (credits: number) => credits * creditPrice;

  const handleClose = () => {
    if (createPaymentMutation.isPending) return;
    resetPurchase();
    setCustomCreds(0);
    setUploadError(null);
    setBreakdown({ base: 0, bonus: 0 });
    setDoneSummary({ credits: 0, amount: 0 });
    setReceiptPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    setStep("select");
    closeModal();
  };

  // Confirma una compra de N créditos base: aplica el bonus del tier alcanzado,
  // cobra solo la base (base × creditPrice) y guarda el total (base + bonus).
  const confirmCredits = (baseCredits: number) => {
    if (baseCredits <= 0 || !pricing) {
      toast.error("Por favor ingresá una cantidad válida");
      return;
    }
    const bonus = tierForCredits(baseCredits)?.bonusCredits ?? 0;
    setCustomAmount(amountForCredits(baseCredits));
    setCustomCredits(baseCredits + bonus);
    setBreakdown({ base: baseCredits, bonus });
    setStep("checkout");
  };

  const handleSelectPackage = (tier: CreditTier) => confirmCredits(tier.minCredits);
  const handleConfirmCustom = () => confirmCredits(customCreds);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setIsUploading(true);
    // Preview inmediato desde el archivo local (el receipt privado guarda la key, no una URL).
    setReceiptPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    try {
      const result = await uploadToStorage("receipt", file);
      setReceiptUrl(result.url);
      toast.success("Comprobante subido correctamente");
    } catch {
      setUploadError("Error al subir el comprobante");
      toast.error("Error al subir el comprobante");
    } finally {
      setIsUploading(false);
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
          setDoneSummary({ credits: customCredits, amount: customAmount });
          resetPurchase();
          setCustomCreds(0);
          setBreakdown({ base: 0, bonus: 0 });
          setReceiptPreview((prev) => {
            if (prev) URL.revokeObjectURL(prev);
            return null;
          });
          setStep("done");
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
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            sx={{
              position: "relative",
              width: "100%",
              maxWidth: { xs: "100%", md: 1080 },
              height: { xs: "auto", md: "auto" },
              maxHeight: { xs: "100dvh", md: "92vh" },
              overflowY: "auto",
              borderTopLeftRadius: 28,
              borderTopRightRadius: 28,
              borderBottomLeftRadius: { xs: 0, md: 28 },
              borderBottomRightRadius: { xs: 0, md: 28 },
              background: `linear-gradient(160deg, #1a0009 0%, ${BORDO} 55%, #2a0011 100%)`,
              boxShadow: "0 -12px 48px rgba(0,0,0,0.45)",
              px: { xs: 2.5, md: 5 },
              pt: 1.5,
              pb: { xs: "calc(32px + env(safe-area-inset-bottom))", md: 5 },
            }}
          >
            {/* Grabber estilo iOS — único punto de swipe-para-cerrar.
                El drag NO puede vivir en la sheet: competiría con overflowY:auto
                y robaría el scroll (cerraría el modal al intentar scrollear). */}
            <Box
              component={motion.div}
              drag="y"
              // Elastic 0 + constraints 0/0 clavan el grabber en su lugar (no se
              // desplaza visualmente al arrastrar), pero info.offset.y sigue
              // midiendo el gesto real. Mata el bug visual sin perder la feature.
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={0}
              onDragEnd={(_, info) => {
                if (info.offset.y > 120 || info.velocity.y > 500) handleClose();
              }}
              sx={{
                width: 60,
                height: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 1,
                cursor: "grab",
                touchAction: "none",
                "&:active": { cursor: "grabbing" },
                "&::before": {
                  content: '""',
                  width: 44,
                  height: 5,
                  borderRadius: 999,
                  bgcolor: "rgba(255,255,255,0.3)",
                },
              }}
            />

            {/* Botón cerrar */}
            <Button
              onClick={handleClose}
              aria-label="Cerrar"
              sx={{
                position: "absolute",
                top: "calc(14px + env(safe-area-inset-top))",
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
              {step === "select" && (
                <motion.div
                  key="select"
                  initial={{ opacity: 0, x: -24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  transition={SHEET_SPRING}
                >
                  <SelectStep
                    customCreds={customCreds}
                    setCustomCreds={setCustomCreds}
                    creditPrice={creditPrice}
                    onSelectPackage={handleSelectPackage}
                    onConfirmCustom={handleConfirmCustom}
                  />
                </motion.div>
              )}
              {step === "checkout" && (
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
                    receiptPreview={receiptPreview}
                    onBack={() => setStep("select")}
                    onFileUpload={handleFileUpload}
                    onSubmit={handleSubmit}
                    isUploading={isUploading}
                    uploadError={uploadError}
                    isSubmitting={createPaymentMutation.isPending}
                  />
                </motion.div>
              )}
              {step === "done" && (
                <motion.div
                  key="done"
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 24 }}
                  transition={SHEET_SPRING}
                >
                  <DoneStep
                    credits={doneSummary.credits}
                    amount={doneSummary.amount}
                    onClose={handleClose}
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
  customCreds,
  setCustomCreds,
  creditPrice,
  onSelectPackage,
  onConfirmCustom,
}: {
  customCreds: number;
  setCustomCreds: (v: number) => void;
  creditPrice: number;
  onSelectPackage: (tier: CreditTier) => void;
  onConfirmCustom: () => void;
}) {
  // Monto derivado de la config y bonus/recomendación según los créditos ingresados.
  const amount = useMemo(
    () => customCreds * creditPrice,
    [customCreds, creditPrice],
  );
  const reachedBonus = useMemo(
    () => tierForCredits(customCreds)?.bonusCredits ?? 0,
    [customCreds],
  );
  const upsell = useMemo(() => nextTier(customCreds), [customCreds]);

  return (
    <>
      {/* Encabezado */}
      <Stack
        alignItems="center"
        textAlign="center"
        gap={0.75}
        mt={{ xs: 3.5, md: 0 }}
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
        {CREDIT_TIERS.map((tier) => (
          <PackageCard
            key={tier.tier}
            tier={tier}
            creditPrice={creditPrice}
            onSelect={() => onSelectPackage(tier)}
          />
        ))}
      </Stack>

      {/* Otra cantidad (créditos libres) */}
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
          sx={{
            color: "#fff",
            fontWeight: 700,
            fontSize: "1rem",
            mb: 1.5,
            ml: 2,
          }}
        >
          ¿Otra cantidad de créditos?
        </Typography>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          gap={1.5}
          alignItems={{ xs: "stretch", sm: "center" }}
          ml={2}
        >
          <TextField
            type="number"
            placeholder="Ej: 8"
            value={customCreds || ""}
            onChange={(e) =>
              setCustomCreds(Math.max(0, Math.floor(Number(e.target.value))))
            }
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <Typography sx={{ color: "rgba(255,255,255,0.6)" }}>
                    créditos
                  </Typography>
                </InputAdornment>
              ),
            }}
            inputProps={{ min: 0, step: 1 }}
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
            disabled={customCreds <= 0 || creditPrice <= 0}
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
        {customCreds > 0 && creditPrice > 0 && (
          <Stack sx={{ mt: 1, ml: 2 }} gap={0.5}>
            <Typography
              sx={{ color: GOLD, fontSize: "0.9rem", fontWeight: 700 }}
            >
              El monto es {formatARS(amount)}
              {reachedBonus > 0 && (
                <Typography
                  component="span"
                  sx={{
                    color: "rgba(255,255,255,0.75)",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                  }}
                >
                  {" "}
                  · recibís {customCreds} + {reachedBonus} de regalo ={" "}
                  {customCreds + reachedBonus}
                </Typography>
              )}
            </Typography>
            {upsell && (
              <Typography
                sx={{
                  color: "rgba(255,255,255,0.65)",
                  fontSize: "0.78rem",
                }}
              >
                💡 Sumá {upsell.minCredits - customCreds} crédito
                {upsell.minCredits - customCreds === 1 ? "" : "s"} más y con el
                paquete {upsell.label} recibís +{upsell.bonusCredits} de regalo.
              </Typography>
            )}
          </Stack>
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
  receiptPreview,
  onBack,
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
  receiptPreview: string | null;
  onBack: () => void;
  onFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
  isUploading: boolean;
  uploadError: string | null;
  isSubmitting: boolean;
}) {
  const [viewerOpen, setViewerOpen] = useState(false);
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
        <Typography
          sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem", ml: 2 }}
        >
          Vas a recargar
        </Typography>
        <Stack
          direction="row"
          alignItems="baseline"
          justifyContent="space-between"
          mt={0.5}
          ml={2}
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
            ml={2}
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
        Realizá la transferencia a alguna de estas cuentas:
      </Typography>
      <Stack spacing={1.25} mb={2}>
        {BANK_ACCOUNTS.map((account) => (
          <BankAccountCard key={account.id} account={account} />
        ))}
      </Stack>

      {/* Upload de comprobante */}
      <Typography
        sx={{ color: "#fff", fontWeight: 700, fontSize: "0.95rem", mb: 1 }}
      >
        Subí tu comprobante
      </Typography>
      {receiptUrl ? (
        // Renglón compacto: no metemos la img en el flujo scrolleable (una foto
        // vertical estiraba la sheet). Tap → visor en Dialog aparte.
        <Box
          onClick={() => setViewerOpen(true)}
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.25,
            border: "2px solid",
            borderColor: GOLD,
            borderRadius: 14,
            px: 2,
            py: 1.5,
            cursor: "pointer",
            bgcolor: "rgba(255,255,255,0.03)",
            "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
          }}
        >
          <CheckCircleRounded sx={{ fontSize: 24, color: GOLD }} />
          <Typography sx={{ color: GOLD, fontWeight: 600, flex: 1 }}>
            Comprobante subido
          </Typography>
          <Typography
            sx={{ color: "rgba(255,255,255,0.6)", fontSize: "0.8rem" }}
          >
            Ver / cambiar
          </Typography>
        </Box>
      ) : (
        <Box
          sx={{
            border: "2px dashed",
            borderColor: "rgba(255,255,255,0.25)",
            borderRadius: 14,
            p: 3,
            textAlign: "center",
            bgcolor: "rgba(255,255,255,0.03)",
          }}
        >
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
        </Box>
      )}

      {/* Enviar */}
      <Button
        fullWidth
        variant="contained"
        color="secondary"
        size="large"
        onClick={onSubmit}
        disabled={amount <= 0 || !receiptUrl || isSubmitting || isUploading}
        startIcon={isSubmitting ? <CircularProgress size={20} /> : undefined}
        sx={{
          mt: 3,
          mb: { xs: 3, md: 0 },
          fontWeight: 800,
          borderRadius: 12,
          color: "#212121",
        }}
      >
        {isSubmitting ? "Enviando..." : "Enviar Solicitud"}
      </Button>

      {/* Visor de comprobante en Dialog aparte (fuera del flujo scrolleable) */}
      <Dialog
        open={viewerOpen}
        onClose={() => setViewerOpen(false)}
        maxWidth="sm"
        fullWidth
        sx={{ zIndex: 1500 }}
        PaperProps={{
          sx: {
            bgcolor: "#1a0009",
            borderRadius: 3,
            p: 2,
          },
        }}
      >
        <Box
          component="img"
          src={receiptPreview ?? undefined}
          alt="Comprobante"
          sx={{
            width: "100%",
            maxHeight: "80vh",
            objectFit: "contain",
            borderRadius: 2,
            display: "block",
          }}
        />
        <Stack direction="row" spacing={1.5} mt={2} alignItems="center">
          <Button
            component="label"
            variant="contained"
            color="secondary"
            size="large"
            disabled={isUploading}
            sx={{
              flex: 2,
              fontWeight: 700,
              borderRadius: 12,
              color: "#212121",
              py: 1.25,
              whiteSpace: "nowrap",
            }}
          >
            {isUploading ? "Subiendo..." : "Cambiar imagen"}
            <input
              type="file"
              hidden
              accept="image/*"
              onChange={(e) => {
                onFileUpload(e);
                setViewerOpen(false);
              }}
            />
          </Button>
          <Button
            onClick={() => setViewerOpen(false)}
            sx={{
              flex: 1,
              color: "rgba(255,255,255,0.8)",
              fontWeight: 600,
              whiteSpace: "nowrap",
            }}
          >
            Cerrar
          </Button>
        </Stack>
      </Dialog>
    </Box>
  );
}

function DoneStep({
  credits,
  amount,
  onClose,
}: {
  credits: number;
  amount: number;
  onClose: () => void;
}) {
  const sendWhatsApp = () => {
    const msg = encodeURIComponent(
      `Hola, envío mi comprobante de recarga de ${credits} créditos (${formatARS(amount)}).`,
    );
    window.open(
      `https://wa.me/${SUPPORT_WHATSAPP}?text=${msg}`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", textAlign: "center", py: 2 }}>
      <CheckCircleRounded sx={{ fontSize: 64, color: GOLD, mb: 1.5 }} />
      <Typography
        sx={{
          fontFamily: "var(--font-playfair), serif",
          fontWeight: 700,
          color: "#fff",
          fontSize: { xs: "1.4rem", md: "1.75rem" },
          mb: 1,
        }}
      >
        ¡Solicitud enviada!
      </Typography>
      <Typography
        sx={{
          color: "rgba(255,255,255,0.6)",
          fontSize: "0.9rem",
          maxWidth: 380,
          mx: "auto",
          mb: 3,
        }}
      >
        Recibimos tu comprobante de {credits} créditos ({formatARS(amount)}). Un
        administrador lo revisará y acreditará los créditos a la brevedad.
      </Typography>

      <Button
        fullWidth
        variant="contained"
        onClick={sendWhatsApp}
        startIcon={<WhatsApp />}
        sx={{
          fontWeight: 800,
          borderRadius: 12,
          bgcolor: "#25D366",
          color: "#fff",
          mb: 1,
          "&:hover": { bgcolor: "#1EBE5A" },
        }}
      >
        Enviar comprobante por WhatsApp
      </Button>
      <Typography
        sx={{ color: "rgba(255,255,255,0.5)", fontSize: "0.72rem", mb: 2.5 }}
      >
        Opcional. Adjuntá la foto del comprobante en el chat.
      </Typography>

      <Button
        fullWidth
        variant="text"
        onClick={onClose}
        sx={{ color: "rgba(255,255,255,0.8)", fontWeight: 700, borderRadius: 12 }}
      >
        Cerrar
      </Button>
    </Box>
  );
}

function PackageCard({
  tier: pkg,
  creditPrice,
  onSelect,
}: {
  tier: CreditTier;
  creditPrice: number;
  onSelect: () => void;
}) {
  const featured = pkg.tier === "oro";
  const totalCredits = pkg.minCredits + pkg.bonusCredits;
  const priceLabel = creditPrice > 0 ? formatARS(pkg.minCredits * creditPrice) : "—";

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
        </Stack>
        {pkg.bonusCredits > 0 && (
          <Stack
            direction="row"
            alignItems="center"
            gap={0.35}
            sx={{
              mt: 0.5,
              width: "fit-content",
              px: 0.75,
              py: 0.15,
              borderRadius: 999,
              bgcolor: `${GOLD}22`,
              border: `1px solid ${GOLD}66`,
            }}
          >
            <AutoAwesomeRounded
              sx={{ fontSize: 11, color: GOLD, flexShrink: 0 }}
            />
            <Typography
              sx={{
                color: GOLD,
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.02em",
                whiteSpace: "nowrap",
              }}
            >
              +{pkg.bonusCredits} BONUS
            </Typography>
          </Stack>
        )}
      </Box>

      {/* Derecha: precio + CTA */}
      <Stack alignItems="flex-end" gap={0.5} sx={{ flexShrink: 0 }}>
        <Typography sx={{ color: GOLD, fontWeight: 800, fontSize: "0.95rem" }}>
          {priceLabel}
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

function BankAccountCard({ account }: { account: BankAccount }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `Alias: ${account.alias}\n${account.accountType}: ${account.accountNumber}\nTitular: ${account.holder}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success("Datos copiados");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("No se pudo copiar");
    }
  };

  // Copia SOLO el alias y abre Mercado Pago (app en mobile, web en desktop).
  // No se puede prellenar monto/alias sin Checkout Pro (comisión), así que
  // dejamos el alias en el portapapeles para pegarlo en un tap.
  const handleOpenMP = async () => {
    try {
      await navigator.clipboard.writeText(account.alias);
      toast.success("Alias copiado — pegalo en Mercado Pago");
    } catch {
      toast("Copiá el alias manualmente", { icon: "ℹ️" });
    }
    // Ruta directa a "transferir". En mobile, los Universal/App Links de MP
    // hacen que el SO abra la app instalada; en desktop abre la web.
    window.open(
      "https://www.mercadopago.com.ar/money-out/transfer/discovery",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <Box
      sx={{
        p: 1.25,
        borderRadius: 12,
        bgcolor: "rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.12)",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ flex: 1, minWidth: 0, ml: 2 }}>
        <Stack direction="row" alignItems="center" gap={0.75} flexWrap="wrap">
          <Typography
            sx={{ color: "#fff", fontWeight: 700, fontSize: "0.85rem" }}
          >
            {account.alias}
          </Typography>
          {account.bank && (
            <Box
              sx={{
                px: 0.75,
                py: 0.15,
                borderRadius: 999,
                bgcolor: `${GOLD}22`,
                border: `1px solid ${GOLD}66`,
                color: GOLD,
                fontSize: "0.6rem",
                fontWeight: 800,
                letterSpacing: "0.03em",
                whiteSpace: "nowrap",
              }}
            >
              {account.bank}
            </Box>
          )}
        </Stack>
        <Typography
          sx={{ color: "rgba(255,255,255,0.85)", fontSize: "0.8rem", mt: 0.25 }}
        >
          {account.accountType}: {account.accountNumber}
        </Typography>
        <Typography
          sx={{ color: "rgba(255,255,255,0.55)", fontSize: "0.7rem" }}
        >
          Titular: {account.holder}
        </Typography>
      </Box>
      <IconButton
        onClick={handleCopy}
        aria-label={`Copiar datos de ${account.alias}`}
        size="small"
        sx={{
          color: copied ? GOLD : "rgba(255,255,255,0.7)",
          bgcolor: "rgba(255,255,255,0.06)",
          "&:hover": { bgcolor: "rgba(255,255,255,0.14)" },
        }}
      >
        {copied ? (
          <CheckRounded sx={{ fontSize: 18 }} />
        ) : (
          <ContentCopyRounded sx={{ fontSize: 18 }} />
        )}
      </IconButton>
      </Box>

      {/* Abrir Mercado Pago con el alias ya copiado (solo el logo) */}
      <Button
        fullWidth
        onClick={handleOpenMP}
        aria-label="Abrir Mercado Pago"
        sx={{
          mt: 1.25,
          p: 0.75,
          borderRadius: 10,
          bgcolor: "#fff",
          "&:hover": { bgcolor: "#f2f2f2" },
        }}
      >
        <Box
          component="img"
          src="/mercadopago-icon.jpg"
          alt="Mercado Pago"
          sx={{ height: 28, width: "auto", display: "block" }}
        />
      </Button>
      <Typography
        sx={{
          mt: 0.75,
          color: "rgba(255,255,255,0.5)",
          fontSize: "0.68rem",
          textAlign: "center",
        }}
      >
        Se copia el alias. Pegalo en “Transferir” e ingresá el monto.
      </Typography>
    </Box>
  );
}
