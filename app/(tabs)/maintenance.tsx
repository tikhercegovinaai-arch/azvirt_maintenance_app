import { useState } from "react";
import {
  FlatList,
  ImageBackground,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { SearchBar } from "@/components/search-bar";
import { useAppData } from "@/hooks/use-app-data";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function MaintenanceScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { appState, markLubricationComplete, markAllWeeklyLubricationComplete } =
    useAppData();
  const isDark = colorScheme === "dark";

  const [activeTab, setActiveTab] = useState<"lubrication" | "services">(
    "lubrication"
  );
  const [searchQuery, setSearchQuery] = useState("");

  const lubricationPoints = appState.lubricationPoints;
  const weeklyPoints = lubricationPoints.filter((p) => p.frequency === "weekly");
  const weeklyDueCount = weeklyPoints.filter((p) => p.status !== "good").length;

  const filteredServices = appState.serviceRecords.filter((record) =>
    record.serviceType.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCompleteWeekly = () => {
    Alert.alert(
      "Potvrdi",
      `Označiti ${weeklyPoints.length} tjednih točaka kao završene?`,
      [
        { text: "Otkaži", onPress: () => {}, style: "cancel" },
        {
          text: "Potvrdi",
          onPress: () => {
            markAllWeeklyLubricationComplete();
            Alert.alert("Uspjeh", `${weeklyPoints.length} točaka označeno kao završeno`);
          },
        },
      ]
    );
  };

  const renderLubricationItem = ({ item }: { item: any }) => {
    const statusColor =
      item.status === "good"
        ? "#34C759"
        : item.status === "due"
          ? "#FF9500"
          : "#FF3B30";

    return (
      <Pressable
        style={[
          styles.lubricationItem,
          {
            backgroundColor: isDark
              ? "rgba(30, 30, 30, 0.85)"
              : "rgba(255, 255, 255, 0.85)",
          },
        ]}
        onPress={() => markLubricationComplete(item.id)}
      >
        <View style={styles.lubricationContent}>
          <View style={styles.lubricationInfo}>
            <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
            <ThemedText type="default" style={styles.lubricationMeta}>
              {item.type} • {item.frequency}
            </ThemedText>
          </View>
          <View
            style={[
              styles.lubricationStatus,
              { backgroundColor: statusColor },
            ]}
          />
        </View>
        {item.lastCompleted && (
          <ThemedText type="default" style={styles.lubricationDate}>
            Zadnje: {item.lastCompleted}
          </ThemedText>
        )}
      </Pressable>
    );
  };

  const renderServiceItem = ({ item }: { item: any }) => (
    <View
      style={[
        styles.serviceItem,
        {
          backgroundColor: isDark
            ? "rgba(30, 30, 30, 0.85)"
            : "rgba(255, 255, 255, 0.85)",
        },
      ]}
    >
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
              ? "rgba(0, 0, 0, 0.75)"
              : "rgba(255, 255, 255, 0.85)",
          },
        ]}
      />

      <View style={[styles.content, { paddingTop: Math.max(insets.top, 16) }]}>
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Održavanje
          </ThemedText>
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
              Mazanje
            </ThemedText>
          </Pressable>

          <Pressable
            style={[styles.tab, activeTab === "services" && styles.activeTab]}
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

        {activeTab === "lubrication" && (
          <>
            {weeklyDueCount > 0 && (
              <Pressable
                style={[
                  styles.completeWeeklyButton,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 149, 0, 0.2)"
                      : "rgba(255, 149, 0, 0.15)",
                  },
                ]}
                onPress={handleCompleteWeekly}
              >
                <ThemedText type="defaultSemiBold" style={styles.completeWeeklyText}>
                  Završi Sve Tjedne ({weeklyDueCount})
                </ThemedText>
              </Pressable>
            )}

            <FlatList
              data={lubricationPoints}
              renderItem={renderLubricationItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              scrollEnabled={false}
            />
          </>
        )}

        {activeTab === "services" && (
          <>
            <View style={styles.searchContainer}>
            <SearchBar
              placeholder="Pretraži servise..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onClear={() => setSearchQuery("")}
            />
            </View>

            <FlatList
              data={filteredServices}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              scrollEnabled={false}
              ListEmptyComponent={
                <View style={styles.emptyContainer}>
                  <ThemedText type="default">Nema servisa</ThemedText>
                </View>
              }
            />
          </>
        )}
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
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: "bold",
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
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  activeTab: {
    backgroundColor: "#FF9500",
  },
  tabText: {
    fontSize: 14,
    color: "#999999",
  },
  activeTabText: {
    color: "#fff",
  },
  completeWeeklyButton: {
    marginHorizontal: 16,
    marginBottom: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  completeWeeklyText: {
    color: "#FF9500",
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingBottom: 12,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  lubricationItem: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  lubricationContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  lubricationInfo: {
    flex: 1,
  },
  lubricationMeta: {
    fontSize: 12,
    opacity: 0.7,
    marginTop: 4,
  },
  lubricationStatus: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: 12,
  },
  lubricationDate: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 8,
  },
  serviceItem: {
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
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
  emptyContainer: {
    paddingVertical: 40,
    alignItems: "center",
  },
});
