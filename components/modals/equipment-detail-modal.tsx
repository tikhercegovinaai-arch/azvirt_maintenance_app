import { useState } from "react";
import {
  FlatList,
  Image,
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
import { ServiceCostChart } from "@/components/service-cost-chart";
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
    <ScrollView style={styles.tabContent} showsVerticalScrollIndicator={false}>
      {equipmentServices.length > 0 ? (
        <>
          <View style={styles.chartSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Analiza Trošaka Servisa
            </ThemedText>
            <ServiceCostChart services={equipmentServices} size={220} />
          </View>

          <View style={styles.servicesListSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Istorija Servisa
            </ThemedText>
            {equipmentServices.map((service) => (
              <View key={service.id} style={styles.serviceItem}>
                <View style={styles.serviceHeader}>
                  <ThemedText type="defaultSemiBold">{service.serviceType}</ThemedText>
                  <ThemedText type="default" style={styles.serviceDate}>
                    {service.date}
                  </ThemedText>
                </View>
                <View style={styles.serviceDetails}>
                  <ThemedText type="default" style={styles.serviceDetail}>
                    Sati: {service.hoursAtService}
                  </ThemedText>
                  <ThemedText type="default" style={styles.serviceDetail}>
                    Tehničar: {service.technician}
                  </ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.serviceCost}>
                    €{service.cost}
                  </ThemedText>
                </View>
                {service.notes && (
                  <ThemedText type="default" style={styles.serviceNotes}>
                    {service.notes}
                  </ThemedText>
                )}
                {service.photos && service.photos.length > 0 && (
                  <View style={styles.servicePhotos}>
                    <ThemedText type="default" style={styles.servicePhotosLabel}>
                      📷 {service.photos.length} fotografija
                    </ThemedText>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      {service.photos.map((photo, index) => (
                        <Image
                          key={index}
                          source={{ uri: photo }}
                          style={styles.servicePhoto}
                        />
                      ))}
                    </ScrollView>
                  </View>
                )}
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <ThemedText type="default">Nema servisa za ovu opremu</ThemedText>
        </View>
      )}
    </ScrollView>
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
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 149, 0, 0.2)",
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
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 149, 0, 0.2)",
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    backgroundColor: "rgba(255, 149, 0, 0.05)",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.1)",
  },
  activeTab: {
    backgroundColor: "#FF9500",
    borderColor: "#FF9500",
  },
  tabText: {
    fontSize: 12,
    color: "#FF9500",
  },
  activeTabText: {
    color: "#fff",
  },
  tabContent: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusSection: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  statusCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
    alignItems: "center",
  },
  statusLabel: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 4,
  },
  statusValue: {
    fontSize: 18,
    color: "#FF9500",
  },
  metricsSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#FF9500",
  },
  metricRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.1)",
  },
  metricLabel: {
    fontSize: 13,
    opacity: 0.7,
  },
  metricValue: {
    fontSize: 13,
    color: "#FF9500",
  },
  chartSection: {
    marginBottom: 20,
    paddingVertical: 12,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.1)",
    paddingHorizontal: 12,
  },
  servicesListSection: {
    marginBottom: 20,
  },
  serviceItem: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.1)",
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  serviceDate: {
    fontSize: 12,
    opacity: 0.6,
  },
  serviceDetails: {
    gap: 4,
    marginBottom: 8,
  },
  serviceDetail: {
    fontSize: 12,
    opacity: 0.7,
  },
  serviceCost: {
    fontSize: 13,
    color: "#FF9500",
  },
  serviceNotes: {
    fontSize: 12,
    fontStyle: "italic",
    opacity: 0.6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 149, 0, 0.1)",
  },
  servicePhotos: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "rgba(255, 149, 0, 0.1)",
  },
  servicePhotosLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 8,
  },
  servicePhoto: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
  },
  fuelListSection: {
    marginBottom: 20,
  },
  fuelItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.1)",
  },
  fuelItemLeft: {
    flex: 1,
  },
  fuelItemSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  fuelItemCost: {
    fontSize: 13,
    color: "#FF9500",
  },
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
  servicesHeader: {
    paddingVertical: 12,
    marginBottom: 12,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
    borderRadius: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.1)",
  },
  servicesHeaderSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
});
