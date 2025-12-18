import { useState } from "react";
import { FlatList, Pressable, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppData } from "@/hooks/use-app-data";
import { SparePart } from "@/types";

export default function InventoryScreen() {
  const insets = useSafeAreaInsets();
  const { appState, getTotalInventoryValue } = useAppData();
  const [selectedPart, setSelectedPart] = useState<SparePart | null>(null);
  const successColor = "#34C759";
  const warningColor = "#FF9500";
  const dangerColor = "#FF3B30";

  const getStockStatus = (part: SparePart) => {
    if (part.currentStock <= part.minimumLevel) return "critical";
    if (part.currentStock < part.minimumLevel * 1.5) return "low";
    return "adequate";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "adequate":
        return successColor;
      case "low":
        return warningColor;
      case "critical":
        return dangerColor;
      default:
        return "#8E8E93";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "adequate":
        return "Dobro";
      case "low":
        return "Nisko";
      case "critical":
        return "Kritično";
      default:
        return "Nepoznato";
    }
  };

  const renderPartItem = ({ item }: { item: SparePart }) => {
    const status = getStockStatus(item);

    return (
      <Pressable
        style={styles.partItem}
        onPress={() => setSelectedPart(item)}
      >
        <View style={styles.partInfo}>
          <ThemedText type="defaultSemiBold">{item.name}</ThemedText>
          <ThemedText type="default" style={styles.partSubtitle}>
            {item.partNumber}
          </ThemedText>
          <View style={styles.partDetails}>
            <ThemedText type="default" style={styles.partDetail}>
              Dostupno: {item.currentStock}
            </ThemedText>
            <ThemedText type="default" style={styles.partDetail}>
              Min: {item.minimumLevel}
            </ThemedText>
            <ThemedText type="default" style={styles.partDetail}>
              €{item.price}
            </ThemedText>
          </View>
        </View>
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
      </Pressable>
    );
  };

  const renderDetailView = () => {
    if (!selectedPart) return null;

    const status = getStockStatus(selectedPart);

    return (
      <ThemedView style={[styles.detailContainer, { paddingTop: insets.top }]}>
        <Pressable
          style={styles.closeButton}
          onPress={() => setSelectedPart(null)}
        >
          <ThemedText style={styles.closeButtonText}>✕</ThemedText>
        </Pressable>

        <View style={styles.detailHeader}>
          <ThemedText type="title">{selectedPart.name}</ThemedText>
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

        <View style={styles.detailInfo}>
          <View style={styles.infoRow}>
            <ThemedText type="default" style={styles.infoLabel}>
              Kataloški Broj:
            </ThemedText>
            <ThemedText type="defaultSemiBold">
              {selectedPart.partNumber}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText type="default" style={styles.infoLabel}>
              Oprema:
            </ThemedText>
            <ThemedText type="defaultSemiBold">
              {selectedPart.equipment === "all"
                ? "Sve"
                : selectedPart.equipment === "mixer"
                  ? "Mješalica"
                  : selectedPart.equipment === "loader"
                    ? "Utovarivač"
                    : "Generator"}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText type="default" style={styles.infoLabel}>
              Trenutna Zaliha:
            </ThemedText>
            <ThemedText
              type="defaultSemiBold"
              style={{
                color:
                  selectedPart.currentStock <= selectedPart.minimumLevel
                    ? dangerColor
                    : "#007AFF",
              }}
            >
              {selectedPart.currentStock}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText type="default" style={styles.infoLabel}>
              Minimalna Razina:
            </ThemedText>
            <ThemedText type="defaultSemiBold">
              {selectedPart.minimumLevel}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText type="default" style={styles.infoLabel}>
              Cijena po Komadu:
            </ThemedText>
            <ThemedText type="defaultSemiBold">€{selectedPart.price}</ThemedText>
          </View>

          <View style={styles.infoRow}>
            <ThemedText type="default" style={styles.infoLabel}>
              Ukupna Vrijednost:
            </ThemedText>
            <ThemedText type="defaultSemiBold">
              €{(selectedPart.currentStock * selectedPart.price).toFixed(2)}
            </ThemedText>
          </View>

          {selectedPart.supplier && (
            <View style={styles.infoRow}>
              <ThemedText type="default" style={styles.infoLabel}>
                Dobavljač:
              </ThemedText>
              <ThemedText type="defaultSemiBold">
                {selectedPart.supplier}
              </ThemedText>
            </View>
          )}

          {selectedPart.notes && (
            <View style={styles.infoRow}>
              <ThemedText type="default" style={styles.infoLabel}>
                Napomene:
              </ThemedText>
              <ThemedText type="default">{selectedPart.notes}</ThemedText>
            </View>
          )}
        </View>
      </ThemedView>
    );
  };

  if (selectedPart) {
    return renderDetailView();
  }

  const totalValue = getTotalInventoryValue();
  const criticalParts = appState.spareParts.filter(
    (p) => getStockStatus(p) === "critical",
  );
  const lowParts = appState.spareParts.filter(
    (p) => getStockStatus(p) === "low",
  );

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <ThemedText type="title">Inventar</ThemedText>
      </View>

      <View style={styles.summaryCard}>
        <View style={styles.summaryItem}>
          <ThemedText type="default" style={styles.summaryLabel}>
            Ukupna Vrijednost
          </ThemedText>
          <ThemedText type="title" style={styles.summaryValue}>
            €{totalValue.toFixed(2)}
          </ThemedText>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <ThemedText type="default" style={styles.summaryLabel}>
            Dijelovi
          </ThemedText>
          <ThemedText type="title" style={styles.summaryValue}>
            {appState.spareParts.length}
          </ThemedText>
        </View>

        <View style={styles.summaryDivider} />

        <View style={styles.summaryItem}>
          <ThemedText type="default" style={styles.summaryLabel}>
            Kritični
          </ThemedText>
          <ThemedText
            type="title"
            style={[styles.summaryValue, { color: dangerColor }]}
          >
            {criticalParts.length}
          </ThemedText>
        </View>
      </View>

      {(criticalParts.length > 0 || lowParts.length > 0) && (
        <View style={styles.alertsContainer}>
          {criticalParts.length > 0 && (
            <View style={[styles.alertBanner, { backgroundColor: dangerColor }]}>
              <ThemedText style={styles.alertText}>
                ⚠️ {criticalParts.length} dijelova na kritičnoj razini
              </ThemedText>
            </View>
          )}
          {lowParts.length > 0 && (
            <View style={[styles.alertBanner, { backgroundColor: warningColor }]}>
              <ThemedText style={styles.alertText}>
                ⚠️ {lowParts.length} dijelova na niskoj razini
              </ThemedText>
            </View>
          )}
        </View>
      )}

      <FlatList
        data={appState.spareParts}
        renderItem={renderPartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
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
  summaryCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: "rgba(0, 122, 255, 0.1)",
  },
  summaryItem: {
    flex: 1,
    alignItems: "center",
  },
  summaryDivider: {
    width: 1,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
    opacity: 0.7,
  },
  summaryValue: {
    fontSize: 18,
  },
  alertsContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
    gap: 8,
  },
  alertBanner: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  alertText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  partItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
    borderRadius: 8,
    backgroundColor: "rgba(0, 0, 0, 0.02)",
  },
  partInfo: {
    flex: 1,
  },
  partSubtitle: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.7,
  },
  partDetails: {
    flexDirection: "row",
    marginTop: 6,
    gap: 12,
  },
  partDetail: {
    fontSize: 11,
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
  detailContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 8,
    marginBottom: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  detailHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  detailInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0, 0, 0, 0.1)",
  },
  infoLabel: {
    fontSize: 14,
    opacity: 0.7,
  },
});
