/**
 * CSV export utilities for maintenance data
 */

import { AppState, ServiceRecord, SparePart } from "@/types";

/**
 * Escape CSV values and handle special characters
 */
function escapeCSV(value: any): string {
  if (value === null || value === undefined) return "";
  const stringValue = String(value);
  if (stringValue.includes(",") || stringValue.includes('"') || stringValue.includes("\n")) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }
  return stringValue;
}

/**
 * Generate CSV content from array of objects
 */
function generateCSVContent(headers: string[], rows: any[][]): string {
  const csvLines: string[] = [];

  // Add headers
  csvLines.push(headers.map(escapeCSV).join(","));

  // Add data rows
  rows.forEach((row) => {
    csvLines.push(row.map(escapeCSV).join(","));
  });

  return csvLines.join("\n");
}

/**
 * Export monthly report to CSV
 */
export function exportMonthlyReportCSV(appState: AppState, month: string): string {
  const headers = [
    "Oprema",
    "Ukupni Sati",
    "Gorivo (L)",
    "Trošak Goriva (€)",
    "Broj Servisa",
    "Trošak Servisa (€)",
    "Ukupni Trošak (€)",
  ];

  const rows: any[][] = [];

  // Equipment breakdown
  appState.equipment.forEach((equipment) => {
    const serviceRecords = appState.serviceRecords.filter(
      (r) => r.equipmentId === equipment.id,
    );
    const fuelLogs = appState.fuelLogs.filter((f) => f.equipmentId === equipment.id);

    const totalServiceCost = serviceRecords.reduce((sum, r) => sum + r.cost, 0);
    const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + f.litersAdded, 0);
    const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);

    rows.push([
      equipment.displayName,
      equipment.currentHours,
      totalFuelLiters.toFixed(1),
      totalFuelCost.toFixed(2),
      serviceRecords.length,
      totalServiceCost.toFixed(2),
      (totalFuelCost + totalServiceCost).toFixed(2),
    ]);
  });

  // Add summary row
  const totalFuel = appState.fuelLogs.reduce((sum, f) => sum + f.litersAdded, 0);
  const totalFuelCost = appState.fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);
  const totalServiceCost = appState.serviceRecords.reduce((sum, r) => sum + r.cost, 0);

  rows.push([
    "UKUPNO",
    "",
    totalFuel.toFixed(1),
    totalFuelCost.toFixed(2),
    appState.serviceRecords.length,
    totalServiceCost.toFixed(2),
    (totalFuelCost + totalServiceCost).toFixed(2),
  ]);

  // Add key metrics
  const totalHours = appState.equipment.reduce((sum, e) => sum + e.currentHours, 0);
  const fuelEfficiency = totalHours > 0 ? (totalFuel / totalHours).toFixed(2) : "0.00";
  const costPerHour = totalHours > 0 ? ((totalFuelCost + totalServiceCost) / totalHours).toFixed(2) : "0.00";

  rows.push([]);
  rows.push(["KLJUČNI POKAZATELJI"]);
  rows.push(["Prosječna Potrošnja Goriva (L/sat)", fuelEfficiency]);
  rows.push(["Trošak po Radnom Satu (€/sat)", costPerHour]);
  rows.push(["Ukupno Radnih Sati", totalHours]);

  return generateCSVContent(headers, rows);
}

/**
 * Export service history to CSV
 */
export function exportServiceHistoryCSV(appState: AppState): string {
  const headers = [
    "Datum",
    "Oprema",
    "Tip Servisa",
    "Sati na Servisu",
    "Korišteni Dijelovi",
    "Trošak (€)",
    "Tehničar",
    "Napomene",
  ];

  const rows: any[][] = appState.serviceRecords.map((record) => {
    const equipment = appState.equipment.find((e) => e.id === record.equipmentId);
    return [
      record.date,
      equipment?.displayName || "Nepoznato",
      record.serviceType,
      record.hoursAtService,
      record.partsUsed.join("; "),
      record.cost.toFixed(2),
      record.technician,
      record.notes,
    ];
  });

  // Add total cost
  const totalCost = appState.serviceRecords.reduce((sum, r) => sum + r.cost, 0);
  rows.push([]);
  rows.push(["UKUPAN TROŠAK SERVISA", "", "", "", "", totalCost.toFixed(2)]);

  return generateCSVContent(headers, rows);
}

/**
 * Export inventory to CSV
 */
export function exportInventoryCSV(appState: AppState): string {
  const headers = [
    "Naziv Dijela",
    "Kataloški Broj",
    "Oprema",
    "Količina na Lageru",
    "Min. Nivo",
    "Status",
    "Cijena (€)",
    "Ukupna Vrijednost (€)",
    "Dobavljač",
  ];

  const rows: any[][] = appState.spareParts.map((part) => {
    const status =
      part.currentStock <= part.minimumLevel
        ? "Kritično"
        : part.currentStock < part.minimumLevel * 1.5
          ? "Nisko"
          : "Dobro";

    const equipmentName =
      part.equipment === "all"
        ? "Sve"
        : part.equipment === "mixer"
          ? "Mješalica"
          : part.equipment === "loader"
            ? "Utovarivač"
            : "Generator";

    return [
      part.name,
      part.partNumber,
      equipmentName,
      part.currentStock,
      part.minimumLevel,
      status,
      part.price.toFixed(2),
      (part.currentStock * part.price).toFixed(2),
      part.supplier || "",
    ];
  });

  // Add total value
  const totalValue = appState.spareParts.reduce(
    (sum, part) => sum + part.currentStock * part.price,
    0,
  );
  rows.push([]);
  rows.push(["UKUPNA VRIJEDNOST ZALIHA", "", "", "", "", "", "", totalValue.toFixed(2)]);

  return generateCSVContent(headers, rows);
}

/**
 * Export fuel logs to CSV
 */
export function exportFuelLogsCSV(appState: AppState): string {
  const headers = [
    "Datum",
    "Oprema",
    "Dodano Gorivo (L)",
    "Cijena po Litri (€)",
    "Ukupni Trošak (€)",
    "Sati na Dopuni",
    "Napomene",
  ];

  const rows: any[][] = appState.fuelLogs.map((log) => {
    const equipment = appState.equipment.find((e) => e.id === log.equipmentId);
    return [
      log.date,
      equipment?.displayName || "Nepoznato",
      log.litersAdded.toFixed(1),
      log.costPerLiter.toFixed(2),
      log.totalCost.toFixed(2),
      log.hoursAtFueling,
      log.notes,
    ];
  });

  // Add total
  const totalLiters = appState.fuelLogs.reduce((sum, f) => sum + f.litersAdded, 0);
  const totalCost = appState.fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);
  rows.push([]);
  rows.push(["UKUPNO", "", totalLiters.toFixed(1), "", totalCost.toFixed(2)]);

  return generateCSVContent(headers, rows);
}

/**
 * Create a downloadable CSV file and return blob
 */
export function createCSVBlob(csvContent: string): Blob {
  return new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
}

/**
 * Generate filename with timestamp
 */
export function generateFilename(prefix: string, extension: string = "csv"): string {
  const now = new Date();
  const timestamp = now.toISOString().split("T")[0]; // YYYY-MM-DD format
  return `${prefix}_${timestamp}.${extension}`;
}
