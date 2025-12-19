import { useState } from "react";
import { FlatList, ImageBackground, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { EquipmentDetailModal } from "@/components/modals/equipment-detail-modal";
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

      <EquipmentDetailModal
        visible={selectedEquipment !== null}
        equipment={selectedEquipment}
        serviceRecords={appState.serviceRecords}
        fuelLogs={appState.fuelLogs}
        onClose={() => setSelectedEquipment(null)}
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
  },
  itemHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemSubtitle: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginLeft: 12,
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  itemStats: {
    flexDirection: "row",
    gap: 12,
  },
  statItem: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.7,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 16,
    color: "#FF9500",
    fontWeight: "600",
  },
  statValueError: {
    color: "#FF3B30",
  },
});
