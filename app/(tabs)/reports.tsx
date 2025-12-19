import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useAppData } from "@/hooks/use-app-data";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useFileExport } from "@/hooks/use-file-export";
import {
  exportMonthlyReportCSV,
  exportServiceHistoryCSV,
  exportInventoryCSV,
  exportFuelLogsCSV,
  generateFilename,
} from "@/lib/export-csv";

type TabType = "monthly" | "daily";

export default function ReportsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { appState } = useAppData();
  const { exporting, exportCSV } = useFileExport();
  const [activeTab, setActiveTab] = useState<TabType>("monthly");
  const isDark = colorScheme === "dark";

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
    try {
      const csvContent = exportMonthlyReportCSV(appState, monthlySummary.month);
      const filename = generateFilename("Mjesecni_Izvjestaj", "csv");
      await exportCSV(csvContent, filename);
      Alert.alert("Uspjeh", "Mjesečni izvještaj je izvezen");
    } catch (error) {
      Alert.alert("Greška", "Nije moguće izvezti izvještaj");
    }
  };

  const handleExportServiceHistoryCSV = async () => {
    try {
      const csvContent = exportServiceHistoryCSV(appState);
      const filename = generateFilename("Istorija_Servisa", "csv");
      await exportCSV(csvContent, filename);
      Alert.alert("Uspjeh", "Istorija servisa je izvezena");
    } catch (error) {
      Alert.alert("Greška", "Nije moguće izvezti servise");
    }
  };

  const handleExportInventoryCSV = async () => {
    try {
      const csvContent = exportInventoryCSV(appState);
      const filename = generateFilename("Inventar", "csv");
      await exportCSV(csvContent, filename);
      Alert.alert("Uspjeh", "Inventar je izvezen");
    } catch (error) {
      Alert.alert("Greška", "Nije moguće izvezti inventar");
    }
  };

  const handleExportFuelLogsCSV = async () => {
    try {
      const csvContent = exportFuelLogsCSV(appState);
      const filename = generateFilename("Istorija_Goriva", "csv");
      await exportCSV(csvContent, filename);
      Alert.alert("Uspjeh", "Istorija goriva je izvezena");
    } catch (error) {
      Alert.alert("Greška", "Nije moguće izvezti gorivo");
    }
  };

  const renderEquipmentBreakdown = ({ item }: any) => (
    <View
      style={[
        styles.breakdownItem,
        {
          backgroundColor: isDark
            ? "rgba(30, 30, 30, 0.85)"
            : "rgba(255, 255, 255, 0.85)",
        },
      ]}
    >
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
        <ThemedText type="defaultSemiBold" style={styles.costValue}>
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
          style={[
            styles.exportButton,
            exporting && styles.exportButtonDisabled,
          ]}
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
          style={[
            styles.exportButton,
            exporting && styles.exportButtonDisabled,
          ]}
          onPress={handleExportServiceHistoryCSV}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.exportButtonText}>CSV Servisi</ThemedText>
          )}
        </Pressable>
      </View>

      <View style={styles.buttonGrid}>
        <Pressable
          style={[
            styles.exportButton,
            exporting && styles.exportButtonDisabled,
          ]}
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
          style={[
            styles.exportButton,
            exporting && styles.exportButtonDisabled,
          ]}
          onPress={handleExportFuelLogsCSV}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <ThemedText style={styles.exportButtonText}>CSV Gorivo</ThemedText>
          )}
        </Pressable>
      </View>
    </View>
  );

  return (
    <ImageBackground
      source={require("@/assets/images/background.jpg")}
      style={styles.container}
      imageStyle={styles.backgroundImage}
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: isDark
              ? "rgba(0, 0, 0, 0.75)"
              : "rgba(255, 255, 255, 0.85)",
          },
        ]}
      />

      <View style={[styles.content, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Izvještaji
          </ThemedText>
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

        <ScrollView showsVerticalScrollIndicator={false}>
          {activeTab === "monthly" ? (
            <View style={styles.reportContainer}>
              {renderExportButtons()}

              <View style={styles.reportHeader}>
                <ThemedText type="subtitle">Mjesečni Pregled</ThemedText>
                <ThemedText type="default" style={styles.reportMonth}>
                  {monthlySummary.month}
                </ThemedText>
              </View>

              <View style={styles.summaryGrid}>
                <View
                  style={[
                    styles.summaryBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(30, 30, 30, 0.85)"
                        : "rgba(255, 255, 255, 0.85)",
                    },
                  ]}
                >
                  <ThemedText type="default" style={styles.summaryLabel}>
                    Ukupni Sati
                  </ThemedText>
                  <ThemedText type="title" style={styles.summaryValue}>
                    {monthlySummary.totalHours}h
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.summaryBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(30, 30, 30, 0.85)"
                        : "rgba(255, 255, 255, 0.85)",
                    },
                  ]}
                >
                  <ThemedText type="default" style={styles.summaryLabel}>
                    Ukupno Gorivo
                  </ThemedText>
                  <ThemedText type="title" style={styles.summaryValue}>
                    {monthlySummary.totalFuel.toFixed(1)}L
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.summaryBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(30, 30, 30, 0.85)"
                        : "rgba(255, 255, 255, 0.85)",
                    },
                  ]}
                >
                  <ThemedText type="default" style={styles.summaryLabel}>
                    Trošak Goriva
                  </ThemedText>
                  <ThemedText type="title" style={styles.summaryValue}>
                    €{monthlySummary.totalFuelCost.toFixed(2)}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.summaryBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(30, 30, 30, 0.85)"
                        : "rgba(255, 255, 255, 0.85)",
                    },
                  ]}
                >
                  <ThemedText type="default" style={styles.summaryLabel}>
                    Trošak Servisa
                  </ThemedText>
                  <ThemedText type="title" style={styles.summaryValue}>
                    €{monthlySummary.totalServiceCost.toFixed(2)}
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.summaryBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(30, 30, 30, 0.85)"
                        : "rgba(255, 255, 255, 0.85)",
                    },
                  ]}
                >
                  <ThemedText type="default" style={styles.summaryLabel}>
                    Efikasnost Goriva
                  </ThemedText>
                  <ThemedText type="title" style={styles.summaryValue}>
                    {monthlySummary.fuelEfficiency}L/h
                  </ThemedText>
                </View>

                <View
                  style={[
                    styles.summaryBox,
                    {
                      backgroundColor: isDark
                        ? "rgba(30, 30, 30, 0.85)"
                        : "rgba(255, 255, 255, 0.85)",
                    },
                  ]}
                >
                  <ThemedText type="default" style={styles.summaryLabel}>
                    Trošak po Satu
                  </ThemedText>
                  <ThemedText type="title" style={styles.summaryValue}>
                    €{monthlySummary.costPerHour}/h
                  </ThemedText>
                </View>
              </View>

              <View style={styles.breakdownSection}>
                <ThemedText type="subtitle" style={styles.breakdownTitle}>
                  Pregled po Opremi
                </ThemedText>
                <FlatList
                  data={monthlySummary.equipmentBreakdown}
                  renderItem={renderEquipmentBreakdown}
                  keyExtractor={(_, index) => index.toString()}
                  scrollEnabled={false}
                />
              </View>

              <View
                style={[
                  styles.totalCostBox,
                  {
                    backgroundColor: isDark
                      ? "rgba(30, 30, 30, 0.85)"
                      : "rgba(255, 255, 255, 0.85)",
                  },
                ]}
              >
                <ThemedText type="default" style={styles.totalCostLabel}>
                  Ukupni Trošak Mjeseca
                </ThemedText>
                <ThemedText type="title" style={styles.totalCostValue}>
                  €{(monthlySummary.totalFuelCost + monthlySummary.totalServiceCost).toFixed(2)}
                </ThemedText>
              </View>
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <ThemedText type="default" style={styles.emptyText}>
                Dnevni izvještaji će biti dostupni nakon što dodate podatke
              </ThemedText>
            </View>
          )}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    resizeMode: "cover",
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
  },
  tabBar: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 149, 0, 0.2)",
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#FF9500",
  },
  tabText: {
    fontSize: 14,
    color: "#999999",
  },
  activeTabText: {
    color: "#fff",
  },
  reportContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
  },
  exportSection: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 149, 0, 0.2)",
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
    backgroundColor: "#FF9500",
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
    marginBottom: 16,
  },
  summaryBox: {
    width: "48%",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
    alignItems: "center",
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 16,
    color: "#FF9500",
  },
  breakdownSection: {
    marginBottom: 16,
  },
  breakdownTitle: {
    fontSize: 16,
    marginBottom: 12,
  },
  breakdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
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
  },
  costValue: {
    color: "#FF9500",
  },
  breakdownCostDetail: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 2,
  },
  totalCostBox: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
    alignItems: "center",
    marginBottom: 16,
  },
  totalCostLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  totalCostValue: {
    fontSize: 28,
    color: "#FF9500",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  emptyText: {
    opacity: 0.7,
    textAlign: "center",
  },
});
