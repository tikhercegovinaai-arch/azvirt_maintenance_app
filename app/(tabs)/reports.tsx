import { useState } from "react";
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppData } from "@/hooks/use-app-data";
import { useFileExport } from "@/hooks/use-file-export";
import {
  exportMonthlyReportCSV,
  exportServiceHistoryCSV,
  exportInventoryCSV,
  exportFuelLogsCSV,
  generateFilename,
} from "@/lib/export-csv";
import {
  generateMonthlyReportPDF,
  generateServiceHistoryPDF,
  generateInventoryPDF,
  generatePDFFilename,
} from "@/lib/export-pdf";

type TabType = "monthly" | "daily";

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const { appState } = useAppData();
  const { exporting, exportCSV, exportText, showExportResult } = useFileExport();
  const [activeTab, setActiveTab] = useState<TabType>("monthly");

  // Calculate monthly summary
  const calculateMonthlySummary = () => {
    const today = new Date();
    const currentMonth = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;

    const equipmentBreakdown = appState.equipment.map((equipment) => {
      const serviceRecords = appState.serviceRecords.filter(
        (r) => r.equipmentId === equipment.id,
      );
      const fuelLogs = appState.fuelLogs.filter(
        (f) => f.equipmentId === equipment.id,
      );

      const totalServiceCost = serviceRecords.reduce((sum, r) => sum + r.cost, 0);
      const totalFuelLiters = fuelLogs.reduce((sum, f) => sum + f.litersAdded, 0);
      const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);

      return {
        equipment,
        totalHours: equipment.currentHours,
        totalFuel: totalFuelLiters,
        fuelCost: totalFuelCost,
        serviceCount: serviceRecords.length,
        serviceCost: totalServiceCost,
      };
    });

    const totalFuel = equipmentBreakdown.reduce((sum, e) => sum + e.totalFuel, 0);
    const totalFuelCost = equipmentBreakdown.reduce((sum, e) => sum + e.fuelCost, 0);
    const totalServiceCost = equipmentBreakdown.reduce(
      (sum, e) => sum + e.serviceCost,
      0,
    );
    const totalHours = equipmentBreakdown.reduce((sum, e) => sum + e.totalHours, 0);

    const fuelEfficiency = totalHours > 0 ? (totalFuel / totalHours).toFixed(2) : "0.00";
    const costPerHour = totalHours > 0 ? ((totalFuelCost + totalServiceCost) / totalHours).toFixed(2) : "0.00";

    return {
      month: currentMonth,
      equipmentBreakdown,
      totalFuel,
      totalFuelCost,
      totalServiceCost,
      totalHours,
      fuelEfficiency,
      costPerHour,
    };
  };

  const monthlySummary = calculateMonthlySummary();

  const handleExportMonthlyCSV = async () => {
    const csvContent = exportMonthlyReportCSV(appState, monthlySummary.month);
    const filename = generateFilename("Mjesecni_Izvjestaj", "csv");
    const result = await exportCSV(csvContent, filename);
    showExportResult(result);
  };

  const handleExportMonthlyPDF = async () => {
    const pdfContent = generateMonthlyReportPDF(appState, monthlySummary.month);
    const filename = generatePDFFilename("Mjesecni_Izvjestaj");
    const result = await exportText(pdfContent, filename);
    showExportResult(result);
  };

  const handleExportServiceHistoryCSV = async () => {
    const csvContent = exportServiceHistoryCSV(appState);
    const filename = generateFilename("Istorija_Servisa", "csv");
    const result = await exportCSV(csvContent, filename);
    showExportResult(result);
  };

  const handleExportServiceHistoryPDF = async () => {
    const pdfContent = generateServiceHistoryPDF(appState);
    const filename = generatePDFFilename("Istorija_Servisa");
    const result = await exportText(pdfContent, filename);
    showExportResult(result);
  };

  const handleExportInventoryCSV = async () => {
    const csvContent = exportInventoryCSV(appState);
    const filename = generateFilename("Inventar", "csv");
    const result = await exportCSV(csvContent, filename);
    showExportResult(result);
  };

  const handleExportInventoryPDF = async () => {
    const pdfContent = generateInventoryPDF(appState);
    const filename = generatePDFFilename("Inventar");
    const result = await exportText(pdfContent, filename);
    showExportResult(result);
  };

  const handleExportFuelLogsCSV = async () => {
    const csvContent = exportFuelLogsCSV(appState);
    const filename = generateFilename("Istorija_Goriva", "csv");
    const result = await exportCSV(csvContent, filename);
    showExportResult(result);
  };

  const renderEquipmentBreakdown = ({ item }: any) => (
    <View style={styles.breakdownItem}>
      <View style={styles.breakdownInfo}>
        <ThemedText type="defaultSemiBold">
          {item.equipment.displayName}
        </ThemedText>
        <View style={styles.breakdownStats}>
          <ThemedText type="default" style={styles.breakdownStat}>
            {item.totalHours}h
          </ThemedText>
          <ThemedText type="default" style={styles.breakdownStat}>
            {item.totalFuel.toFixed(1)}L
          </ThemedText>
          <ThemedText type="default" style={styles.breakdownStat}>
            {item.serviceCount} servisa
          </ThemedText>
        </View>
      </View>
      <View style={styles.breakdownCost}>
        <ThemedText type="defaultSemiBold">
          €{(item.fuelCost + item.serviceCost).toFixed(2)}
        </ThemedText>
        <ThemedText type="default" style={styles.breakdownCostDetail}>
          Gorivo: €{item.fuelCost.toFixed(2)}
        </ThemedText>
        <ThemedText type="default" style={styles.breakdownCostDetail}>
          Servis: €{item.serviceCost.toFixed(2)}
        </ThemedText>
      </View>
    </View>
  );

  const renderExportButtons = () => (
    <View style={styles.exportSection}>
      <ThemedText type="subtitle" style={styles.exportTitle}>
        Izvezi Podatke
      </ThemedText>
      <View style={styles.buttonGrid}>
        <Pressable
          style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
          onPress={handleExportMonthlyCSV}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.exportButtonText}>CSV Mjesečno</ThemedText>
          )}
        </Pressable>
        <Pressable
          style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
          onPress={handleExportMonthlyPDF}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.exportButtonText}>TXT Mjesečno</ThemedText>
          )}
        </Pressable>
      </View>

      <View style={styles.buttonGrid}>
        <Pressable
          style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
          onPress={handleExportServiceHistoryCSV}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.exportButtonText}>CSV Servisi</ThemedText>
          )}
        </Pressable>
        <Pressable
          style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
          onPress={handleExportServiceHistoryPDF}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.exportButtonText}>TXT Servisi</ThemedText>
          )}
        </Pressable>
      </View>

      <View style={styles.buttonGrid}>
        <Pressable
          style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
          onPress={handleExportInventoryCSV}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.exportButtonText}>CSV Inventar</ThemedText>
          )}
        </Pressable>
        <Pressable
          style={[styles.exportButton, exporting && styles.exportButtonDisabled]}
          onPress={handleExportInventoryPDF}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.exportButtonText}>TXT Inventar</ThemedText>
          )}
        </Pressable>
      </View>

      <Pressable
        style={[styles.exportButtonFull, exporting && styles.exportButtonDisabled]}
        onPress={handleExportFuelLogsCSV}
        disabled={exporting}
      >
        {exporting ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <ThemedText style={styles.exportButtonText}>CSV Istorija Goriva</ThemedText>
        )}
      </Pressable>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <ThemedText type="title">Izvještaji</ThemedText>
      </View>

      <View style={styles.tabBar}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "monthly" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("monthly")}
        >
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.tabText,
              activeTab === "monthly" && styles.activeTabText,
            ]}
          >
            Mjesečno
          </ThemedText>
        </Pressable>
        <Pressable
          style={[
            styles.tab,
            activeTab === "daily" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("daily")}
        >
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.tabText,
              activeTab === "daily" && styles.activeTabText,
            ]}
          >
            Dnevno
          </ThemedText>
        </Pressable>
      </View>

      {activeTab === "monthly" ? (
        <FlatList
          data={[monthlySummary]}
          renderItem={({ item }) => (
            <View style={styles.reportContainer}>
              {renderExportButtons()}

              <View style={styles.reportHeader}>
                <ThemedText type="subtitle">Mjesečni Pregled</ThemedText>
                <ThemedText type="default" style={styles.reportMonth}>
                  {item.month}
                </ThemedText>
              </View>

              <View style={styles.summaryGrid}>
                <View style={styles.summaryBox}>
                  <ThemedText type="default" style={styles.summaryLabel}>
                    Ukupni Sati
                  </ThemedText>
                  <ThemedText type="title" style={styles.summaryValue}>
                    {item.totalHours}h
                  </ThemedText>
                </View>

                <View style={styles.summaryBox}>
                  <ThemedText type="default" style={styles.summaryLabel}>
                    Ukupno Gorivo
                  </ThemedText>
                  <ThemedText type="title" style={styles.summaryValue}>
                    {item.totalFuel.toFixed(1)}L
                  </ThemedText>
                </View>

                <View style={styles.summaryBox}>
                  <ThemedText type="default" style={styles.summaryLabel}>
                    Trošak Goriva
                  </ThemedText>
                  <ThemedText type="title" style={styles.summaryValue}>
                    €{item.totalFuelCost.toFixed(2)}
                  </ThemedText>
                </View>

                <View style={styles.summaryBox}>
                  <ThemedText type="default" style={styles.summaryLabel}>
                    Trošak Servisa
                  </ThemedText>
                  <ThemedText type="title" style={styles.summaryValue}>
                    €{item.totalServiceCost.toFixed(2)}
                  </ThemedText>
                </View>

                <View style={styles.summaryBox}>
                  <ThemedText type="default" style={styles.summaryLabel}>
                    Efikasnost Goriva
                  </ThemedText>
                  <ThemedText type="title" style={styles.summaryValue}>
                    {item.fuelEfficiency}L/h
                  </ThemedText>
                </View>

                <View style={styles.summaryBox}>
                  <ThemedText type="default" style={styles.summaryLabel}>
                    Trošak po Satu
                  </ThemedText>
                  <ThemedText type="title" style={styles.summaryValue}>
                    €{item.costPerHour}/h
                  </ThemedText>
                </View>
              </View>

              <View style={styles.breakdownSection}>
                <ThemedText type="subtitle" style={styles.breakdownTitle}>
                  Pregled po Opremi
                </ThemedText>
                <FlatList
                  data={item.equipmentBreakdown}
                  renderItem={renderEquipmentBreakdown}
                  keyExtractor={(_, index) => index.toString()}
                  scrollEnabled={false}
                />
              </View>

              <View style={styles.totalCostBox}>
                <ThemedText type="default" style={styles.totalCostLabel}>
                  Ukupni Trošak Mjeseca
                </ThemedText>
                <ThemedText type="title" style={styles.totalCostValue}>
                  €{(item.totalFuelCost + item.totalServiceCost).toFixed(2)}
                </ThemedText>
              </View>
            </View>
          )}
          keyExtractor={(_, index) => index.toString()}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <ThemedText type="default" style={styles.emptyText}>
            Dnevni izvještaji će biti dostupni nakon što dodate podatke
          </ThemedText>
        </View>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#007AFF",
  },
  tabText: {
    fontSize: 14,
    color: "#8E8E93",
  },
  activeTabText: {
    color: "#fff",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  reportContainer: {
    gap: 16,
  },
  exportSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  exportTitle: {
    marginBottom: 12,
    fontSize: 16,
  },
  buttonGrid: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 8,
  },
  exportButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  exportButtonFull: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  reportHeader: {
    marginBottom: 8,
  },
  reportMonth: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  summaryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  summaryBox: {
    width: "48%",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 16,
  },
  breakdownSection: {
    marginTop: 8,
  },
  breakdownTitle: {
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  breakdownInfo: {
    flex: 1,
  },
  breakdownStats: {
    flexDirection: "row",
    marginTop: 6,
    gap: 12,
  },
  breakdownStat: {
    fontSize: 11,
    opacity: 0.6,
  },
  breakdownCost: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  breakdownCostDetail: {
    fontSize: 11,
    marginTop: 2,
    opacity: 0.6,
  },
  totalCostBox: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    alignItems: "center",
  },
  totalCostLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  totalCostValue: {
    fontSize: 24,
    color: "#34C759",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  emptyText: {
    textAlign: "center",
    opacity: 0.7,
  },
});
