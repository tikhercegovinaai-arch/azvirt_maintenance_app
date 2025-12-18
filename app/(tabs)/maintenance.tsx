import { useState } from "react";
import {
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  View,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppData } from "@/hooks/use-app-data";
import { LubricationPoint, ServiceRecord } from "@/types";

type TabType = "lubrication" | "services";

export default function MaintenanceScreen() {
  const insets = useSafeAreaInsets();
  const { appState, markLubricationComplete, markAllWeeklyLubricationComplete } =
    useAppData();
  const [activeTab, setActiveTab] = useState<TabType>("lubrication");
  const [completing, setCompleting] = useState(false);
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

  const lubricationByFrequency = {
    daily: appState.lubricationPoints.filter((p) => p.frequency === "daily"),
    weekly: appState.lubricationPoints.filter((p) => p.frequency === "weekly"),
    monthly: appState.lubricationPoints.filter((p) => p.frequency === "monthly"),
  };

  const weeklyDueCount = lubricationByFrequency.weekly.filter(
    (p) => p.status === "due" || p.status === "overdue"
  ).length;

  const handleCompleteAllWeekly = async () => {
    Alert.alert(
      "Potvrdi Akciju",
      `Označiti će se ${lubricationByFrequency.weekly.length} sedmičnih točaka podmazivanja kao obavljeno. Nastaviti?`,
      [
        {
          text: "Otkaži",
          onPress: () => {},
          style: "cancel",
        },
        {
          text: "Potvrdi",
          onPress: async () => {
            try {
              setCompleting(true);
              await markAllWeeklyLubricationComplete();
              Alert.alert(
                "Uspjeh",
                `${lubricationByFrequency.weekly.length} sedmičnih točaka podmazivanja označeno kao obavljeno`,
                [{ text: "OK" }]
              );
            } catch (error) {
              Alert.alert("Greška", "Greška pri označavanju točaka", [
                { text: "OK" },
              ]);
            } finally {
              setCompleting(false);
            }
          },
          style: "default",
        },
      ]
    );
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
            <>
              {/* Complete All Weekly Button */}
              {lubricationByFrequency.weekly.length > 0 && (
                <View style={styles.bulkActionSection}>
                  <Pressable
                    style={[
                      styles.completeAllButton,
                      completing && styles.completeAllButtonDisabled,
                    ]}
                    onPress={handleCompleteAllWeekly}
                    disabled={completing}
                  >
                    {completing ? (
                      <ActivityIndicator color="#fff" />
                    ) : (
                      <>
                        <ThemedText style={styles.completeAllButtonText}>
                          ✓ Označi sve sedmične kao obavljene
                        </ThemedText>
                        {weeklyDueCount > 0 && (
                          <View style={styles.badgeCount}>
                            <ThemedText style={styles.badgeCountText}>
                              {weeklyDueCount}
                            </ThemedText>
                          </View>
                        )}
                      </>
                    )}
                  </Pressable>
                  <ThemedText type="default" style={styles.bulkActionInfo}>
                    Ukupno sedmičnih točaka: {lubricationByFrequency.weekly.length}
                  </ThemedText>
                </View>
              )}

              {/* Daily Section */}
              {lubricationByFrequency.daily.length > 0 && (
                <View style={styles.frequencySection}>
                  <ThemedText type="subtitle" style={styles.frequencyTitle}>
                    Dnevno ({lubricationByFrequency.daily.length})
                  </ThemedText>
                </View>
              )}
            </>
          }
          ListFooterComponent={
            <>
              {/* Weekly Section */}
              {lubricationByFrequency.weekly.length > 0 && (
                <View style={styles.frequencySection}>
                  <ThemedText type="subtitle" style={styles.frequencyTitle}>
                    Sedmično ({lubricationByFrequency.weekly.length})
                  </ThemedText>
                </View>
              )}

              {/* Monthly Section */}
              {lubricationByFrequency.monthly.length > 0 && (
                <View style={styles.frequencySection}>
                  <ThemedText type="subtitle" style={styles.frequencyTitle}>
                    Mjesečno ({lubricationByFrequency.monthly.length})
                  </ThemedText>
                </View>
              )}
            </>
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
  bulkActionSection: {
    marginBottom: 20,
    gap: 8,
  },
  completeAllButton: {
    flexDirection: "row",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    backgroundColor: "#34C759",
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    gap: 8,
  },
  completeAllButtonDisabled: {
    opacity: 0.6,
  },
  completeAllButtonText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "600",
  },
  badgeCount: {
    marginLeft: "auto",
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  badgeCountText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  bulkActionInfo: {
    fontSize: 12,
    opacity: 0.7,
    paddingHorizontal: 4,
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
    fontSize: 13,
    marginTop: 2,
    opacity: 0.7,
  },
  lubricationDate: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
  },
  statusBadge: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginLeft: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  serviceItem: {
    flexDirection: "row",
    justifyContent: "space-between",
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
    fontSize: 13,
    marginTop: 2,
    opacity: 0.7,
  },
  serviceDate: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
  },
  serviceNotes: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
    fontStyle: "italic",
  },
  serviceCost: {
    alignItems: "flex-end",
    marginLeft: 12,
  },
  technician: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
});
