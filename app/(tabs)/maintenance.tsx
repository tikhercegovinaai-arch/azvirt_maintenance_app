import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppData } from "@/hooks/use-app-data";
import { LubricationPoint, ServiceRecord } from "@/types";

type TabType = "lubrication" | "services";

export default function MaintenanceScreen() {
  const insets = useSafeAreaInsets();
  const { appState, markLubricationComplete } = useAppData();
  const [activeTab, setActiveTab] = useState<TabType>("lubrication");
  const successColor = "#34C759";
  const warningColor = "#FF9500";
  const dangerColor = "#FF3B30";

  const getStatusColor = (status: string) => {
    switch (status) {
      case "good":
        return successColor;
      case "due":
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
      case "due":
        return "Uskoro";
      case "overdue":
        return "Zakašnjelo";
      default:
        return "Nepoznato";
    }
  };

  const renderLubricationPoint = ({ item }: { item: LubricationPoint }) => (
    <Pressable
      style={styles.lubricationItem}
      onPress={() => markLubricationComplete(item.id)}
    >
      <View style={styles.lubricationInfo}>
        <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
        <ThemedText type="default" style={styles.lubricationSubtitle}>
          {item.frequency === "daily"
            ? "Dnevno"
            : item.frequency === "weekly"
              ? "Sedmično"
              : "Mjesečno"}{" "}
          • {item.type}
        </ThemedText>
        {item.lastCompleted && (
          <ThemedText type="default" style={styles.lubricationDate}>
            Zadnje obavljeno: {item.lastCompleted}
          </ThemedText>
        )}
      </View>
      <View
        style={[
          styles.statusBadge,
          { backgroundColor: getStatusColor(item.status) },
        ]}
      >
        <ThemedText style={styles.statusText}>
          {getStatusLabel(item.status)}
        </ThemedText>
      </View>
    </Pressable>
  );

  const renderServiceRecord = ({ item }: { item: ServiceRecord }) => {
    const equipment = appState.equipment.find((e) => e.id === item.equipmentId);

    return (
      <Pressable style={styles.serviceItem}>
        <View style={styles.serviceInfo}>
          <ThemedText type="defaultSemiBold">{item.serviceType}</ThemedText>
          <ThemedText type="default" style={styles.serviceSubtitle}>
            {equipment?.displayName}
          </ThemedText>
          <ThemedText type="default" style={styles.serviceDate}>
            {item.date} • {item.hoursAtService}h
          </ThemedText>
          {item.notes && (
            <ThemedText type="default" style={styles.serviceNotes}>
              {item.notes}
            </ThemedText>
          )}
        </View>
        <View style={styles.serviceCost}>
          <ThemedText type="defaultSemiBold">€{item.cost}</ThemedText>
          <ThemedText type="default" style={styles.technician}>
            {item.technician}
          </ThemedText>
        </View>
      </Pressable>
    );
  };

  const lubricationByFrequency = {
    daily: appState.lubricationPoints.filter((p) => p.frequency === "daily"),
    weekly: appState.lubricationPoints.filter((p) => p.frequency === "weekly"),
    monthly: appState.lubricationPoints.filter((p) => p.frequency === "monthly"),
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <ThemedText type="title">Održavanje</ThemedText>
      </View>

      <View style={styles.tabBar}>
        <Pressable
          style={[
            styles.tab,
            activeTab === "lubrication" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("lubrication")}
        >
          <ThemedText
            type="defaultSemiBold"
            style={[
              styles.tabText,
              activeTab === "lubrication" && styles.activeTabText,
            ]}
          >
            Podmazivanje
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
            Servisi
          </ThemedText>
        </Pressable>
      </View>

      {activeTab === "lubrication" ? (
        <FlatList
          data={[
            ...lubricationByFrequency.daily,
            ...lubricationByFrequency.weekly,
            ...lubricationByFrequency.monthly,
          ]}
          renderItem={renderLubricationPoint}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            lubricationByFrequency.daily.length > 0 ? (
              <View style={styles.frequencySection}>
                <ThemedText type="subtitle" style={styles.frequencyTitle}>
                  Dnevno ({lubricationByFrequency.daily.length})
                </ThemedText>
              </View>
            ) : null
          }
        />
      ) : (
        <FlatList
          data={appState.serviceRecords}
          renderItem={renderServiceRecord}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <ThemedText type="default">Nema servisa</ThemedText>
            </View>
          }
        />
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
  frequencySection: {
    marginBottom: 12,
  },
  frequencyTitle: {
    fontSize: 16,
    marginBottom: 8,
  },
  lubricationItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  lubricationInfo: {
    flex: 1,
  },
  lubricationSubtitle: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  lubricationDate: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
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
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  serviceInfo: {
    flex: 1,
  },
  serviceSubtitle: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  serviceDate: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.6,
  },
  serviceNotes: {
    fontSize: 11,
    marginTop: 4,
    fontStyle: "italic",
    opacity: 0.7,
  },
  serviceCost: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  technician: {
    fontSize: 11,
    marginTop: 4,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
});
