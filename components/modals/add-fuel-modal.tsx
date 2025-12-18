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
  const { appState, addFuelLog } = useAppData();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(equipmentId || "");
  const [litersAdded, setLitersAdded] = useState("");
  const [costPerLiter, setCostPerLiter] = useState("");
  const [hoursAtFueling, setHoursAtFueling] = useState("");
  const [notes, setNotes] = useState("");
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

    try {
      setLoading(true);
      const newFuelLog: any = {
        id: `fuel-${Date.now()}`,
        equipmentId: selectedEquipmentId,
        date: new Date().toISOString().split("T")[0],
        litersAdded: parseFloat(litersAdded),
        costPerLiter: parseFloat(costPerLiter),
        totalCost: parseFloat(totalCost),
        hoursAtFueling: parseFloat(hoursAtFueling),
        notes,
      };
      await addFuelLog(newFuelLog);

      Alert.alert("Uspjeh", "Gorivo je uspješno zabilježeno", [
        {
          text: "OK",
          onPress: () => {
            setLitersAdded("");
            setCostPerLiter("");
            setHoursAtFueling("");
            setNotes("");
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
