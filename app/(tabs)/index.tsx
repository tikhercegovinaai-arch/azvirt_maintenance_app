import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppData } from "@/hooks/use-app-data";
import { useThemeColor } from "@/hooks/use-theme-color";
import { Equipment, Alert } from "@/types";

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const { appState, loading, alerts, getEquipmentStatus } = useAppData();
  const [refreshing, setRefreshing] = useState(false);
  const backgroundColor = useThemeColor({}, "background");
  const cardColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");
  const successColor = "#34C759";
  const warningColor = "#FF9500";
  const dangerColor = "#FF3B30";

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  }, []);

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "good":
        return "Dobro";
      case "warning":
        return "Upozorenje";
      case "overdue":
        return "Zakašnjelo";
      default:
        return "Nepoznato";
    }
  };

  const renderEquipmentCard = ({ item }: { item: Equipment }) => {
    const status = getEquipmentStatus(item);
    const hoursSinceLastService = item.currentHours - item.lastServiceHours;
    const hoursUntilService = item.serviceIntervalHours - hoursSinceLastService;

    return (
      <Pressable style={[styles.equipmentCard, { backgroundColor: cardColor }]}>
        <View style={styles.cardHeader}>
          <ThemedText type="defaultSemiBold" style={styles.equipmentName}>
            {item.displayName}
          </ThemedText>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(status) },
            ]}
          >
            <ThemedText style={styles.statusText}>{getStatusLabel(status)}</ThemedText>
          </View>
        </View>

        <View style={styles.cardContent}>
          <View style={styles.statRow}>
            <ThemedText type="default" style={styles.statLabel}>
              Trenutni Sati:
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.statValue}>
              {item.currentHours}h
            </ThemedText>
          </View>

          <View style={styles.statRow}>
            <ThemedText type="default" style={styles.statLabel}>
              Sati do Servisa:
            </ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={[
                styles.statValue,
                { color: hoursUntilService <= 0 ? dangerColor : warningColor },
              ]}
            >
              {Math.max(0, hoursUntilService)}h
            </ThemedText>
          </View>

          <View style={styles.statRow}>
            <ThemedText type="default" style={styles.statLabel}>
              Zadnji Servis:
            </ThemedText>
            <ThemedText type="default" style={styles.statValue}>
              {item.lastServiceDate}
            </ThemedText>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderAlertCard = ({ item }: { item: Alert }) => {
    const alertBgColor = item.type === "overdue" ? dangerColor : warningColor;

    return (
      <Pressable style={[styles.alertCard, { backgroundColor: alertBgColor }]}>
        <View style={styles.alertContent}>
          <ThemedText type="defaultSemiBold" style={styles.alertTitle}>
            {item.title}
          </ThemedText>
          <ThemedText style={styles.alertMessage}>{item.message}</ThemedText>
        </View>
        {item.actionLabel && (
          <ThemedText type="link" style={styles.alertAction}>
            {item.actionLabel}
          </ThemedText>
        )}
      </Pressable>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.container}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <FlatList
        data={appState.equipment}
        renderItem={renderEquipmentCard}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={
          <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
            <ThemedText type="title">Kontrolna Tabla</ThemedText>
            {alerts.length > 0 && (
              <View style={styles.alertsSection}>
                <ThemedText type="subtitle" style={styles.alertsTitle}>
                  Aktivna Upozorenja ({alerts.length})
                </ThemedText>
                <FlatList
                  data={alerts.slice(0, 3)}
                  renderItem={renderAlertCard}
                  keyExtractor={(item) => item.id}
                  scrollEnabled={false}
                />
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <ThemedText type="default">Nema opreme za prikaz</ThemedText>
          </View>
        }
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
  alertsSection: {
    marginTop: 24,
  },
  alertsTitle: {
    marginBottom: 12,
    fontSize: 18,
  },
  equipmentCard: {
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  equipmentName: {
    fontSize: 16,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    gap: 8,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    flex: 1,
  },
  statValue: {
    fontSize: 14,
    minWidth: 80,
    textAlign: "right",
  },
  alertCard: {
    marginBottom: 8,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  alertContent: {
    flex: 1,
  },
  alertTitle: {
    color: "#fff",
    fontSize: 14,
    marginBottom: 4,
  },
  alertMessage: {
    color: "#fff",
    fontSize: 12,
    opacity: 0.9,
  },
  alertAction: {
    color: "#fff",
    fontSize: 12,
    marginLeft: 8,
    textDecorationLine: "underline",
  },
  listContent: {
    paddingBottom: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
});
