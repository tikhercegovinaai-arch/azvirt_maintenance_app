import { useCallback, useState } from "react";
import {
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppData } from "@/hooks/use-app-data";
import { LogHoursModal } from "@/components/modals/log-hours-modal";
import { RecordServiceModal } from "@/components/modals/record-service-modal";
import { AddFuelModal } from "@/components/modals/add-fuel-modal";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const { appState, alerts, loading } = useAppData();
  const [refreshing, setRefreshing] = useState(false);
  const [logHoursOpen, setLogHoursOpen] = useState(false);
  const [recordServiceOpen, setRecordServiceOpen] = useState(false);
  const [addFuelOpen, setAddFuelOpen] = useState(false);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

  const getEquipmentStatus = (equipment: any) => {
    const hoursSinceLastService = equipment.currentHours - equipment.lastServiceHours;
    const hoursUntilService = equipment.serviceIntervalHours - hoursSinceLastService;

    if (hoursUntilService <= 0) {
      return { status: "overdue", color: "#FF3B30", label: "Zakašnjelo" };
    } else if (hoursUntilService <= 50) {
      return { status: "warning", color: "#FF9500", label: "Uskoro" };
    }
    return { status: "good", color: "#34C759", label: "Dobro" };
  };

  const renderEquipmentCard = ({ item }: any) => {
    const statusInfo = getEquipmentStatus(item);
    const hoursSinceLastService = item.currentHours - item.lastServiceHours;
    const hoursUntilService = item.serviceIntervalHours - hoursSinceLastService;

    return (
      <View style={styles.equipmentCard}>
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleSection}>
            <ThemedText type="defaultSemiBold" style={styles.equipmentName}>
              {item.displayName}
            </ThemedText>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: statusInfo.color },
              ]}
            >
              <ThemedText style={styles.statusText}>{statusInfo.label}</ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.cardStats}>
          <View style={styles.stat}>
            <ThemedText type="default" style={styles.statLabel}>
              Trenutni Sati:
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.statValue}>
              {item.currentHours}h
            </ThemedText>
          </View>

          <View style={styles.stat}>
            <ThemedText type="default" style={styles.statLabel}>
              Sati do Servisa:
            </ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.statValue,
                hoursUntilService <= 0 && styles.statValueError,
              ]}
            >
              {Math.max(0, hoursUntilService)}h
            </ThemedText>
          </View>

          <View style={styles.stat}>
            <ThemedText type="default" style={styles.statLabel}>
              Zadnji Servis:
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.statValue}>
              {item.lastServiceDate}
            </ThemedText>
          </View>
        </View>
      </View>
    );
  };

  const renderAlert = ({ item }: any) => {
    const alertColor =
      item.type === "overdue"
        ? "#FF3B30"
        : item.type === "warning"
          ? "#FF9500"
          : "#007AFF";

    return (
      <View style={[styles.alertBox, { borderLeftColor: alertColor }]}>
        <View style={styles.alertContent}>
          <ThemedText type="defaultSemiBold" style={styles.alertTitle}>
            {item.title}
          </ThemedText>
          <ThemedText type="default" style={styles.alertMessage}>
            {item.message}
          </ThemedText>
        </View>
        {item.actionLabel && (
          <Pressable style={styles.alertAction}>
            <ThemedText style={[styles.alertActionText, { color: alertColor }]}>
              {item.actionLabel}
            </ThemedText>
          </Pressable>
        )}
      </View>
    );
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <ThemedText type="title">Kontrolna Tabla</ThemedText>
      </View>

      <FlatList
        data={appState.equipment}
        renderItem={renderEquipmentCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <>
            {/* Quick Action Buttons */}
            <View style={styles.quickActionsSection}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Brze Akcije
              </ThemedText>
              <View style={styles.quickActionsGrid}>
                <Pressable
                  style={styles.quickActionButton}
                  onPress={() => setLogHoursOpen(true)}
                >
                  <ThemedText style={styles.quickActionIcon}>⏱️</ThemedText>
                  <ThemedText style={styles.quickActionLabel}>Unesi Sate</ThemedText>
                </Pressable>
                <Pressable
                  style={styles.quickActionButton}
                  onPress={() => setRecordServiceOpen(true)}
                >
                  <ThemedText style={styles.quickActionIcon}>🔧</ThemedText>
                  <ThemedText style={styles.quickActionLabel}>Servis</ThemedText>
                </Pressable>
                <Pressable
                  style={styles.quickActionButton}
                  onPress={() => setAddFuelOpen(true)}
                >
                  <ThemedText style={styles.quickActionIcon}>⛽</ThemedText>
                  <ThemedText style={styles.quickActionLabel}>Gorivo</ThemedText>
                </Pressable>
              </View>
            </View>

            {/* Active Alerts */}
            {alerts.length > 0 && (
              <View style={styles.alertsSection}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Aktivna Upozorenja ({alerts.length})
                </ThemedText>
                <FlatList
                  data={alerts}
                  renderItem={renderAlert}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            )}

            {/* Equipment Section */}
            <View style={styles.equipmentSection}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Status Opreme
              </ThemedText>
            </View>
          </>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      />

      {/* Modals */}
      <LogHoursModal
        isOpen={logHoursOpen}
        onClose={() => setLogHoursOpen(false)}
      />
      <RecordServiceModal
        isOpen={recordServiceOpen}
        onClose={() => setRecordServiceOpen(false)}
      />
      <AddFuelModal
        isOpen={addFuelOpen}
        onClose={() => setAddFuelOpen(false)}
      />
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  quickActionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
    fontSize: 18,
  },
  quickActionsGrid: {
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#007AFF",
  },
  alertsSection: {
    marginBottom: 24,
  },
  alertBox: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    marginBottom: 8,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertContent: {
    flex: 1,
    gap: 4,
  },
  alertTitle: {
    fontSize: 14,
  },
  alertMessage: {
    fontSize: 12,
    opacity: 0.7,
  },
  alertAction: {
    marginLeft: 12,
  },
  alertActionText: {
    fontSize: 12,
    fontWeight: "600",
  },
  equipmentSection: {
    marginBottom: 12,
  },
  equipmentCard: {
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  equipmentName: {
    fontSize: 16,
    flex: 1,
  },
  statusBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  statusText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  cardStats: {
    gap: 8,
  },
  stat: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 13,
    opacity: 0.7,
  },
  statValue: {
    fontSize: 14,
    fontWeight: "600",
  },
  statValueError: {
    color: "#FF3B30",
  },
});
