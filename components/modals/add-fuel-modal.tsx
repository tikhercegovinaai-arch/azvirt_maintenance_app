import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppData } from "@/hooks/use-app-data";
import { useThemeColor } from "@/hooks/use-theme-color";

interface AddFuelModalProps {
  isOpen: boolean;
  equipmentId?: string;
  onClose: () => void;
}

export function AddFuelModal({ isOpen, equipmentId, onClose }: AddFuelModalProps) {
  const insets = useSafeAreaInsets();
  const { appState, addFuelLog, removeFuelFromStock } = useAppData();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(equipmentId || "");
  const [litersAdded, setLitersAdded] = useState("");
  const [costPerLiter, setCostPerLiter] = useState("");
  const [hoursAtFueling, setHoursAtFueling] = useState("");
  const [notes, setNotes] = useState("");
  const today = new Date().toISOString().split("T")[0];
  const now = new Date().toTimeString().slice(0, 5);
  const [fuelDate, setFuelDate] = useState(today);
  const [fuelTime, setFuelTime] = useState(now);
  const [loading, setLoading] = useState(false);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const selectedEquipment = appState.equipment.find((e) => e.id === selectedEquipmentId);
  const totalCost = litersAdded && costPerLiter 
    ? (parseFloat(litersAdded) * parseFloat(costPerLiter)).toFixed(2)
    : "0.00";

  const handleSave = async () => {
    if (!selectedEquipmentId) {
      Alert.alert("Greška", "Molimo odaberite opremu");
      return;
    }

    if (!litersAdded || isNaN(parseFloat(litersAdded))) {
      Alert.alert("Greška", "Molimo unesite valjanu količinu litara");
      return;
    }

    if (!costPerLiter || isNaN(parseFloat(costPerLiter))) {
      Alert.alert("Greška", "Molimo unesite valjanu cijenu po litri");
      return;
    }

    if (!hoursAtFueling || isNaN(parseFloat(hoursAtFueling))) {
      Alert.alert("Greška", "Molimo unesite valjane sate");
      return;
    }

    const litersToAdd = parseFloat(litersAdded);

    // Check if site has enough fuel
    if (appState.fuelStock && appState.fuelStock.currentLiters < litersToAdd) {
      Alert.alert(
        "Greška",
        `Nedovoljno goriva na lokaciji. Dostupno: ${appState.fuelStock.currentLiters.toFixed(1)}L`,
      );
      return;
    }

    // Check if equipment tank has enough capacity
    if (selectedEquipment && selectedEquipment.fuelCapacity) {
      const newFuelLevel = (selectedEquipment.fuelLevel || 0) + litersToAdd;
      if (newFuelLevel > selectedEquipment.fuelCapacity) {
        Alert.alert(
          "Greška",
          `Kapacitet rezervoara premašen. Kapacitet: ${selectedEquipment.fuelCapacity}L, Trenutno: ${selectedEquipment.fuelLevel || 0}L`,
        );
        return;
      }
    }

    try {
      setLoading(true);
      const newFuelLog: any = {
        id: `fuel-${Date.now()}`,
        equipmentId: selectedEquipmentId,
        date: fuelDate,
        time: fuelTime,
        litersAdded: litersToAdd,
        costPerLiter: parseFloat(costPerLiter),
        totalCost: parseFloat(totalCost),
        hoursAtFueling: parseFloat(hoursAtFueling),
        notes,
      };
      await addFuelLog(newFuelLog);

      // Deduct from site fuel stock
      if (appState.fuelStock) {
        await removeFuelFromStock(
          litersToAdd,
          `Dodano u ${selectedEquipment?.displayName}: ${litersToAdd}L`,
        );
      }

      const siteFuelRemaining = appState.fuelStock
        ? (appState.fuelStock.currentLiters - litersToAdd).toFixed(1)
        : "N/A";

      Alert.alert(
        "Uspjeh",
        `Gorivo uspješno dodano u ${selectedEquipment?.displayName}\n\nDodano: ${litersToAdd}L\nPreostalo na lokaciji: ${siteFuelRemaining}L`,
        [
        {
          text: "OK",
          onPress: () => {
            setLitersAdded("");
            setCostPerLiter("");
            setHoursAtFueling("");
            setNotes("");
            setFuelDate(today);
            setFuelTime(now);
            setSelectedEquipmentId(equipmentId || "");
            onClose();
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Greška", "Greška pri spremanju goriva");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <ThemedView
          style={[
            styles.container,
            {
              paddingTop: Math.max(insets.top, 20),
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Dodaj Gorivo
            </ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </Pressable>
          </View>

          <View style={styles.content}>
            {/* Fuel Storage Status */}
            <View style={styles.fuelStatusCard}>
              <ThemedText type="defaultSemiBold" style={styles.fuelStatusTitle}>
                Zaliha Goriva na Lokaciji
              </ThemedText>
              <View style={styles.fuelStatusContent}>
                <View style={styles.fuelStatusItem}>
                  <ThemedText style={styles.fuelStatusLabel}>Trenutno:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.fuelStatusValue}>
                    {appState.fuelStock?.currentLiters || 0}L
                  </ThemedText>
                </View>
                <View style={styles.fuelStatusItem}>
                  <ThemedText style={styles.fuelStatusLabel}>Kapacitet:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.fuelStatusValue}>
                    {appState.fuelStock?.capacity || 0}L
                  </ThemedText>
                </View>
                <View style={styles.fuelStatusItem}>
                  <ThemedText style={styles.fuelStatusLabel}>Minimum:</ThemedText>
                  <ThemedText type="defaultSemiBold" style={styles.fuelStatusValue}>
                    {appState.fuelStock?.minimumLevel || 0}L
                  </ThemedText>
                </View>
              </View>
              <View style={styles.fuelBarContainer}>
                <View
                  style={[
                    styles.fuelBar,
                    {
                      width: `${((appState.fuelStock?.currentLiters || 0) / (appState.fuelStock?.capacity || 1)) * 100}%`,
                      backgroundColor:
                        (appState.fuelStock?.currentLiters || 0) > (appState.fuelStock?.capacity || 1) * 0.5
                          ? "#34C759"
                          : (appState.fuelStock?.currentLiters || 0) > (appState.fuelStock?.minimumLevel || 0)
                            ? "#FF9500"
                            : "#FF3B30",
                    },
                  ]}
                />
              </View>
            </View>

            {/* Equipment Selector */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Oprema
              </ThemedText>
              <View style={styles.selectorContainer}>
                {appState.equipment.map((equipment) => (
                  <Pressable
                    key={equipment.id}
                    style={[
                      styles.selectorButton,
                      selectedEquipmentId === equipment.id &&
                        styles.selectorButtonActive,
                    ]}
                    onPress={() => setSelectedEquipmentId(equipment.id)}
                  >
                    <ThemedText
                      style={[
                        styles.selectorButtonText,
                        selectedEquipmentId === equipment.id &&
                          styles.selectorButtonTextActive,
                      ]}
                    >
                      {equipment.displayName}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Date and Time Inputs */}
            <View style={styles.dateTimeRow}>
              <View style={[styles.field, { flex: 1 }]}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  Datum
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor="#999"
                  value={fuelDate}
                  onChangeText={setFuelDate}
                  editable={!loading}
                />
              </View>
              <View style={[styles.field, { flex: 1, marginLeft: 8 }]}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  Vrijeme
                </ThemedText>
                <TextInput
                  style={[styles.input, { color: textColor }]}
                  placeholder="HH:mm"
                  placeholderTextColor="#999"
                  value={fuelTime}
                  onChangeText={setFuelTime}
                  editable={!loading}
                />
              </View>
            </View>

            {/* Liters Input */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Količina Goriva (L)
              </ThemedText>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Unesite litre"
                placeholderTextColor="#999"
                value={litersAdded}
                onChangeText={setLitersAdded}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            {/* Cost Per Liter Input */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Cijena po Litri (€)
              </ThemedText>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Unesite cijenu"
                placeholderTextColor="#999"
                value={costPerLiter}
                onChangeText={setCostPerLiter}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            {/* Total Cost Display */}
            <View style={styles.totalBox}>
              <ThemedText type="default" style={styles.totalLabel}>
                Ukupna Cijena:
              </ThemedText>
              <ThemedText type="defaultSemiBold" style={styles.totalValue}>
                €{totalCost}
              </ThemedText>
            </View>

            {/* Hours Input */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Sati na Dopuni
              </ThemedText>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Unesite sate"
                placeholderTextColor="#999"
                value={hoursAtFueling}
                onChangeText={setHoursAtFueling}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            {/* Notes Input */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Napomene (opciono)
              </ThemedText>
              <TextInput
                style={[styles.input, styles.textArea, { color: textColor }]}
                placeholder="Dodajte napomene..."
                placeholderTextColor="#999"
                value={notes}
                onChangeText={setNotes}
                multiline
                numberOfLines={3}
                editable={!loading}
              />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.footer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <ThemedText style={styles.cancelButtonText}>Otkaži</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.button, styles.saveButton, loading && styles.buttonDisabled]}
              onPress={handleSave}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.saveButtonText}>Spremi</ThemedText>
              )}
            </Pressable>
          </View>
        </ThemedView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    width: "90%",
    maxWidth: 400,
    borderRadius: 16,
    padding: 20,
    maxHeight: "90%",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#007AFF",
  },
  content: {
    gap: 16,
    marginBottom: 20,
  },
  field: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    marginBottom: 4,
  },
  selectorContainer: {
    gap: 8,
  },
  selectorButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#007AFF",
    backgroundColor: "transparent",
  },
  selectorButtonActive: {
    backgroundColor: "#007AFF",
  },
  selectorButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "500",
  },
  selectorButtonTextActive: {
    color: "#fff",
  },
  fuelStatusCard: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  fuelStatusTitle: {
    fontSize: 14,
    color: "#FF9500",
    marginBottom: 8,
  },
  fuelStatusContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  fuelStatusItem: {
    flex: 1,
    alignItems: "center",
  },
  fuelStatusLabel: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 4,
  },
  fuelStatusValue: {
    fontSize: 16,
    color: "#FF9500",
  },
  fuelBarContainer: {
    height: 8,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
    borderRadius: 4,
    overflow: "hidden",
  },
  fuelBar: {
    height: "100%",
    borderRadius: 4,
  },
  dateTimeRow: {
    flexDirection: "row",
    gap: 8,
  },
  totalBox: {
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: {
    fontSize: 14,
  },
  totalValue: {
    fontSize: 16,
    color: "#34C759",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    minHeight: 44,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: "top",
    paddingTop: 12,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#007AFF",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
