/**
 * Custom hook for managing app data and state
 */

import { useEffect, useState, useCallback } from "react";
import { AppState, Equipment, ServiceRecord, FuelLog, LubricationPoint, SparePart, Alert } from "@/types";
import { loadAppState, saveEquipment, saveServiceRecords, saveFuelLogs, saveLubricationPoints, saveSpareParts } from "@/lib/storage";
import { SAMPLE_EQUIPMENT, SAMPLE_SERVICE_RECORDS, SAMPLE_FUEL_LOGS, SAMPLE_LUBRICATION_POINTS, SAMPLE_SPARE_PARTS } from "@/lib/sample-data";

export function useAppData() {
  const [appState, setAppState] = useState<AppState>({
    equipment: [],
    serviceRecords: [],
    fuelLogs: [],
    lubricationPoints: [],
    spareParts: [],
    dailyReports: [],
    monthlyReports: [],
  });

  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  // Initialize data on mount
  useEffect(() => {
    initializeData();
  }, []);

  // Generate alerts when data changes
  useEffect(() => {
    generateAlerts();
  }, [appState]);

  const initializeData = async () => {
    try {
      const savedState = await loadAppState();

      // If no data exists, use sample data
      if (savedState.equipment.length === 0) {
        const initialState: AppState = {
          equipment: SAMPLE_EQUIPMENT,
          serviceRecords: SAMPLE_SERVICE_RECORDS,
          fuelLogs: SAMPLE_FUEL_LOGS,
          lubricationPoints: SAMPLE_LUBRICATION_POINTS,
          spareParts: SAMPLE_SPARE_PARTS,
          dailyReports: [],
          monthlyReports: [],
        };

        setAppState(initialState);
        await Promise.all([
          saveEquipment(initialState.equipment),
          saveServiceRecords(initialState.serviceRecords),
          saveFuelLogs(initialState.fuelLogs),
          saveLubricationPoints(initialState.lubricationPoints),
          saveSpareParts(initialState.spareParts),
        ]);
      } else {
        setAppState(savedState);
      }
    } catch (error) {
      console.error("[useAppData] Error initializing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = () => {
    const newAlerts: Alert[] = [];
    const today = new Date();

    // Check for overdue service
    appState.equipment.forEach((equipment) => {
      const hoursSinceLastService = equipment.currentHours - equipment.lastServiceHours;
      const hoursUntilService = equipment.serviceIntervalHours - hoursSinceLastService;

      if (hoursUntilService <= 0) {
        newAlerts.push({
          id: `alert-service-${equipment.id}`,
          type: "overdue",
          title: "Servis Zakašnjen",
          message: `${equipment.displayName} trebao bi servis`,
          equipmentId: equipment.id,
          actionLabel: "Zabilježi Servis",
          actionRoute: `/equipment/${equipment.id}`,
        });
      } else if (hoursUntilService <= 50) {
        newAlerts.push({
          id: `alert-warning-${equipment.id}`,
          type: "warning",
          title: "Servis Uskoro",
          message: `${equipment.displayName} trebao bi servis za ${hoursUntilService} sati`,
          equipmentId: equipment.id,
        });
      }
    });

    // Check for low inventory
    appState.spareParts.forEach((part) => {
      if (part.currentStock <= part.minimumLevel) {
        newAlerts.push({
          id: `alert-inventory-${part.id}`,
          type: "warning",
          title: "Niska Zaliha",
          message: `${part.name} - Dostupno: ${part.currentStock}, Minimum: ${part.minimumLevel}`,
          partId: part.id,
          actionLabel: "Ažuriraj Zalihu",
          actionRoute: `/inventory/${part.id}`,
        });
      }
    });

    // Check for overdue lubrication
    appState.lubricationPoints.forEach((point) => {
      if (point.nextDue) {
        const dueDate = new Date(point.nextDue);
        if (dueDate < today) {
          newAlerts.push({
            id: `alert-lub-${point.id}`,
            type: "warning",
            title: "Podmazivanje Zakašnjelo",
            message: `${point.name} trebalo je obavljeno`,
            actionLabel: "Označi kao Obavljeno",
          });
        }
      }
    });

    setAlerts(newAlerts);
  };

  // Equipment operations
  const updateEquipmentHours = useCallback(
    async (equipmentId: string, newHours: number) => {
      const updatedEquipment = appState.equipment.map((eq) =>
        eq.id === equipmentId ? { ...eq, currentHours: newHours } : eq,
      );
      setAppState((prev) => ({ ...prev, equipment: updatedEquipment }));
      await saveEquipment(updatedEquipment);
    },
    [appState.equipment],
  );

  const addServiceRecord = useCallback(
    async (record: ServiceRecord) => {
      const updatedRecords = [...appState.serviceRecords, record];
      setAppState((prev) => ({ ...prev, serviceRecords: updatedRecords }));
      await saveServiceRecords(updatedRecords);

      // Update equipment last service info
      const updatedEquipment = appState.equipment.map((eq) =>
        eq.id === record.equipmentId
          ? {
              ...eq,
              lastServiceHours: record.hoursAtService,
              lastServiceDate: record.date,
            }
          : eq,
      );
      setAppState((prev) => ({ ...prev, equipment: updatedEquipment }));
      await saveEquipment(updatedEquipment);
    },
    [appState.equipment, appState.serviceRecords],
  );

  const addFuelLog = useCallback(
    async (log: FuelLog) => {
      const updatedLogs = [...appState.fuelLogs, log];
      setAppState((prev) => ({ ...prev, fuelLogs: updatedLogs }));
      await saveFuelLogs(updatedLogs);
    },
    [appState.fuelLogs],
  );

  // Lubrication operations
  const markLubricationComplete = useCallback(
    async (pointId: string) => {
      const today = new Date().toISOString().split("T")[0];
      const nextDueDate = new Date();
      const point = appState.lubricationPoints.find((p) => p.id === pointId);

      if (point) {
        if (point.frequency === "daily") {
          nextDueDate.setDate(nextDueDate.getDate() + 1);
        } else if (point.frequency === "weekly") {
          nextDueDate.setDate(nextDueDate.getDate() + 7);
        } else if (point.frequency === "monthly") {
          nextDueDate.setMonth(nextDueDate.getMonth() + 1);
        }

        const updatedPoints = appState.lubricationPoints.map((p) =>
          p.id === pointId
            ? {
                ...p,
                lastCompleted: today,
                nextDue: nextDueDate.toISOString().split("T")[0],
                status: "good" as const,
              }
            : p,
        );

        setAppState((prev) => ({ ...prev, lubricationPoints: updatedPoints }));
        await saveLubricationPoints(updatedPoints);
      }
    },
    [appState.lubricationPoints],
  );

  // Spare parts operations
  const updatePartStock = useCallback(
    async (partId: string, newStock: number) => {
      const updatedParts = appState.spareParts.map((part) => {
        if (part.id === partId) {
          const status: "critical" | "low" | "adequate" = newStock <= part.minimumLevel ? "critical" : newStock < part.minimumLevel * 1.5 ? "low" : "adequate";
          return { ...part, currentStock: newStock, status };
        }
        return part;
      });

      setAppState((prev) => ({ ...prev, spareParts: updatedParts }));
      await saveSpareParts(updatedParts);
    },
    [appState.spareParts],
  );

  const addSparePart = useCallback(
    async (part: SparePart) => {
      const updatedParts = [...appState.spareParts, part];
      setAppState((prev) => ({ ...prev, spareParts: updatedParts }));
      await saveSpareParts(updatedParts);
    },
    [appState.spareParts],
  );

  const deleteSparePart = useCallback(
    async (partId: string) => {
      const updatedParts = appState.spareParts.filter((p) => p.id !== partId);
      setAppState((prev) => ({ ...prev, spareParts: updatedParts }));
      await saveSpareParts(updatedParts);
    },
    [appState.spareParts],
  );

  // Utility functions
  const getEquipmentStatus = useCallback((equipment: Equipment) => {
    const hoursSinceLastService = equipment.currentHours - equipment.lastServiceHours;
    const hoursUntilService = equipment.serviceIntervalHours - hoursSinceLastService;

    if (hoursUntilService <= 0) return "overdue";
    if (hoursUntilService <= 50) return "warning";
    return "good";
  }, []);

  const getPartStatus = useCallback((part: SparePart) => {
    if (part.currentStock <= part.minimumLevel) return "critical";
    if (part.currentStock < part.minimumLevel * 1.5) return "low";
    return "adequate";
  }, []);

  const getTotalInventoryValue = useCallback(() => {
    return appState.spareParts.reduce((total, part) => total + part.currentStock * part.price, 0);
  }, [appState.spareParts]);

  return {
    appState,
    loading,
    alerts,
    updateEquipmentHours,
    addServiceRecord,
    addFuelLog,
    markLubricationComplete,
    updatePartStock,
    addSparePart,
    deleteSparePart,
    getEquipmentStatus,
    getPartStatus,
    getTotalInventoryValue,
  };
}
