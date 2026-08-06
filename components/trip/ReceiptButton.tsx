"use client";

import { Download } from "@mui/icons-material";
import { Button } from "@mui/material";
import toast from "react-hot-toast";
import type { Trip as ApiTrip } from "@/lib/types/api";
import type { Trip } from "@/lib/types/trip";
import {
  downloadPDF,
  generateCharterReceipt,
  generateClientReceipt,
} from "@/lib/utils/pdfGenerator";

interface ReceiptButtonProps {
  trip: Trip;
  type: "client" | "charter";
  /** Versión discreta para listas (historial). Default: botón grande de fin de viaje. */
  compact?: boolean;
}

export function ReceiptButton({ trip, type, compact }: ReceiptButtonProps) {
  const handleDownload = () => {
    try {
      // pdfGenerator tipa contra el Trip de lib/types/api; ambos son
      // estructuralmente compatibles en los campos que consume (travelMatch, etc.)
      const apiTrip = trip as unknown as ApiTrip;
      const doc =
        type === "client"
          ? generateClientReceipt(apiTrip)
          : generateCharterReceipt(apiTrip);

      const filename = `comprobante-${trip.id}-${type}.pdf`;
      downloadPDF(doc, filename);
    } catch {
      toast.error("No se pudo generar el comprobante");
    }
  };

  if (compact) {
    return (
      <Button
        variant="text"
        size="small"
        fullWidth
        startIcon={<Download fontSize="small" />}
        onClick={handleDownload}
        sx={{ py: 0.5, fontWeight: 600, color: "secondary.main" }}
      >
        Descargar comprobante
      </Button>
    );
  }

  return (
    <Button
      variant="contained"
      fullWidth
      size="large"
      startIcon={<Download />}
      onClick={handleDownload}
      sx={{
        fontWeight: 700,
        minHeight: 48,
        bgcolor: "secondary.main",
        color: "white",
        "&:hover": {
          bgcolor: "secondary.dark",
        },
        boxShadow: 2,
      }}
    >
      Descargar Comprobante
    </Button>
  );
}
