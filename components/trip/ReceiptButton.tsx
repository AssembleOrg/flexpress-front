"use client";

import { Button } from "@mui/material";
import { Download } from "@mui/icons-material";
import {
  generateClientReceipt,
  generateCharterReceipt,
  downloadPDF,
} from "@/lib/utils/pdfGenerator";
import type { Trip } from "@/lib/types/api";

interface ReceiptButtonProps {
  trip: Trip;
  type: "client" | "charter";
}

export function ReceiptButton({ trip, type }: ReceiptButtonProps) {
  const handleDownload = () => {
    const doc =
      type === "client"
        ? generateClientReceipt(trip)
        : generateCharterReceipt(trip);

    const filename = `comprobante-${trip.id}-${type}.pdf`;
    downloadPDF(doc, filename);
  };

  return (
    <Button
      variant="outlined"
      size="small"
      startIcon={<Download />}
      onClick={handleDownload}
      sx={{ fontWeight: 600 }}
    >
      Descargar Comprobante
    </Button>
  );
}
