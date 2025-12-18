/**
 * AsyncStorage utility functions for data persistence
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { AppState, Equipment, ServiceRecord, FuelLog, LubricationPoint, SparePart, DailyReport } from "@/types";

const STORAGE_KEYS = {
  EQUIPMENT: "azvirt_equipment",
  SERVICE_RECORDS: "azvirt_service_records",
  FUEL_LOGS: "azvirt_fuel_logs",
  LUBRICATION_POINTS: "azvirt_lubrication_points",
  SPARE_PARTS: "azvirt_spare_parts",
  DAILY_REPORTS: "azvirt_daily_reports",
};

/**
 * Load all data from storage
 */
export async function loadAppState(): Promise<AppState> {
  try {
    const [equipment, serviceRecords, fuelLogs, lubricationPoints, spareParts, dailyReports] =
      await AsyncStorage.multiGet([
        STORAGE_KEYS.EQUIPMENT,
        STORAGE_KEYS.SERVICE_RECORDS,
        STORAGE_KEYS.FUEL_LOGS,
        STORAGE_KEYS.LUBRICATION_POINTS,
        STORAGE_KEYS.SPARE_PARTS,
        STORAGE_KEYS.DAILY_REPORTS,
      ]);

    return {
      equipment: equipment[1] ? JSON.parse(equipment[1]) : [],
      serviceRecords: serviceRecords[1] ? JSON.parse(serviceRecords[1]) : [],
      fuelLogs: fuelLogs[1] ? JSON.parse(fuelLogs[1]) : [],
      lubricationPoints: lubricationPoints[1] ? JSON.parse(lubricationPoints[1]) : [],
      spareParts: spareParts[1] ? JSON.parse(spareParts[1]) : [],
      dailyReports: dailyReports[1] ? JSON.parse(dailyReports[1]) : [],
      monthlyReports: [],
    };
  } catch (error) {
    console.error("[Storage] Error loading app state:", error);
    return {
      equipment: [],
      serviceRecords: [],
      fuelLogs: [],
      lubricationPoints: [],
      spareParts: [],
      dailyReports: [],
      monthlyReports: [],
    };
  }
}

/**
 * Save equipment list
 */
export async function saveEquipment(equipment: Equipment[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.EQUIPMENT, JSON.stringify(equipment));
  } catch (error) {
    console.error("[Storage] Error saving equipment:", error);
    throw error;
  }
}

/**
 * Save service records
 */
export async function saveServiceRecords(records: ServiceRecord[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SERVICE_RECORDS, JSON.stringify(records));
  } catch (error) {
    console.error("[Storage] Error saving service records:", error);
    throw error;
  }
}

/**
 * Save fuel logs
 */
export async function saveFuelLogs(logs: FuelLog[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.FUEL_LOGS, JSON.stringify(logs));
  } catch (error) {
    console.error("[Storage] Error saving fuel logs:", error);
    throw error;
  }
}

/**
 * Save lubrication points
 */
export async function saveLubricationPoints(points: LubricationPoint[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.LUBRICATION_POINTS, JSON.stringify(points));
  } catch (error) {
    console.error("[Storage] Error saving lubrication points:", error);
    throw error;
  }
}

/**
 * Save spare parts
 */
export async function saveSpareParts(parts: SparePart[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.SPARE_PARTS, JSON.stringify(parts));
  } catch (error) {
    console.error("[Storage] Error saving spare parts:", error);
    throw error;
  }
}

/**
 * Save daily reports
 */
export async function saveDailyReports(reports: DailyReport[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.DAILY_REPORTS, JSON.stringify(reports));
  } catch (error) {
    console.error("[Storage] Error saving daily reports:", error);
    throw error;
  }
}

/**
 * Clear all data (for testing/reset)
 */
export async function clearAllData(): Promise<void> {
  try {
    await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
  } catch (error) {
    console.error("[Storage] Error clearing data:", error);
    throw error;
  }
}
