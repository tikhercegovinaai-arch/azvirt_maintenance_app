/**
 * PDF export utilities for maintenance data
 * Uses a simple text-based approach for React Native compatibility
 */

import { AppState } from "@/types";

interface PDFOptions {
  title: string;
  author?: string;
  subject?: string;
}

/**
 * Generate a simple text-based PDF content for monthly report
 */
export function generateMonthlyReportPDF(appState: AppState, month: string): string {
  const lines: string[] = [];

  // Header
  lines.push("=".repeat(80));
  lines.push("AZVIRT - MJESEČNI IZVJEŠTAJ");
  lines.push(`Mjesec: ${month}`);
  lines.push("=".repeat(80));
  lines.push("");

  // Equipment breakdown
  lines.push("PREGLED PO OPREMI");
  lines.push("-".repeat(80));
  lines.push(
    `${"Oprema".padEnd(30)} ${"Sati".padEnd(10)} ${"Gorivo (L)".padEnd(15)} ${"Trošak (€)".padEnd(15)}`,
  );
  lines.push("-".repeat(80));

  let totalFuel = 0;
  let totalCost = 0;

  appState.equipment.forEach((equipment) => {
    const serviceRecords = appState.serviceRecords.filter(
      (r) => r.equipmentId === equipment.id,
    );
    const fuelLogs = appState.fuelLogs.filter((f) => f.equipmentId === equipment.id);

    const totalServiceCost = serviceRecords.reduce((sum, r) => sum + r.cost, 0);
    const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + f.litersAdded, 0);
    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);
    const equipmentCost = totalFuelCost + totalServiceCost;

    totalFuel += totalFuelLiters;
    totalCost += equipmentCost;

    lines.push(
      `${equipment.displayName.padEnd(30)} ${equipment.currentHours.toString().padEnd(10)} ${totalFuelLiters.toFixed(1).padEnd(15)} ${equipmentCost.toFixed(2).padEnd(15)}`,
    );
  });

  lines.push("-".repeat(80));
  lines.push(
    `${"UKUPNO".padEnd(30)} ${"".padEnd(10)} ${totalFuel.toFixed(1).padEnd(15)} ${totalCost.toFixed(2).padEnd(15)}`,
  );
  lines.push("");

  // Key metrics
  lines.push("KLJUČNI POKAZATELJI");
  lines.push("-".repeat(80));

  const totalHours = appState.equipment.reduce((sum, e) => sum + e.currentHours, 0);
  const fuelEfficiency = totalHours > 0 ? (totalFuel / totalHours).toFixed(2) : "0.00";
  const costPerHour = totalHours > 0 ? (totalCost / totalHours).toFixed(2) : "0.00";

  lines.push(`Prosječna Potrošnja Goriva: ${fuelEfficiency} L/sat`);
  lines.push(`Trošak po Radnom Satu: €${costPerHour}/sat`);
  lines.push(`Ukupno Radnih Sati: ${totalHours}h`);
  lines.push(`Broj Servisa: ${appState.serviceRecords.length}`);
  lines.push("");

  // Service summary
  if (appState.serviceRecords.length > 0) {
    lines.push("IZVRŠENI SERVISI");
    lines.push("-".repeat(80));
    appState.serviceRecords.forEach((record) => {
      const equipment = appState.equipment.find((e) => e.id === record.equipmentId);
      lines.push(`${record.date} - ${equipment?.displayName}: ${record.serviceType} (€${record.cost})`);
    });
    lines.push("");
  }

  lines.push("=".repeat(80));
  lines.push(`Izvještaj generisan: ${new Date().toLocaleString()}`);
  lines.push("=".repeat(80));

  return lines.join("\n");
}

/**
 * Generate a simple text-based PDF content for service history
 */
