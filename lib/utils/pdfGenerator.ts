import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Trip } from "@/lib/types/api";

/**
 * Generate client trip receipt PDF
 */
export function generateClientReceipt(trip: Trip) {
  const doc = new jsPDF();
  const match = trip.travelMatch;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(102, 126, 234); // Primary color
  doc.text("FlexPress", 20, 20);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Comprobante de Viaje", 20, 35);

  // Trip info
  doc.setFontSize(10);
  doc.text(`ID: ${trip.id}`, 20, 50);
  doc.text(
    `Fecha: ${new Date(trip.createdAt).toLocaleDateString("es-AR")}`,
    20,
    57,
  );

  // Details table
  autoTable(doc, {
    startY: 70,
    head: [["Concepto", "Detalle"]],
    body: [
      ["Cliente", trip.user?.name || "N/A"],
      ["Chófer", trip.charter?.name || "N/A"],
      ["Origen", match?.pickupAddress || "N/A"],
      ["Destino", match?.destinationAddress || "N/A"],
      ["Distancia", `${match?.distanceKm?.toFixed(1) || 0} km`],
      ["Créditos gastados", `${match?.estimatedCredits || 0}`],
    ],
    theme: "grid",
    headStyles: { fillColor: [102, 126, 234] },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("Generado con FlexPress", 20, finalY + 15);
  doc.text(new Date().toLocaleString("es-AR"), 20, finalY + 20);

  return doc;
}

/**
 * Generate charter payment receipt PDF
 */
export function generateCharterReceipt(trip: Trip) {
  const doc = new jsPDF();
  const match = trip.travelMatch;

  // Header
  doc.setFontSize(20);
  doc.setTextColor(76, 175, 80); // Success color
  doc.text("FlexPress", 20, 20);

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 0);
  doc.text("Comprobante de Pago", 20, 35);

  // Trip info
  doc.setFontSize(10);
  doc.text(`ID: ${trip.id}`, 20, 50);
  doc.text(
    `Fecha: ${new Date(trip.createdAt).toLocaleDateString("es-AR")}`,
    20,
    57,
  );

  // Details table
  autoTable(doc, {
    startY: 70,
    head: [["Concepto", "Detalle"]],
    body: [
      ["Chófer", trip.charter?.name || "N/A"],
      ["Cliente", trip.user?.name || "N/A"],
      ["Origen", match?.pickupAddress || "N/A"],
      ["Destino", match?.destinationAddress || "N/A"],
      ["Distancia", `${match?.distanceKm?.toFixed(1) || 0} km`],
      ["Créditos ganados", `${match?.estimatedCredits || 0}`],
    ],
    theme: "grid",
    headStyles: { fillColor: [76, 175, 80] },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || 150;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text("Generado con FlexPress", 20, finalY + 15);
  doc.text(new Date().toLocaleString("es-AR"), 20, finalY + 20);

  return doc;
}

/**
 * Download PDF
 */
export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}
