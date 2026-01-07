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
            : "Niska Zalihа",
        description:
          getEquipmentStatus(eq) === "overdue"
            ? `${eq.displayName} trebao bi servis`
            : `${eq.displayName} - Dostupno: ${Math.max(0, eq.serviceIntervalHours - (eq.currentHours - eq.lastServiceHours))}h`,
        color: getStatusColor(getEquipmentStatus(eq)),
      })),
    ...appState.spareParts
      .filter((part) => part.status !== "adequate")
      .map((part) => ({
        id: `part-${part.id}`,
        type: part.status === "critical" ? "danger" : "warning",
        title: part.status === "critical" ? "Niska Zalihа" : "Azuriraj Zalihu",
        description: `${part.name} - Dostupno: ${part.currentStock}. Minimum: ${part.minimumLevel}`,
        color: part.status === "critical" ? dangerColor : warningColor,
      })),
  ];

  const renderAlertItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.alertItem,
        {
          borderLeftColor: item.color,
          backgroundColor: isDark
            ? "rgba(30, 30, 30, 0.9)"
            : "rgba(255, 255, 255, 0.9)",
        },
      ]}
    >
      <View style={styles.alertContent}>
        <ThemedText type="defaultSemiBold" style={{ color: item.color }}>
          {item.title}
        </ThemedText>
        <ThemedText type="default" style={styles.alertDescription}>
          {item.description}
        </ThemedText>
      </View>
    </View>
  );

  const getFuelLevelColor = (fuelLevel: number, capacity: number) => {
    const percentage = (fuelLevel / capacity) * 100;
    if (percentage <= 20) return dangerColor;
    if (percentage <= 40) return warningColor;
    return successColor;
  };

  const renderEquipmentCard = ({ item }: { item: any }) => {
    const status = getEquipmentStatus(item);
    const hoursSinceLastService = item.currentHours - item.lastServiceHours;
    const hoursUntilService = item.serviceIntervalHours - hoursSinceLastService;
    const hasFuelTracking = item.fuelLevel !== undefined && item.fuelCapacity !== undefined;
    const fuelPercentage = hasFuelTracking ? (item.fuelLevel / item.fuelCapacity) * 100 : 0;

    return (
      <View
        style={[
          styles.equipmentCard,
          {
            backgroundColor: isDark
              ? "rgba(30, 30, 30, 0.85)"
              : "rgba(255, 255, 255, 0.85)",
          },
        ]}
      >
        <ThemedText type="defaultSemiBold" style={styles.equipmentName}>
          {item.displayName}
        </ThemedText>
        <View style={styles.cardStats}>
          <View style={styles.statBox}>
            <ThemedText type="default" style={styles.statLabel}>
              Sati
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.statValue}>
              {item.currentHours}h
            </ThemedText>
          </View>
          <View style={styles.statBox}>
            <ThemedText type="default" style={styles.statLabel}>
              Do Servisa
            </ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.statValue,
                { color: getStatusColor(status) },
              ]}
            >
              {hoursUntilService}h
            </ThemedText>
          </View>
          {hasFuelTracking && (
            <View style={styles.statBox}>
              <ThemedText type="default" style={styles.statLabel}>
                ⛽ Gorivo
              </ThemedText>
              <ThemedText
                type="defaultSemiBold"
                style={[
                  styles.statValue,
                  { color: getFuelLevelColor(item.fuelLevel, item.fuelCapacity) },
                ]}
              >
                {item.fuelLevel}L
              </ThemedText>
              <View style={styles.fuelBar}>
                <View
                  style={[
                    styles.fuelBarFill,
                    {
                      width: `${fuelPercentage}%`,
                      backgroundColor: getFuelLevelColor(item.fuelLevel, item.fuelCapacity),
                    },
                  ]}
                />
              </View>
            </View>
          )}
          <View
            style={[
              styles.statusDot,
              { backgroundColor: getStatusColor(status) },
            ]}
          />
        </View>
      </View>
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
                ? "rgba(0, 0, 0, 0.75)"
                : "rgba(255, 255, 255, 0.85)",
            },
          ]}
        />

        <ScrollView
          style={[styles.content, { paddingTop: Math.max(insets.top, 16) }]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.headerTitle}>
              Kontrolna Tabla
            </ThemedText>
          </View>

          {/* Fuel Stock Card */}
          {appState.fuelStock && (
            <Pressable
              style={[
                styles.fuelStockCard,
                {
                  backgroundColor: isDark
                    ? "rgba(30, 30, 30, 0.85)"
                    : "rgba(255, 255, 255, 0.85)",
                  borderColor:
                    appState.fuelStock.currentLiters < appState.fuelStock.minimumLevel
                      ? "#FF3B30"
                      : "#FF9500",
                },
              ]}
              onPress={() => setShowFuelStock(true)}
            >
              <View style={styles.fuelStockContent}>
                <ThemedText type="subtitle" style={styles.fuelStockLabel}>
                  ⛽ Zaliha Goriva na Lokaciji
                </ThemedText>
                <ThemedText type="title" style={styles.fuelStockValue}>
                  {appState.fuelStock.currentLiters.toFixed(1)} L
                </ThemedText>
                <ThemedText type="default" style={styles.fuelStockMin}>
                  Min: {appState.fuelStock.minimumLevel} L
                </ThemedText>
              </View>
              {appState.fuelStock.currentLiters < appState.fuelStock.minimumLevel && (
                <View style={styles.fuelStockWarning}>
                  <ThemedText type="default" style={styles.warningText}>
                    ⚠️
                  </ThemedText>
                </View>
              )}
            </Pressable>
          )}

          <View style={styles.quickActionsSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Brze Akcije
            </ThemedText>
            <View style={styles.quickActionsRow}>
              <Pressable
                style={[
                  styles.quickActionButton,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 149, 0, 0.2)"
                      : "rgba(255, 149, 0, 0.15)",
                  },
                ]}
                onPress={() => setShowLogHours(true)}
              >
                <ThemedText style={styles.quickActionIcon}>⏱</ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.quickActionText}
                >
                  Unesi Sate
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.quickActionButton,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 149, 0, 0.2)"
                      : "rgba(255, 149, 0, 0.15)",
                  },
                ]}
                onPress={() => setShowRecordService(true)}
              >
                <ThemedText style={styles.quickActionIcon}>🔧</ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.quickActionText}
                >
                  Servis
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.quickActionButton,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 149, 0, 0.2)"
                      : "rgba(255, 149, 0, 0.15)",
                  },
                ]}
                onPress={() => setShowAddFuel(true)}
              >
                <ThemedText style={styles.quickActionIcon}>⛽</ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.quickActionText}
                >
                  Gorivo
                </ThemedText>
              </Pressable>

              <Pressable
                style={[
                  styles.quickActionButton,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 149, 0, 0.2)"
                      : "rgba(255, 149, 0, 0.15)",
                  },
                ]}
                onPress={() => setShowHistoricalService(true)}
              >
                <ThemedText style={styles.quickActionIcon}>📋</ThemedText>
                <ThemedText
                  type="defaultSemiBold"
                  style={styles.quickActionText}
                >
                  Stari Servis
                </ThemedText>
              </Pressable>
            </View>
          </View>

          {alerts.length > 0 && (
            <View style={styles.alertsSection}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Aktivna Upozorenja ({alerts.length})
              </ThemedText>
              <FlatList
                data={alerts}
                renderItem={renderAlertItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}

          <View style={styles.equipmentSection}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Status Opreme
            </ThemedText>
            <FlatList
              data={appState.equipment}
              renderItem={renderEquipmentCard}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              numColumns={2}
              columnWrapperStyle={styles.equipmentRow}
            />
          </View>
        </ScrollView>
      </ImageBackground>

      <LogHoursModal isOpen={showLogHours} onClose={() => setShowLogHours(false)} />
      <RecordServiceModal
        isOpen={showRecordService}
        onClose={() => setShowRecordService(false)}
      />
      <AddFuelModal isOpen={showAddFuel} onClose={() => setShowAddFuel(false)} />
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
  },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
  },
  quickActionsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 12,
  },
  quickActionsRow: {
    flexDirection: "row",
    gap: 12,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  quickActionText: {
    fontSize: 12,
    color: "#FF9500",
    textAlign: "center",
  },
  alertsSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  alertItem: {
    borderLeftWidth: 4,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  alertContent: {
    gap: 4,
  },
  alertDescription: {
    fontSize: 13,
    opacity: 0.8,
  },
  equipmentSection: {
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  equipmentRow: {
    gap: 12,
  },
  equipmentCard: {
    flex: 1,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  equipmentName: {
    fontSize: 14,
    marginBottom: 10,
  },
  cardStats: {
    gap: 8,
  },
  statBox: {
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 2,
  },
  statValue: {
    fontSize: 14,
    color: "#FF9500",
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 4,
  },
  fuelStockCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fuelStockContent: {
    flex: 1,
  },
  fuelStockLabel: {
    fontSize: 14,
    marginBottom: 6,
  },
  fuelStockValue: {
    fontSize: 28,
    color: "#FF9500",
    marginBottom: 4,
  },
  fuelStockMin: {
    fontSize: 12,
    opacity: 0.7,
  },
  fuelStockWarning: {
    paddingHorizontal: 12,
  },
  warningText: {
    fontSize: 20,
  },
  fuelBar: {
    width: "100%",
    height: 4,
    backgroundColor: "rgba(255, 149, 0, 0.2)",
    borderRadius: 2,
    marginTop: 6,
    overflow: "hidden",
  },
  fuelBarFill: {
    height: "100%",
    borderRadius: 2,
  },
});
