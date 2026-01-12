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
import { LogHoursModal } from "@/components/modals/log-hours-modal";
import { RecordServiceModal } from "@/components/modals/record-service-modal";
import { AddFuelModal } from "@/components/modals/add-fuel-modal";
import { AddHistoricalServiceModal } from "@/components/modals/add-historical-service-modal";
import { FuelStockModal } from "@/components/modals/fuel-stock-modal";
import { EquipmentDetailModal } from "@/components/modals/equipment-detail-modal";
import { useAppData } from "@/hooks/use-app-data";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { useThemeColor } from "@/hooks/use-theme-color";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { appState, addFuelToStock, removeFuelFromStock } = useAppData();
  const isDark = colorScheme === "dark";

  const [showLogHours, setShowLogHours] = useState(false);
  const [showRecordService, setShowRecordService] = useState(false);
  const [showAddFuel, setShowAddFuel] = useState(false);
  const [showHistoricalService, setShowHistoricalService] = useState(false);
  const [showFuelStock, setShowFuelStock] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState<any>(null);
  const [showEquipmentDetail, setShowEquipmentDetail] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<any>(null);

  const successColor = "#34C759";
  const warningColor = "#FF9500";
  const dangerColor = "#FF3B30";

  const getEquipmentStatus = (equipment: any) => {
    const hoursSinceLastService = equipment.currentHours - equipment.lastServiceHours;
    const hoursUntilService = equipment.serviceIntervalHours - hoursSinceLastService;

    if (hoursUntilService <= 0) return "overdue";
    if (hoursUntilService <= 50) return "warning";
    return "good";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return successColor;
      case "warning":
        return warningColor;
      case "overdue":
        return dangerColor;
      default:
        return "#8E8E93";
    }
  };

  const alerts = [
    ...appState.equipment
      .filter((eq) => getEquipmentStatus(eq) !== "good")
      .map((eq) => ({
        id: `eq-${eq.id}`,
        type: getEquipmentStatus(eq) === "overdue" ? "danger" : "warning",
        title:
          getEquipmentStatus(eq) === "overdue"
            ? "Servis Zakašnjen"
            : "Servis Uskoro",
        description:
          getEquipmentStatus(eq) === "overdue"
            ? `${eq.displayName} trebao bi servis`
            : `${eq.displayName} - Preostalo: ${Math.max(0, eq.serviceIntervalHours - (eq.currentHours - eq.lastServiceHours))}h`,
        color: getStatusColor(getEquipmentStatus(eq)),
      })),
    ...appState.spareParts
      .filter((part) => part.status !== "adequate")
      .map((part) => ({
        id: `part-${part.id}`,
        type: part.status === "critical" ? "danger" : "warning",
        title: part.status === "critical" ? "Kritična Zaliha" : "Niska Zaliha",
        description: `${part.name} - Dostupno: ${part.currentStock}/${part.minimumLevel}`,
        color: part.status === "critical" ? dangerColor : warningColor,
      })),
  ];

  const handleAlertPress = (alert: any) => {
    if (alert.id.startsWith('eq-')) {
      const equipment = appState.equipment.find((e) => e.id === alert.id.replace('eq-', ''));
      if (equipment) {
        setSelectedEquipment(equipment);
        setShowEquipmentDetail(true);
      }
    }
  };

  // Calculate summary stats
  const totalEquipment = appState.equipment.length;
  const activeAlerts = alerts.length;
  const totalServices = appState.serviceRecords.length;
  const lowStockParts = appState.spareParts.filter((p) => p.status !== "adequate").length;

  const renderAlertItem = ({ item }: { item: any }) => (
    <Pressable
      onPress={() => handleAlertPress(item)}
      style={({ pressed }) => [
        styles.alertItem,
        {
          backgroundColor: isDark
            ? "rgba(30, 30, 30, 0.95)"
            : "rgba(255, 255, 255, 0.95)",
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View style={[styles.alertIndicator, { backgroundColor: item.color }]} />
      <View style={styles.alertContent}>
        <ThemedText type="defaultSemiBold" style={{ color: item.color }}>
          {item.title}
        </ThemedText>
        <ThemedText type="default" style={styles.alertDescription}>
          {item.description}
        </ThemedText>
      </View>
    </Pressable>
  );

  const handleEquipmentPress = (equipment: any) => {
    setSelectedEquipment(equipment);
    setShowEquipmentDetail(true);
  };

  const renderEquipmentCard = ({ item }: { item: any }) => {
    const status = getEquipmentStatus(item);
    const statusColor = getStatusColor(status);
    const hoursSinceLastService = item.currentHours - item.lastServiceHours;
    const hoursUntilService = item.serviceIntervalHours - hoursSinceLastService;

    const hasFuelTracking = item.fuelLevel !== undefined && item.fuelCapacity !== undefined;
    const fuelPercentage = hasFuelTracking ? (item.fuelLevel / item.fuelCapacity) * 100 : 0;

    return (
      <Pressable
        onPress={() => handleEquipmentPress(item)}
        style={({ pressed }) => [
          styles.equipmentCard,
          {
            backgroundColor: isDark
              ? "rgba(30, 30, 30, 0.95)"
              : "rgba(255, 255, 255, 0.95)",
            opacity: pressed ? 0.7 : 1,
          },
        ]}
      >
        <View style={styles.equipmentHeader}>
          <View style={styles.equipmentTitleRow}>
            <ThemedText type="defaultSemiBold" style={styles.equipmentName}>
              {item.displayName}
            </ThemedText>
            <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
          </View>
        </View>

        <View style={styles.equipmentStats}>
          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Sati</ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.statValue}>
              {item.currentHours}h
            </ThemedText>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <ThemedText style={styles.statLabel}>Do Servisa</ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={[styles.statValue, { color: statusColor }]}
            >
              {Math.max(0, hoursUntilService)}h
            </ThemedText>
          </View>

          {hasFuelTracking && (
            <>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <ThemedText style={styles.statLabel}>⛽ Gorivo</ThemedText>
                <ThemedText type="defaultSemiBold" style={styles.statValue}>
                  {item.fuelLevel}L
                </ThemedText>
              </View>
            </>
          )}
        </View>

        {hasFuelTracking && (
          <View style={styles.fuelBar}>
            <View
              style={[
                styles.fuelBarFill,
                {
                  width: `${fuelPercentage}%`,
                  backgroundColor:
                    fuelPercentage > 40
                      ? "#34C759"
                      : fuelPercentage > 20
                        ? "#FF9500"
                        : "#FF3B30",
                },
              ]}
            />
          </View>
        )}
      </Pressable>
    );
  };

  return (
    <>
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
                ? "rgba(0, 0, 0, 0.80)"
                : "rgba(255, 255, 255, 0.88)",
            },
          ]}
        />

        <ScrollView
          style={[styles.content, { paddingTop: Math.max(insets.top, 16) }]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with Summary Stats */}
          <View style={styles.header}>
            <ThemedText type="title" style={styles.headerTitle}>
              AZVIRT Kontrola
            </ThemedText>
            <ThemedText style={styles.headerSubtitle}>
              Betonska Baza - Održavanje
            </ThemedText>
          </View>

          {/* Summary Cards */}
          <View style={styles.summarySection}>
            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark
                    ? "rgba(255, 149, 0, 0.15)"
                    : "rgba(255, 149, 0, 0.1)",
                },
              ]}
            >
              <ThemedText style={styles.summaryValue}>{totalEquipment}</ThemedText>
              <ThemedText style={styles.summaryLabel}>Oprema</ThemedText>
            </View>

            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark
                    ? activeAlerts > 0
                      ? "rgba(255, 59, 48, 0.15)"
                      : "rgba(52, 199, 89, 0.15)"
                    : activeAlerts > 0
                      ? "rgba(255, 59, 48, 0.1)"
                      : "rgba(52, 199, 89, 0.1)",
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.summaryValue,
                  { color: activeAlerts > 0 ? "#FF3B30" : "#34C759" },
                ]}
              >
                {activeAlerts}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Upozorenja</ThemedText>
            </View>

            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark
                    ? "rgba(0, 102, 204, 0.15)"
                    : "rgba(0, 102, 204, 0.1)",
                },
              ]}
            >
              <ThemedText style={[styles.summaryValue, { color: "#0066CC" }]}>
                {totalServices}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Servisi</ThemedText>
            </View>

            <View
              style={[
                styles.summaryCard,
                {
                  backgroundColor: isDark
                    ? lowStockParts > 0
                      ? "rgba(255, 149, 0, 0.15)"
                      : "rgba(52, 199, 89, 0.15)"
                    : lowStockParts > 0
                      ? "rgba(255, 149, 0, 0.1)"
                      : "rgba(52, 199, 89, 0.1)",
                },
              ]}
            >
              <ThemedText
                style={[
                  styles.summaryValue,
                  { color: lowStockParts > 0 ? "#FF9500" : "#34C759" },
                ]}
              >
                {lowStockParts}
              </ThemedText>
              <ThemedText style={styles.summaryLabel}>Niska Zaliha</ThemedText>
            </View>
          </View>

          {/* Quick Actions */}
          <View style={styles.quickActionsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Brze Akcije
            </ThemedText>
            <View style={styles.quickActionsGrid}>
              <Pressable
                style={styles.quickActionButton}
                onPress={() => setShowLogHours(true)}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: "#FF9500" }]}>
                  <ThemedText style={styles.quickActionIcon}>⏱</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold" style={styles.quickActionText}>
                  Unesi
                </ThemedText>
                <ThemedText style={styles.quickActionSubtext}>Sate</ThemedText>
              </Pressable>

              <Pressable
                style={styles.quickActionButton}
                onPress={() => setShowRecordService(true)}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: "#0066CC" }]}>
                  <ThemedText style={styles.quickActionIcon}>🔧</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold" style={styles.quickActionText}>
                  Servis
                </ThemedText>
                <ThemedText style={styles.quickActionSubtext}>Zabilježi</ThemedText>
              </Pressable>

              <Pressable
                style={styles.quickActionButton}
                onPress={() => setShowAddFuel(true)}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: "#34C759" }]}>
                  <ThemedText style={styles.quickActionIcon}>⛽</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold" style={styles.quickActionText}>
                  Gorivo
                </ThemedText>
                <ThemedText style={styles.quickActionSubtext}>Dodaj</ThemedText>
              </Pressable>

              <Pressable
                style={styles.quickActionButton}
                onPress={() => setShowHistoricalService(true)}
              >
                <View style={[styles.quickActionIconContainer, { backgroundColor: "#8E8E93" }]}>
                  <ThemedText style={styles.quickActionIcon}>📋</ThemedText>
                </View>
                <ThemedText type="defaultSemiBold" style={styles.quickActionText}>
                  Stari
                </ThemedText>
                <ThemedText style={styles.quickActionSubtext}>Servis</ThemedText>
              </Pressable>
            </View>
          </View>

          {/* Alerts Section */}
          {alerts.length > 0 && (
            <View style={styles.alertsSection}>
              <View style={styles.sectionHeader}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Aktivna Upozorenja
                </ThemedText>
                <View style={styles.alertBadge}>
                  <ThemedText style={styles.alertBadgeText}>{alerts.length}</ThemedText>
                </View>
              </View>
              <FlatList
                data={alerts}
                renderItem={renderAlertItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          {/* Fuel Stock Card */}
          {appState.fuelStock && (
            <Pressable
              style={[
                styles.fuelStockCard,
                {
                  backgroundColor: isDark
                    ? "rgba(30, 30, 30, 0.95)"
                    : "rgba(255, 255, 255, 0.95)",
                },
              ]}
              onPress={() => setShowFuelStock(true)}
            >
              <View style={styles.fuelStockHeader}>
                <View>
                  <ThemedText type="subtitle" style={styles.fuelStockLabel}>
                    Zaliha Goriva
                  </ThemedText>
                  <ThemedText style={styles.fuelStockSubtitle}>
                    Na lokaciji
                  </ThemedText>
                </View>
                <View style={styles.fuelStockValueContainer}>
                  <ThemedText type="title" style={styles.fuelStockValue}>
                    {appState.fuelStock.currentLiters.toFixed(0)}
                  </ThemedText>
                  <ThemedText style={styles.fuelStockUnit}>L</ThemedText>
                </View>
              </View>

              <View style={styles.fuelStockBar}>
                <View
                  style={[
                    styles.fuelStockBarFill,
                    {
                      width: `${(appState.fuelStock.currentLiters / 5000) * 100}%`,
                      backgroundColor:
                        appState.fuelStock.currentLiters < appState.fuelStock.minimumLevel
                          ? "#FF3B30"
                          : appState.fuelStock.currentLiters < appState.fuelStock.minimumLevel * 2
                            ? "#FF9500"
                            : "#34C759",
                    },
                  ]}
                />
              </View>

              <ThemedText style={styles.fuelStockMin}>
                Minimum: {appState.fuelStock.minimumLevel}L
              </ThemedText>
            </Pressable>
          )}

          {/* Equipment Status */}
          <View style={styles.equipmentSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Status Opreme
            </ThemedText>
            <FlatList
              data={appState.equipment}
              renderItem={renderEquipmentCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      </ImageBackground>

      {/* Modals */}
      <LogHoursModal
        isOpen={showLogHours}
        onClose={() => setShowLogHours(false)}
      />
      <RecordServiceModal
        isOpen={showRecordService}
        onClose={() => setShowRecordService(false)}
      />
      <AddFuelModal
        isOpen={showAddFuel}
        onClose={() => setShowAddFuel(false)}
      />
      <AddHistoricalServiceModal
        visible={showHistoricalService}
        onClose={() => setShowHistoricalService(false)}
      />
      <FuelStockModal
        isOpen={showFuelStock}
        onClose={() => setShowFuelStock(false)}
        fuelStock={appState.fuelStock}
        onAddFuel={addFuelToStock}
        onRemoveFuel={removeFuelFromStock}
      />
      <EquipmentDetailModal
        visible={showEquipmentDetail}
        equipment={selectedEquipment}
        serviceRecords={appState.serviceRecords}
        fuelLogs={appState.fuelLogs}
        onClose={() => {
          setShowEquipmentDetail(false);
          setSelectedEquipment(null);
        }}
      />
    </>
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
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
    paddingTop: 8,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FF9500",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    opacity: 0.7,
    letterSpacing: 0.5,
  },
  summarySection: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 24,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF9500",
    marginBottom: 4,
  },
  summaryLabel: {
    fontSize: 11,
    opacity: 0.7,
    textAlign: "center",
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#FF9500",
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  quickActionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  quickActionIcon: {
    fontSize: 28,
  },
  quickActionText: {
    fontSize: 13,
    textAlign: "center",
  },
  quickActionSubtext: {
    fontSize: 11,
    opacity: 0.6,
    textAlign: "center",
  },
  alertsSection: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  alertBadge: {
    backgroundColor: "#FF3B30",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  alertBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  alertItem: {
    flexDirection: "row",
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  alertIndicator: {
    width: 4,
    borderRadius: 2,
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
    gap: 4,
  },
  alertDescription: {
    fontSize: 13,
    opacity: 0.7,
  },
  fuelStockCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  fuelStockHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  fuelStockLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF9500",
  },
  fuelStockSubtitle: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 2,
  },
  fuelStockValueContainer: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 4,
  },
  fuelStockValue: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FF9500",
  },
  fuelStockUnit: {
    fontSize: 18,
    fontWeight: "600",
    color: "#FF9500",
    opacity: 0.7,
  },
  fuelStockBar: {
    height: 12,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 6,
    overflow: "hidden",
    marginBottom: 8,
  },
  fuelStockBarFill: {
    height: "100%",
    borderRadius: 6,
  },
  fuelStockMin: {
    fontSize: 12,
    opacity: 0.6,
  },
  equipmentSection: {
    marginBottom: 24,
  },
  equipmentCard: {
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  equipmentHeader: {
    marginBottom: 12,
  },
  equipmentTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  equipmentName: {
    fontSize: 15,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  equipmentStats: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  statDivider: {
    width: 1,
    height: 30,
    backgroundColor: "rgba(255, 149, 0, 0.2)",
  },
  fuelBar: {
    height: 6,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 3,
    overflow: "hidden",
  },
  fuelBarFill: {
    height: "100%",
    borderRadius: 3,
  },
});