export function generateServiceHistoryPDF(appState: AppState): string {
  const lines: string[] = [];

  // Header
  lines.push("=".repeat(100));
  lines.push("AZVIRT - EVIDENCIJA SERVISA");
  lines.push("=".repeat(100));
  lines.push("");

  if (appState.serviceRecords.length === 0) {
    lines.push("Nema servisa u evidenciji.");
    lines.push("");
  } else {
    lines.push("KOMPLETNA ISTORIJA SERVISA");
    lines.push("-".repeat(100));

    appState.serviceRecords.forEach((record, index) => {
      const equipment = appState.equipment.find((e) => e.id === record.equipmentId);

      lines.push(`[${index + 1}] ${record.date}`);
      lines.push(`    Oprema: ${equipment?.displayName || "Nepoznato"}`);
      lines.push(`    Tip Servisa: ${record.serviceType}`);
      lines.push(`    Sati na Servisu: ${record.hoursAtService}`);
      lines.push(`    Trošak: €${record.cost.toFixed(2)}`);
      lines.push(`    Tehničar: ${record.technician}`);
      if (record.notes) {
        lines.push(`    Napomene: ${record.notes}`);
      }
      if (record.partsUsed.length > 0) {
        lines.push(`    Korišteni Dijelovi: ${record.partsUsed.join(", ")}`);
      }
      lines.push("");
    });

    lines.push("-".repeat(100));
    const totalCost = appState.serviceRecords.reduce((sum, r) => sum + r.cost, 0);
    lines.push(`UKUPAN TROŠAK SERVISA: €${totalCost.toFixed(2)}`);
    lines.push(`BROJ SERVISA: ${appState.serviceRecords.length}`);
    lines.push("");
  }

  lines.push("=".repeat(100));
  lines.push(`Izvještaj generisan: ${new Date().toLocaleString()}`);
  lines.push("=".repeat(100));

  return lines.join("\n");
}

/**
 * Generate a simple text-based PDF content for inventory
 */
export function generateInventoryPDF(appState: AppState): string {
  const lines: string[] = [];

  // Header
  lines.push("=".repeat(100));
  lines.push("AZVIRT - INVENTAR REZERVNIH DIJELOVA");
  lines.push("=".repeat(100));
  lines.push("");

  if (appState.spareParts.length === 0) {
    lines.push("Nema dijelova u inventaru.");
    lines.push("");
  } else {
    lines.push("EVIDENCIJA DIJELOVA");
    lines.push("-".repeat(100));

    appState.spareParts.forEach((part, index) => {
      const status =
        part.currentStock <= part.minimumLevel
          ? "KRITIČNO"
          : part.currentStock < part.minimumLevel * 1.5
            ? "NISKO"
            : "DOBRO";

      const equipmentName =
        part.equipment === "all"
          ? "Sve"
          : part.equipment === "mixer"
            ? "Mješalica"
            : part.equipment === "loader"
              ? "Utovarivač"
              : "Generator";

      lines.push(`[${index + 1}] ${part.name}`);
      lines.push(`    Kataloški Broj: ${part.partNumber}`);
      lines.push(`    Oprema: ${equipmentName}`);
      lines.push(`    Količina na Lageru: ${part.currentStock}`);
      lines.push(`    Minimalna Razina: ${part.minimumLevel}`);
      lines.push(`    Status: ${status}`);
      lines.push(`    Cijena po Komadu: €${part.price.toFixed(2)}`);
      lines.push(`    Ukupna Vrijednost: €${(part.currentStock * part.price).toFixed(2)}`);
      if (part.supplier) {
        lines.push(`    Dobavljač: ${part.supplier}`);
      }
      lines.push("");
    });

    lines.push("-".repeat(100));
    const totalValue = appState.spareParts.reduce(
      (sum, part) => sum + part.currentStock * part.price,
      0,
    );
    lines.push(`UKUPNA VRIJEDNOST ZALIHA: €${totalValue.toFixed(2)}`);
    lines.push(`BROJ DIJELOVA: ${appState.spareParts.length}`);

    const criticalParts = appState.spareParts.filter(
      (p) => p.currentStock <= p.minimumLevel,
    );
    if (criticalParts.length > 0) {
      lines.push(`DIJELOVI NA KRITIČNOJ RAZINI: ${criticalParts.length}`);
      criticalParts.forEach((part) => {
        lines.push(`  - ${part.name} (dostupno: ${part.currentStock}, minimum: ${part.minimumLevel})`);
      });
    }
    lines.push("");
  }

  lines.push("=".repeat(100));
  lines.push(`Izvještaj generisan: ${new Date().toLocaleString()}`);
  lines.push("=".repeat(100));

  return lines.join("\n");
}

/**
 * Create a downloadable text file blob (for PDF-like export)
 */
export function createTextBlob(content: string): Blob {
  return new Blob([content], { type: "text/plain;charset=utf-8;" });
}

/**
 * Generate filename with timestamp
 */
export function generatePDFFilename(prefix: string): string {
  const now = new Date();
  const timestamp = now.toISOString().split("T")[0]; // YYYY-MM-DD format
  return `${prefix}_${timestamp}.txt`;
}
