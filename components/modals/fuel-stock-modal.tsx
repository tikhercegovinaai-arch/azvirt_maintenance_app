import { useEffect, useState } from "react";
import {
  Modal,
  View,
  StyleSheet,
  Pressable,
  TextInput,
  ScrollView,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FuelStock } from "@/types";

interface FuelStockModalProps {
  isOpen: boolean;
  onClose: () => void;
  fuelStock: FuelStock | undefined;
  onAddFuel: (liters: number, notes: string) => Promise<void>;
  onRemoveFuel: (liters: number, notes: string) => Promise<void>;
}

export function FuelStockModal({
  isOpen,
  onClose,
  fuelStock,
  onAddFuel,
  onRemoveFuel,
}: FuelStockModalProps) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [liters, setLiters] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleAddFuel = async () => {
    if (!liters || isNaN(parseFloat(liters))) {
      Alert.alert("Greška", "Molimo unesite valjanu količinu goriva");
      return;
    }

    try {
      setIsLoading(true);
      await onAddFuel(parseFloat(liters), notes);
      Alert.alert("Uspješno!", "Gorivo je dodano u zalihu");
      setLiters("");
      setNotes("");
      onClose();
    } catch (error) {
      Alert.alert("Greška", "Nije moguće dodati gorivo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveFuel = async () => {
    if (!liters || isNaN(parseFloat(liters))) {
      Alert.alert("Greška", "Molimo unesite valjanu količinu goriva");
      return;
    }

    try {
      setIsLoading(true);
      await onRemoveFuel(parseFloat(liters), notes);
      Alert.alert("Uspješno!", "Gorivo je uklonjeno iz zalihe");
      setLiters("");
      setNotes("");
      onClose();
    } catch (error) {
      Alert.alert("Greška", "Nije moguće ukloniti gorivo");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      visible={isOpen}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.overlay,
          {
            backgroundColor: isDark ? "rgba(0, 0, 0, 0.5)" : "rgba(0, 0, 0, 0.3)",
          },
        ]}
      >
        <View
          style={[
            styles.container,
            {
              paddingTop: Math.max(insets.top, 20),
              paddingBottom: Math.max(insets.bottom, 20),
            },
          ]}
        >
          <View style={styles.header}>
            <ThemedText type="title">Upravljanje Gorivom</ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <ThemedText type="defaultSemiBold" style={styles.closeText}>
                ✕
              </ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Current Stock Info */}
            {fuelStock && (
              <View style={styles.infoCard}>
                <ThemedText type="subtitle" style={styles.infoTitle}>
                  Trenutna Zaliha
                </ThemedText>
                <ThemedText type="title" style={styles.fuelAmount}>
                  {fuelStock.currentLiters.toFixed(1)} L
                </ThemedText>
                <ThemedText type="default" style={styles.infoText}>
                  Minimalna razina: {fuelStock.minimumLevel} L
                </ThemedText>
                {fuelStock.currentLiters < fuelStock.minimumLevel && (
                  <ThemedText
                    type="default"
                    style={[styles.infoText, styles.warningText]}
                  >
                    ⚠️ Zaliha je ispod minimalne razine
                  </ThemedText>
                )}
              </View>
            )}

            {/* Add Fuel Section */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                ➕ Dodaj Gorivo
              </ThemedText>

              <View style={styles.inputGroup}>
                <ThemedText type="default" style={styles.label}>
                  Količina (litri)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: isDark ? "#fff" : "#000",
                      borderColor: "#FF9500",
                    },
                  ]}
                  placeholder="0.0"
                  placeholderTextColor={isDark ? "#999" : "#ccc"}
                  keyboardType="decimal-pad"
                  value={liters}
                  onChangeText={setLiters}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="default" style={styles.label}>
                  Napomena (opcionalno)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    styles.multilineInput,
                    {
                      color: isDark ? "#fff" : "#000",
                      borderColor: "#FF9500",
                    },
                  ]}
                  placeholder="Npr. Dostava od dobavljača..."
                  placeholderTextColor={isDark ? "#999" : "#ccc"}
                  multiline
                  numberOfLines={3}
                  value={notes}
                  onChangeText={setNotes}
                  editable={!isLoading}
                />
              </View>

              <Pressable
                style={[styles.button, styles.addButton, isLoading && styles.buttonDisabled]}
                onPress={handleAddFuel}
                disabled={isLoading}
              >
                <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                  {isLoading ? "Učitavanje..." : "Dodaj Gorivo"}
                </ThemedText>
              </Pressable>
            </View>

            {/* Remove Fuel Section */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                ➖ Ukloni Gorivo
              </ThemedText>

              <View style={styles.inputGroup}>
                <ThemedText type="default" style={styles.label}>
                  Količina (litri)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: isDark ? "#fff" : "#000",
                      borderColor: "#FF3B30",
                    },
                  ]}
                  placeholder="0.0"
                  placeholderTextColor={isDark ? "#999" : "#ccc"}
                  keyboardType="decimal-pad"
                  value={liters}
                  onChangeText={setLiters}
                  editable={!isLoading}
                />
              </View>

              <View style={styles.inputGroup}>
                <ThemedText type="default" style={styles.label}>
                  Napomena (opcionalno)
                </ThemedText>
                <TextInput
                  style={[
                    styles.input,
                    styles.multilineInput,
                    {
                      color: isDark ? "#fff" : "#000",
                      borderColor: "#FF3B30",
                    },
                  ]}
                  placeholder="Npr. Korišteno za Utovarivač..."
                  placeholderTextColor={isDark ? "#999" : "#ccc"}
                  multiline
                  numberOfLines={3}
                  value={notes}
                  onChangeText={setNotes}
                  editable={!isLoading}
                />
              </View>

              <Pressable
                style={[styles.button, styles.removeButton, isLoading && styles.buttonDisabled]}
                onPress={handleRemoveFuel}
                disabled={isLoading}
              >
                <ThemedText type="defaultSemiBold" style={styles.removeButtonText}>
                  {isLoading ? "Učitavanje..." : "Ukloni Gorivo"}
                </ThemedText>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    maxHeight: "90%",
    backgroundColor: "rgba(15, 15, 15, 0.95)",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 149, 0, 0.2)",
  },
  closeButton: {
    padding: 8,
  },
  closeText: {
    fontSize: 24,
    color: "#FF9500",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  infoCard: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderLeftWidth: 4,
    borderLeftColor: "#FF9500",
  },
  infoTitle: {
    color: "#FF9500",
    marginBottom: 8,
  },
  fuelAmount: {
    color: "#FF9500",
    fontSize: 32,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    opacity: 0.7,
  },
  warningText: {
    color: "#FF9500",
    marginTop: 8,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#FF9500",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 13,
    opacity: 0.7,
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
  },
  multilineInput: {
    textAlignVertical: "top",
    paddingVertical: 10,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  addButton: {
    backgroundColor: "#34C759",
  },
  removeButton: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  removeButtonText: {
    color: "#FF3B30",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
