import { useState } from "react";
import { FlatList, ImageBackground, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppData } from "@/hooks/use-app-data";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { Equipment } from "@/types";

export default function EquipmentScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { appState, getEquipmentStatus } = useAppData();
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const isDark = colorScheme === "dark";
  const successColor = "#34C759";
  const warningColor = "#FF9500";
  const dangerColor = "#FF3B30";

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

  const renderEquipmentItem = ({ item }: { item: Equipment }) => {
    const status = getEquipmentStatus(item);
    const hoursSinceLastService = item.currentHours - item.lastServiceHours;
    const hoursUntilService = item.serviceIntervalHours - hoursSinceLastService;

    return (
      <Pressable
        style={styles.equipmentItem}
        onPress={() => setSelectedEquipment(item)}
      >
        <View style={styles.itemHeader}>
          <View style={styles.itemInfo}>
            <ThemedText type="defaultSemiBold">{item.displayName}</ThemedText>
            <ThemedText type="default" style={styles.itemSubtitle}>
              Tip: {item.type}
            </ThemedText>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(status) },
            ]}
          >
            <ThemedText style={styles.statusText}>{getStatusLabel(status)}</ThemedText>
          </View>
        </View>

        <View style={styles.itemStats}>
          <View style={styles.statItem}>
            <ThemedText type="default" style={styles.statLabel}>
              Sati
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.statValue}>
              {item.currentHours}h
            </ThemedText>
          </View>
          <View style={styles.statItem}>
            <ThemedText type="default" style={styles.statLabel}>
              Do Servisa
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
          <View style={styles.statItem}>
            <ThemedText type="default" style={styles.statLabel}>
              Interval
            </ThemedText>
            <ThemedText type="defaultSemiBold" style={styles.statValue}>
              {item.serviceIntervalHours}h
            </ThemedText>
          </View>
        </View>
      </Pressable>
    );
  };

  const renderDetailView = () => {
    if (!selectedEquipment) return null;

    const status = getEquipmentStatus(selectedEquipment);
    const hoursSinceLastService =
      selectedEquipment.currentHours - selectedEquipment.lastServiceHours;
    const hoursUntilService =
      selectedEquipment.serviceIntervalHours - hoursSinceLastService;

    const serviceHistory = appState.serviceRecords.filter(
      (record) => record.equipmentId === selectedEquipment.id,
    );

    const fuelHistory = appState.fuelLogs.filter(
      (log) => log.equipmentId === selectedEquipment.id,
    );

    return (
      <ImageBackground
        source={require("@/assets/images/background.jpg")}
        style={styles.detailContainer}
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

        <View style={[styles.detailContent, { paddingTop: insets.top }]}>
          <Pressable
            style={styles.closeButton}
            onPress={() => setSelectedEquipment(null)}
          >
            <ThemedText style={styles.closeButtonText}>✕</ThemedText>
          </Pressable>

          <View style={styles.detailHeader}>
            <ThemedText type="title">{selectedEquipment.displayName}</ThemedText>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(status) },
              ]}
            >
              <ThemedText style={styles.statusText}>
                {getStatusLabel(status)}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailStats}>
            <View style={styles.detailStatItem}>
              <ThemedText type="default" style={styles.detailStatLabel}>
                Trenutni Sati
              </ThemedText>
              <ThemedText type="title" style={styles.detailStatValue}>
                {selectedEquipment.currentHours}h
              </ThemedText>
            </View>

            <View style={styles.detailStatItem}>
              <ThemedText type="default" style={styles.detailStatLabel}>
                Sati do Servisa
              </ThemedText>
              <ThemedText
                type="title"
                style={[
                  styles.detailStatValue,
                  hoursUntilService <= 0 && { color: dangerColor },
                ]}
              >
                {Math.max(0, hoursUntilService)}h
              </ThemedText>
            </View>

            <View style={styles.detailStatItem}>
              <ThemedText type="default" style={styles.detailStatLabel}>
                Zadnji Servis
              </ThemedText>
              <ThemedText type="default" style={styles.detailStatValue}>
                {selectedEquipment.lastServiceDate}
              </ThemedText>
            </View>
          </View>

          <View style={styles.detailSection}>
            <ThemedText type="subtitle">Istorija Servisa</ThemedText>
            {serviceHistory.length > 0 ? (
              <FlatList
                data={serviceHistory}
                renderItem={({ item }) => (
                  <View style={styles.historyItem}>
                    <View>
                      <ThemedText type="defaultSemiBold">
                        {item.serviceType}
                      </ThemedText>
                      <ThemedText type="default" style={styles.historyDate}>
                        {item.date}
                      </ThemedText>
                    </View>
                    <ThemedText type="defaultSemiBold" style={styles.historyCost}>
                      €{item.cost}
                    </ThemedText>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <ThemedText type="default" style={styles.emptyText}>
                Nema servisa
              </ThemedText>
            )}
          </View>

          {fuelHistory.length > 0 && (
            <View style={styles.detailSection}>
              <ThemedText type="subtitle">Istorija Goriva</ThemedText>
              <FlatList
                data={fuelHistory}
                renderItem={({ item }) => (
                  <View style={styles.historyItem}>
                    <View>
                      <ThemedText type="defaultSemiBold">
                        {item.litersAdded}L
                      </ThemedText>
                      <ThemedText type="default" style={styles.historyDate}>
                        {item.date}
                      </ThemedText>
                    </View>
                    <ThemedText type="defaultSemiBold" style={styles.historyCost}>
                      €{item.totalCost}
                    </ThemedText>
                  </View>
                )}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </View>
          )}
        </View>
      </ImageBackground>
    );
  };

  if (selectedEquipment) {
    return renderDetailView();
  }

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
              ? "rgba(0, 0, 0, 0.6)"
              : "rgba(255, 255, 255, 0.85)",
          },
        ]}
      />

      <View style={[styles.content, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Oprema
          </ThemedText>
        </View>
        <FlatList
          data={appState.equipment}
          renderItem={renderEquipmentItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
        />
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
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  equipmentItem: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemSubtitle: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
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
  itemStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  statValue: {
    color: "#FF9500",
  },
  statValueError: {
    color: "#FF3B30",
  },
  detailContainer: {
    flex: 1,
  },
  detailContent: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
    zIndex: 1,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
    marginBottom: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF9500",
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  detailStats: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 24,
  },
  detailStatItem: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 149, 0, 0.15)",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  detailStatLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  detailStatValue: {
    fontSize: 18,
    color: "#FF9500",
  },
  detailSection: {
    marginBottom: 24,
  },
  historyItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  historyDate: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  historyCost: {
    color: "#FF9500",
  },
  emptyText: {
    textAlign: "center",
    marginVertical: 16,
    opacity: 0.7,
  },
});
