/**
 * Core data types for AZVIRT Maintenance Tracker
 */

export type EquipmentType = "mixer" | "loader" | "generator";

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  displayName: string; // e.g., "Mješalica za Beton (Elkon)"
  currentHours: number;
  serviceIntervalHours: number;
  lastServiceHours: number;
  lastServiceDate: string; // ISO date
  fuelEfficiency?: number; // L/hour
  fuelLevel?: number; // Current fuel in tank (liters)
  fuelCapacity?: number; // Maximum fuel capacity (liters)
  status: "good" | "warning" | "overdue";
}

export interface ServiceRecord {
  id: string;
  equipmentId: string;
  date: string; // ISO date
  hoursAtService: number;
  serviceType: string; // e.g., "Oil Change", "Filter Replacement"
  partsUsed: string[]; // Array of part IDs
  cost: number;
  technician: string;
  notes: string;
  photos?: string[]; // Array of image URIs (base64 or file paths)
}

export interface FuelLog {
  id: string;
  equipmentId: string;
  date: string; // ISO date
  litersAdded: number;
  costPerLiter: number;
  totalCost: number;
  hoursAtFueling: number;
  notes: string;
}

export interface LubricationPoint {
  id: string;
  name: string; // e.g., "Ležajevi bubnja mješalice"
  type: string; // "Mast" | "Ulje" | "Provjera"
  frequency: "daily" | "weekly" | "monthly"; // Frequency
  equipmentId?: string; // Optional, can be null for general lubrication
  lastCompleted?: string; // ISO date
  nextDue?: string; // ISO date
  status: "good" | "due" | "overdue";
}

export interface SparePart {
  id: string;
  name: string;
  partNumber: string;
  equipment: EquipmentType | "all"; // Which equipment(s) this part is for
  currentStock: number;
  minimumLevel: number;
  price: number; // Price per unit
  supplier?: string;
  notes?: string;
  status: "adequate" | "low" | "critical";
}

export interface DailyReport {
  id: string;
  date: string; // ISO date
  shift: "morning" | "afternoon" | "night";
  equipmentData: {
    equipmentId: string;
    hours: number;
    batches?: number; // For mixer
    fuelAdded?: number; // For loader/generator
  }[];
  checklistItems: {
    itemId: string;
    completed: boolean;
    notes?: string;
  }[];
  operator: string;
  generalNotes: string;
  photos?: string[]; // Array of base64 image strings or file URIs
}

export interface MonthlyReport {
  id: string;
  month: string; // YYYY-MM format
  equipmentBreakdown: {
    equipmentId: string;
    totalHours: number;
    totalFuel: number;
    fuelCost: number;
    serviceCount: number;
    serviceCost: number;
  }[];
  totalFuelConsumption: number;
  totalFuelCost: number;
  totalServiceCost: number;
  averageFuelEfficiency: number; // L/hour
  costPerHour: number;
}

export interface FuelStock {
  id: string;
  currentLiters: number;
  capacity: number; // Maximum capacity
  minimumLevel: number;
  lastUpdated: string; // ISO date
  notes: string;
}

export interface AppState {
  equipment: Equipment[];
  serviceRecords: ServiceRecord[];
  fuelLogs: FuelLog[];
  lubricationPoints: LubricationPoint[];
  spareParts: SparePart[];
  dailyReports: DailyReport[];
  monthlyReports: MonthlyReport[];
  fuelStock?: FuelStock;
}

/**
 * UI State Types
 */

export interface Alert {
  id: string;
  type: "overdue" | "warning" | "info";
  title: string;
  message: string;
  equipmentId?: string;
  partId?: string;
  actionLabel?: string;
  actionRoute?: string;
}

export interface ModalState {
  isOpen: boolean;
  type?: "logHours" | "recordService" | "addFuel" | "addPart" | "editPart" | "newService";
  data?: any;
}
