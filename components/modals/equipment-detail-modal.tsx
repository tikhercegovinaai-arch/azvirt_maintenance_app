import { useState } from "react";
import {
  FlatList,
  ImageBackground,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { FuelChart } from "@/components/fuel-chart";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Equipment, ServiceRecord, FuelLog } from "@/types";

interface EquipmentDetailModalProps {
  visible: boolean;
  equipment: Equipment | null;
  serviceRecords: ServiceRecord[];
  fuelLogs: FuelLog[];
  onClose: () => void;
}

export function EquipmentDetailModal({
  visible,
  equipment,
  serviceRecords,
  fuelLogs,
  onClose,
}: EquipmentDetailModalProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";
  const [activeTab, setActiveTab] = useState<"overview" | "services" | "fuel">(
    "overview"
  );

  if (!equipment) return null;

  const equipmentServices = serviceRecords.filter(
    (s) => s.equipmentId === equipment.id
  );
  const equipmentFuel = fuelLogs.filter((f) => f.equipmentId === equipment.id);

  // Calculate fuel consumption chart data (last 6 months)
  const fuelChartData = equipmentFuel
    .slice(-6)
    .map((log) => ({
      month: new Date(log.date).toLocaleDateString("hr-HR", {
        month: "short",
      }),
      liters: log.litersAdded,
      cost: log.totalCost,
    }));

  const totalServiceCost = equipmentServices.reduce(
    (sum, s) => sum + s.cost,
    0
  );
  const totalFuelCost = equipmentFuel.reduce((sum, f) => sum + f.totalCost, 0);
  const totalFuelLiters = equipmentFuel.reduce((sum, f) => sum + f.litersAdded, 0);
  const hoursAtLastFuel = equipmentFuel.length > 0 ? equipmentFuel[equipmentFuel.length - 1].hoursAtFueling : 0;
  const fuelEfficiency =
    totalFuelLiters > 0 ? ((equipment.currentHours - hoursAtLastFuel) / totalFuelLiters).toFixed(2) : 0;

  const renderServiceItem = ({ item }: { item: ServiceRecord }) => (
    <View style={styles.serviceItem}>
      <View style={styles.serviceHeader}>
        <ThemedText type="defaultSemiBold">{item.serviceType}</ThemedText>
        <ThemedText type="default" style={styles.serviceDate}>
          {item.date}
        </ThemedText>
      </View>
      <View style={styles.serviceDetails}>
        <ThemedText type="default" style={styles.serviceDetail}>
          Sati: {item.hoursAtService}
        </ThemedText>
        <ThemedText type="default" style={styles.serviceDetail}>
          Tehničar: {item.technician}
        </ThemedText>
        <ThemedText type="defaultSemiBold" style={styles.serviceCost}>
          €{item.cost}
        </ThemedText>
      </View>
      {item.notes && (
        <ThemedText type="default" style={styles.serviceNotes}>
          {item.notes}
        </ThemedText>
      )}
    </View>
  );

  const renderOverviewTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <View style={styles.statusSection}>
        <View style={styles.statusCard}>
          <ThemedText type="default" style={styles.statusLabel}>
            Ukupno Sati
          </ThemedText>
          <ThemedText type="title" style={styles.statusValue}>
            {equipment.currentHours}h
          </ThemedText>
        </View>

        <View style={styles.statusCard}>
          <ThemedText type="default" style={styles.statusLabel}>
            Sljedeći Servis
          </ThemedText>
          <ThemedText type="title" style={styles.statusValue}>
            {equipment.serviceIntervalHours}h
          </ThemedText>
        </View>

        <View style={styles.statusCard}>
          <ThemedText type="default" style={styles.statusLabel}>
            Sati do Servisa
          </ThemedText>
          <ThemedText
            type="title"
            style={[
              styles.statusValue,
              {
                color:
                  equipment.serviceIntervalHours - equipment.currentHours <= 50
                    ? "#FF9500"
                    : "#34C759",
              },
            ]}
          >
            {Math.max(0, equipment.serviceIntervalHours - equipment.currentHours)}h
          </ThemedText>
        </View>
      </View>

      <View style={styles.metricsSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Metrike
        </ThemedText>

        <View style={styles.metricRow}>
          <ThemedText type="default" style={styles.metricLabel}>
            Ukupni Trošak Servisa
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.metricValue}>
            €{totalServiceCost.toFixed(2)}
          </ThemedText>
        </View>

        <View style={styles.metricRow}>
          <ThemedText type="default" style={styles.metricLabel}>
            Ukupni Trošak Goriva
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.metricValue}>
            €{totalFuelCost.toFixed(2)}
          </ThemedText>
        </View>

        <View style={styles.metricRow}>
          <ThemedText type="default" style={styles.metricLabel}>
            Ukupna Potrošnja Goriva
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.metricValue}>
            {totalFuelLiters > 0 ? totalFuelLiters.toFixed(1) : "0.0"}L
          </ThemedText>
        </View>

        <View style={styles.metricRow}>
          <ThemedText type="default" style={styles.metricLabel}>
            Efikasnost Goriva
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.metricValue}>
            {fuelEfficiency}h/L
          </ThemedText>
        </View>

        <View style={styles.metricRow}>
          <ThemedText type="default" style={styles.metricLabel}>
            Trošak po Satu
          </ThemedText>
          <ThemedText type="defaultSemiBold" style={styles.metricValue}>
            €{equipment.currentHours > 0 ? ((totalServiceCost + totalFuelCost) / equipment.currentHours).toFixed(2) : "0.00"}
          </ThemedText>
        </View>
      </View>
    </ScrollView>
  );

  const renderServicesTab = () => (
    <FlatList
      data={equipmentServices}
      renderItem={renderServiceItem}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.tabContent}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <ThemedText type="default">Nema servisa za ovu opremu</ThemedText>
        </View>
      }
      ListHeaderComponent={
        <View style={styles.servicesHeader}>
          <ThemedText type="subtitle">
            Ukupno Servisa: {equipmentServices.length}
          </ThemedText>
          <ThemedText type="default" style={styles.servicesHeaderSubtitle}>
            Ukupni Trošak: €{totalServiceCost.toFixed(2)}
          </ThemedText>
        </View>
      }
    />
  );

  const renderFuelTab = () => (
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      <FuelChart data={fuelChartData} />

      <View style={styles.fuelListSection}>
        <ThemedText type="subtitle" style={styles.sectionTitle}>
          Zadnja Dodana Goriva
        </ThemedText>
        {equipmentFuel.slice(-5).map((log, index) => (
          <View key={index} style={styles.fuelItem}>
            <View style={styles.fuelItemLeft}>
              <ThemedText type="defaultSemiBold">{log.date}</ThemedText>
              <ThemedText type="default" style={styles.fuelItemSubtitle}>
                {log.litersAdded}L @ €{log.costPerLiter}/L
              </ThemedText>
            </View>
            <ThemedText type="defaultSemiBold" style={styles.fuelItemCost}>
              €{log.totalCost.toFixed(2)}
            </ThemedText>
          </View>
        ))}
      </View>
    </ScrollView>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={false}
      onRequestClose={onClose}
    >
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
                ? "rgba(0, 0, 0, 0.6)"
                : "rgba(255, 255, 255, 0.85)",
            },
          ]}
        />

        <View style={[styles.content, { paddingTop: Math.max(insets.top, 16) }]}>
          <View style={styles.header}>
            <ThemedText type="title">{equipment.displayName}</ThemedText>
            <Pressable style={styles.closeButton} onPress={onClose}>
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </Pressable>
          </View>

          <View style={styles.tabBar}>
            <Pressable
              style={[
                styles.tab,
                activeTab === "overview" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("overview")}
            >
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.tabText,
                  activeTab === "overview" && styles.activeTabText,
                ]}
              >
                Pregled
              </ThemedText>
            </Pressable>

            <Pressable
              style={[
                styles.tab,
                activeTab === "services" && styles.activeTab,
              ]}
              onPress={() => setActiveTab("services")}
            >
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.tabText,
                  activeTab === "services" && styles.activeTabText,
                ]}
              >
                Servisi ({equipmentServices.length})
              </ThemedText>
            </Pressable>

            <Pressable
              style={[styles.tab, activeTab === "fuel" && styles.activeTab]}
              onPress={() => setActiveTab("fuel")}
            >
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.tabText,
                  activeTab === "fuel" && styles.activeTabText,
                ]}
              >
                Gorivo
              </ThemedText>
            </Pressable>
          </View>

          {activeTab === "overview" && renderOverviewTab()}
          {activeTab === "services" && renderServicesTab()}
          {activeTab === "fuel" && renderFuelTab()}
        </View>
      </ImageBackground>
    </Modal>
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF9500",
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
    fontSize: 13,
    color: "#999999",
  },
  activeTabText: {
    color: "#fff",
  },
  tabContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusSection: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },
  statusCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 149, 0, 0.15)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  statusLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    color: "#FF9500",
  },
  metricsSection: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.7)",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  metricLabel: {
    fontSize: 14,
    opacity: 0.8,
  },
  metricValue: {
    fontSize: 16,
    color: "#FF9500",
  },
  servicesHeader: {
    marginBottom: 16,
  },
  servicesHeaderSubtitle: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 4,
  },
  serviceItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceDate: {
    fontSize: 12,
    opacity: 0.7,
  },
  serviceDetails: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
  },
  serviceDetail: {
    fontSize: 12,
    opacity: 0.7,
  },
  serviceCost: {
    color: "#FF9500",
  },
  serviceNotes: {
    fontSize: 12,
    opacity: 0.6,
    fontStyle: "italic",
  },
  fuelListSection: {
    marginTop: 20,
  },
  fuelItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  fuelItemLeft: {
    flex: 1,
  },
  fuelItemSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  fuelItemCost: {
    color: "#FF9500",
    marginLeft: 12,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});
