import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Trip } from "@/lib/types/api";

// Design system colors
const COLORS = {
  bordo: [56, 1, 22] as [number, number, number], // #380116
  oro: [220, 166, 33] as [number, number, number], // #DCA621
  success: [46, 204, 113] as [number, number, number], // #2ECC71
  textGray: [100, 100, 100] as [number, number, number],
  textBlack: [0, 0, 0] as [number, number, number],
};

/**
 * Generate client trip receipt PDF
 */
export function generateClientReceipt(trip: Trip) {
  const doc = new jsPDF();

  // Validación estricta: travelMatch es requerido
  if (!trip.travelMatch) {
    console.error("Trip.travelMatch is missing:", trip);
    throw new Error("No se puede generar el comprobante: datos del viaje incompletos");
  }

  const match = trip.travelMatch;
  const userName = trip.user?.name || "Cliente";

  // ===== HEADER SECTION =====
  // Logo placeholder/title
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.bordo);
  doc.setFont("helvetica", "bold");
  doc.text("FlexPress", 105, 25, { align: "center" });

  // Personalized greeting
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textBlack);
  doc.setFont("helvetica", "normal");
  const greeting = `Aquí está el recibo de tu viaje, ${userName}.`;
  doc.text(greeting, 105, 35, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textGray);
  doc.text("Esperamos que disfrutaras la experiencia.", 105, 42, {
    align: "center",
  });

  // Divider line
  doc.setDrawColor(...COLORS.bordo);
  doc.setLineWidth(0.5);
  doc.line(20, 48, 190, 48);

  // ===== DOCUMENT INFO =====
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.bordo);
  doc.setFont("helvetica", "bold");
  doc.text("Comprobante de Viaje", 105, 58, { align: "center" });

  // ID and Date
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textGray);
  doc.setFont("helvetica", "normal");
  doc.text(`ID de Viaje: ${trip.id}`, 20, 68);
  doc.text(
    `Fecha: ${new Date(trip.createdAt).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    20,
    74,
  );

  // ===== TRIP DETAILS TABLE =====
  autoTable(doc, {
    startY: 85,
    head: [["Concepto", "Detalle"]],
    body: [
      ["Cliente", userName],
      ["Chófer Asignado", trip.charter?.name || "No asignado"],
      ["Punto de Origen", match?.pickupAddress || "No especificado"],
      ["Punto de Destino", match?.destinationAddress || "No especificado"],
      ["Distancia Recorrida", `${match?.distanceKm?.toFixed(1) || "0"} km`],
      [
        "Créditos Utilizados",
        `${match?.estimatedCredits || 0} créditos`,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: COLORS.bordo,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 11,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 10,
      textColor: COLORS.textBlack,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: 120 },
    },
    margin: { left: 20, right: 20 },
  });

  // ===== FOOTER SECTION =====
  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // Thank you message
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.bordo);
  doc.setFont("helvetica", "bold");
  doc.text("¡Gracias por elegir FlexPress!", 105, finalY + 20, {
    align: "center",
  });

  // Divider line
  doc.setDrawColor(...COLORS.oro);
  doc.setLineWidth(0.3);
  doc.line(60, finalY + 25, 150, finalY + 25);

  // Generation info
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textGray);
  doc.setFont("helvetica", "italic");
  doc.text(
    `Comprobante generado el ${new Date().toLocaleDateString("es-AR")} a las ${new Date().toLocaleTimeString("es-AR")}`,
    105,
    finalY + 32,
    { align: "center" },
  );

  // Contact info
  doc.setFont("helvetica", "normal");
  doc.text("FlexPress - Soluciones de Transporte", 105, finalY + 38, {
    align: "center",
  });
  doc.text("www.flexpress.com | soporte@flexpress.com", 105, finalY + 43, {
    align: "center",
  });

  return doc;
}

/**
 * Generate charter payment receipt PDF
 */
export function generateCharterReceipt(trip: Trip) {
  const doc = new jsPDF();

  // Validación estricta: travelMatch es requerido
  if (!trip.travelMatch) {
    console.error("Trip.travelMatch is missing:", trip);
    throw new Error("No se puede generar el comprobante: datos del viaje incompletos");
  }

  const match = trip.travelMatch;
  const charterName = trip.charter?.name || "Chófer";

  // ===== HEADER SECTION =====
  // Logo placeholder/title
  doc.setFontSize(28);
  doc.setTextColor(...COLORS.success);
  doc.setFont("helvetica", "bold");
  doc.text("FlexPress", 105, 25, { align: "center" });

  // Personalized greeting
  doc.setFontSize(12);
  doc.setTextColor(...COLORS.textBlack);
  doc.setFont("helvetica", "normal");
  const greeting = `Aquí está el comprobante de tu viaje, ${charterName}.`;
  doc.text(greeting, 105, 35, { align: "center" });

  doc.setFontSize(10);
  doc.setTextColor(...COLORS.textGray);
  doc.text("Esperamos que disfrutaras la experiencia.", 105, 42, {
    align: "center",
  });

  // Divider line
  doc.setDrawColor(...COLORS.success);
  doc.setLineWidth(0.5);
  doc.line(20, 48, 190, 48);

  // ===== DOCUMENT INFO =====
  doc.setFontSize(14);
  doc.setTextColor(...COLORS.success);
  doc.setFont("helvetica", "bold");
  doc.text("Comprobante de Pago", 105, 58, { align: "center" });

  // ID and Date
  doc.setFontSize(9);
  doc.setTextColor(...COLORS.textGray);
  doc.setFont("helvetica", "normal");
  doc.text(`ID de Viaje: ${trip.id}`, 20, 68);
  doc.text(
    `Fecha: ${new Date(trip.createdAt).toLocaleDateString("es-AR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })}`,
    20,
    74,
  );

  // ===== TRIP DETAILS TABLE =====
  autoTable(doc, {
    startY: 85,
    head: [["Concepto", "Detalle"]],
    body: [
      ["Chófer", charterName],
      ["Cliente Atendido", trip.user?.name || "No especificado"],
      ["Punto de Origen", match?.pickupAddress || "No especificado"],
      ["Punto de Destino", match?.destinationAddress || "No especificado"],
      ["Distancia Recorrida", `${match?.distanceKm?.toFixed(1) || "0"} km`],
      [
        "Créditos Ganados",
        `${match?.estimatedCredits || 0} créditos`,
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: COLORS.success,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 11,
      halign: "center",
    },
    bodyStyles: {
      fontSize: 10,
      textColor: COLORS.textBlack,
    },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 60 },
      1: { cellWidth: 120 },
    },
    margin: { left: 20, right: 20 },
  });

  // ===== FOOTER SECTION =====
  const finalY = (doc as any).lastAutoTable.finalY || 150;

  // Thank you message
  doc.setFontSize(11);
  doc.setTextColor(...COLORS.success);
  doc.setFont("helvetica", "bold");
  doc.text("¡Gracias por ser parte de FlexPress!", 105, finalY + 20, {
    align: "center",
  });

  // Divider line
  doc.setDrawColor(...COLORS.oro);
  doc.setLineWidth(0.3);
  doc.line(60, finalY + 25, 150, finalY + 25);

  // Generation info
  doc.setFontSize(8);
  doc.setTextColor(...COLORS.textGray);
  doc.setFont("helvetica", "italic");
  doc.text(
    `Comprobante generado el ${new Date().toLocaleDateString("es-AR")} a las ${new Date().toLocaleTimeString("es-AR")}`,
    105,
    finalY + 32,
    { align: "center" },
  );

  // Contact info
  doc.setFont("helvetica", "normal");
  doc.text("FlexPress - Soluciones de Transporte", 105, finalY + 38, {
    align: "center",
  });
  doc.text("www.flexpress.com | soporte@flexpress.com", 105, finalY + 43, {
    align: "center",
  });

  return doc;
}

/**
 * Download PDF
 */
export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename);
}
