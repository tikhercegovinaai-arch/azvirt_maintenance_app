import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { PhotoPicker } from "@/components/photo-picker";
import { useAppData } from "@/hooks/use-app-data";
import { useThemeColor } from "@/hooks/use-theme-color";

interface RecordServiceModalProps {
  isOpen: boolean;
  equipmentId?: string;
  onClose: () => void;
}

const SERVICE_TYPES = [
  "Redovni Servis",
  "Zamjena Ulja",
  "Zamjena Filtera",
  "Popravka",
  "Inspekcija",
  "Čišćenje",
];

export function RecordServiceModal({ isOpen, equipmentId, onClose }: RecordServiceModalProps) {
  const insets = useSafeAreaInsets();
  const { appState, addServiceRecord } = useAppData();
  const [selectedEquipmentId, setSelectedEquipmentId] = useState(equipmentId || "");
  const [serviceType, setServiceType] = useState("");
  const [hoursAtService, setHoursAtService] = useState("");
  const [cost, setCost] = useState("");
  const [technician, setTechnician] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedParts, setSelectedParts] = useState<string[]>([]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const backgroundColor = useThemeColor({}, "background");
  const textColor = useThemeColor({}, "text");

  const selectedEquipment = appState.equipment.find((e) => e.id === selectedEquipmentId);

  const handlePartToggle = (partId: string) => {
    setSelectedParts((prev) =>
      prev.includes(partId) ? prev.filter((p) => p !== partId) : [...prev, partId]
    );
  };

  const handleSave = async () => {
    if (!selectedEquipmentId) {
      Alert.alert("Greška", "Molimo odaberite opremu");
      return;
    }

    if (!serviceType) {
      Alert.alert("Greška", "Molimo odaberite tip servisa");
      return;
    }

    if (!hoursAtService || isNaN(parseFloat(hoursAtService))) {
      Alert.alert("Greška", "Molimo unesite valjane sate");
      return;
    }

    if (!cost || isNaN(parseFloat(cost))) {
      Alert.alert("Greška", "Molimo unesite valjanu cijenu");
      return;
    }

    try {
      setLoading(true);
      const newRecord: any = {
        id: `service-${Date.now()}`,
        equipmentId: selectedEquipmentId,
        date: new Date().toISOString().split("T")[0],
        serviceType,
        hoursAtService: parseFloat(hoursAtService),
        cost: parseFloat(cost),
        technician,
        notes,
        partsUsed: selectedParts,
        photos: photos.length > 0 ? photos : undefined,
      };
      await addServiceRecord(newRecord);

      Alert.alert("Uspjeh", "Servis je uspješno zabilježen", [
        {
          text: "OK",
          onPress: () => {
            setServiceType("");
            setHoursAtService("");
            setCost("");
            setTechnician("");
            setNotes("");
            setSelectedParts([]);
            setPhotos([]);
            setSelectedEquipmentId(equipmentId || "");
            onClose();
          },
        },
      ]);
    } catch (error) {
      Alert.alert("Greška", "Greška pri spremanju servisa");
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
              Zabilježi Servis
            </ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
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

            {/* Service Type Selector */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Tip Servisa
              </ThemedText>
              <View style={styles.typeContainer}>
                {SERVICE_TYPES.map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.typeButton,
                      serviceType === type && styles.typeButtonActive,
                    ]}
                    onPress={() => setServiceType(type)}
                  >
                    <ThemedText
                      style={[
                        styles.typeButtonText,
                        serviceType === type && styles.typeButtonTextActive,
                      ]}
                    >
                      {type}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Hours Input */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Sati na Servisu
              </ThemedText>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Unesite sate"
                placeholderTextColor="#999"
                value={hoursAtService}
                onChangeText={setHoursAtService}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            {/* Cost Input */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Cijena (€)
              </ThemedText>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Unesite cijenu"
                placeholderTextColor="#999"
                value={cost}
                onChangeText={setCost}
                keyboardType="decimal-pad"
                editable={!loading}
              />
            </View>

            {/* Technician Input */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Tehničar
              </ThemedText>
              <TextInput
                style={[styles.input, { color: textColor }]}
                placeholder="Ime tehničara"
                placeholderTextColor="#999"
                value={technician}
                onChangeText={setTechnician}
                editable={!loading}
              />
            </View>

            {/* Parts Used */}
            {appState.spareParts.length > 0 && (
              <View style={styles.field}>
                <ThemedText type="defaultSemiBold" style={styles.label}>
                  Korišteni Dijelovi
                </ThemedText>
                <View style={styles.partsContainer}>
                  {appState.spareParts.map((part) => (
                    <Pressable
                      key={part.id}
                      style={[
                        styles.partButton,
                        selectedParts.includes(part.id) && styles.partButtonActive,
                      ]}
                      onPress={() => handlePartToggle(part.id)}
                    >
                      <ThemedText
                        style={[
                          styles.partButtonText,
                          selectedParts.includes(part.id) &&
                            styles.partButtonTextActive,
                        ]}
                      >
                        {selectedParts.includes(part.id) ? "✓ " : ""}
                        {part.name}
                      </ThemedText>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Notes Input */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Napomene
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

            {/* Photo Attachments */}
            <View style={styles.field}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Fotografije
              </ThemedText>
              <PhotoPicker photos={photos} onPhotosChange={setPhotos} maxPhotos={5} />
            </View>
          </ScrollView>

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
    marginBottom: 12,
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
  typeContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  typeButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FF9500",
    backgroundColor: "transparent",
  },
  typeButtonActive: {
    backgroundColor: "#FF9500",
  },
  typeButtonText: {
    color: "#FF9500",
    fontSize: 12,
    fontWeight: "500",
  },
  typeButtonTextActive: {
    color: "#fff",
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
  partsContainer: {
    gap: 8,
  },
  partButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#34C759",
    backgroundColor: "transparent",
  },
  partButtonActive: {
    backgroundColor: "#34C759",
  },
  partButtonText: {
    color: "#34C759",
    fontSize: 13,
    fontWeight: "500",
  },
  partButtonTextActive: {
    color: "#fff",
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
