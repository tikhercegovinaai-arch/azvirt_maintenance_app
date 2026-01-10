import { useState } from "react";
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from "react-native";

import { ThemedText } from "@/components/themed-text";
import { PhotoPicker } from "@/components/photo-picker";
import { useAppData } from "@/hooks/use-app-data";
import { useColorScheme } from "@/hooks/use-color-scheme";

interface AddHistoricalServiceModalProps {
  visible: boolean;
  onClose: () => void;
}

export function AddHistoricalServiceModal({
  visible,
  onClose,
}: AddHistoricalServiceModalProps) {
  const colorScheme = useColorScheme();
  const { appState, addServiceRecord } = useAppData();
  const isDark = colorScheme === "dark";

  const [selectedEquipment, setSelectedEquipment] = useState(
    appState.equipment[0]?.id || "",
  );
  const [serviceType, setServiceType] = useState("Oil Change");
  const [serviceDate, setServiceDate] = useState(
    new Date().toISOString().split("T")[0],
  );
  const [hoursAtService, setHoursAtService] = useState("");
  const [cost, setCost] = useState("");
  const [technician, setTechnician] = useState("");
  const [notes, setNotes] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);

  const serviceTypes = [
    "Oil Change",
    "Filter Replacement",
    "Belt Inspection",
    "Bearing Lubrication",
    "Hydraulic Service",
    "General Maintenance",
    "Repair",
    "Other",
  ];

  const handleSave = () => {
    if (!selectedEquipment || !serviceDate || !cost || !technician || !hoursAtService) {
      Alert.alert("Greška", "Molimo popunite sva obavezna polja");
      return;
    }

    const equipment = appState.equipment.find((e) => e.id === selectedEquipment);
    if (!equipment) {
      Alert.alert("Greška", "Oprema nije pronađena");
      return;
    }

    const hours = parseFloat(hoursAtService);
    if (isNaN(hours) || hours < 0) {
      Alert.alert("Greška", "Molimo unesite valjani broj sati");
      return;
    }

    const serviceRecord = {
      id: `service_${Date.now()}`,
      equipmentId: selectedEquipment,
      date: serviceDate,
      hoursAtService: hours,
      serviceType,
      partsUsed: [],
      cost: parseFloat(cost),
      technician,
      notes,
      photos: photos.length > 0 ? photos : undefined,
    };

    addServiceRecord(serviceRecord);

    Alert.alert("Uspjeh", `Servis je dodan za ${equipment.displayName}`);

    // Reset form
    setServiceType("Oil Change");
    setServiceDate(new Date().toISOString().split("T")[0]);
    setHoursAtService("");
    setCost("");
    setTechnician("");
    setNotes("");
    setPhotos([]);

    onClose();
  };

  const handleDateChange = (text: string) => {
    // Allow YYYY-MM-DD format
    if (text.length <= 10) {
      setServiceDate(text);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View
        style={[
          styles.container,
          {
            backgroundColor: isDark
              ? "rgba(0, 0, 0, 0.5)"
              : "rgba(0, 0, 0, 0.3)",
          },
        ]}
      >
        <View
          style={[
            styles.modalContent,
            {
              backgroundColor: isDark ? "#1a1a1a" : "#fff",
            },
          ]}
        >
          <View style={styles.header}>
            <ThemedText type="title" style={styles.title}>
              Dodaj Stari Servis
            </ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Equipment Selector */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Oprema *
              </ThemedText>
              <View style={styles.pickerContainer}>
                {appState.equipment.map((equipment) => (
                  <Pressable
                    key={equipment.id}
                    style={[
                      styles.pickerOption,
                      selectedEquipment === equipment.id &&
                        styles.pickerOptionSelected,
                      {
                        backgroundColor:
                          selectedEquipment === equipment.id
                            ? "#FF9500"
                            : isDark
                              ? "rgba(255, 149, 0, 0.1)"
                              : "rgba(255, 149, 0, 0.05)",
                      },
                    ]}
                    onPress={() => setSelectedEquipment(equipment.id)}
                  >
                    <ThemedText
                      style={[
                        styles.pickerOptionText,
                        selectedEquipment === equipment.id && {
                          color: "#fff",
                        },
                      ]}
                    >
                      {equipment.displayName}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Service Type Selector */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Tip Servisa *
              </ThemedText>
              <View style={styles.pickerContainer}>
                {serviceTypes.map((type) => (
                  <Pressable
                    key={type}
                    style={[
                      styles.pickerOption,
                      serviceType === type && styles.pickerOptionSelected,
                      {
                        backgroundColor:
                          serviceType === type
                            ? "#FF9500"
                            : isDark
                              ? "rgba(255, 149, 0, 0.1)"
                              : "rgba(255, 149, 0, 0.05)",
                      },
                    ]}
                    onPress={() => setServiceType(type)}
                  >
                    <ThemedText
                      style={[
                        styles.pickerOptionText,
                        serviceType === type && {
                          color: "#fff",
                        },
                      ]}
                    >
                      {type}
                    </ThemedText>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Service Date */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Datum Servisa (YYYY-MM-DD) *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 149, 0, 0.1)"
                      : "rgba(255, 149, 0, 0.05)",
                    color: isDark ? "#fff" : "#000",
                    borderColor: "rgba(255, 149, 0, 0.2)",
                  },
                ]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={isDark ? "#666" : "#999"}
                value={serviceDate}
                onChangeText={handleDateChange}
              />
              <ThemedText type="default" style={styles.hint}>
                Primjer: 2024-01-15
              </ThemedText>
            </View>

            {/* Working Hours at Service */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Sati Opreme pri Servisu *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 149, 0, 0.1)"
                      : "rgba(255, 149, 0, 0.05)",
                    color: isDark ? "#fff" : "#000",
                    borderColor: "rgba(255, 149, 0, 0.2)",
                  },
                ]}
                placeholder="0"
                placeholderTextColor={isDark ? "#666" : "#999"}
                keyboardType="decimal-pad"
                value={hoursAtService}
                onChangeText={setHoursAtService}
              />
              <ThemedText type="default" style={styles.hint}>
                Ukupni sati opreme u vrijeme servisa
              </ThemedText>
            </View>

            {/* Cost */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Trošak (€) *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 149, 0, 0.1)"
                      : "rgba(255, 149, 0, 0.05)",
                    color: isDark ? "#fff" : "#000",
                    borderColor: "rgba(255, 149, 0, 0.2)",
                  },
                ]}
                placeholder="0.00"
                placeholderTextColor={isDark ? "#666" : "#999"}
                keyboardType="decimal-pad"
                value={cost}
                onChangeText={setCost}
              />
            </View>

            {/* Technician */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Tehničar *
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 149, 0, 0.1)"
                      : "rgba(255, 149, 0, 0.05)",
                    color: isDark ? "#fff" : "#000",
                    borderColor: "rgba(255, 149, 0, 0.2)",
                  },
                ]}
                placeholder="Ime tehničara"
                placeholderTextColor={isDark ? "#666" : "#999"}
                value={technician}
                onChangeText={setTechnician}
              />
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Napomene
              </ThemedText>
              <TextInput
                style={[
                  styles.input,
                  styles.notesInput,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 149, 0, 0.1)"
                      : "rgba(255, 149, 0, 0.05)",
                    color: isDark ? "#fff" : "#000",
                    borderColor: "rgba(255, 149, 0, 0.2)",
                  },
                ]}
                placeholder="Dodatne napomene..."
                placeholderTextColor={isDark ? "#666" : "#999"}
                multiline
                numberOfLines={4}
                value={notes}
                onChangeText={setNotes}
              />
            </View>

            {/* Photo Attachments */}
            <View style={styles.section}>
              <ThemedText type="defaultSemiBold" style={styles.label}>
                Fotografije
              </ThemedText>
              <PhotoPicker photos={photos} onPhotosChange={setPhotos} maxPhotos={5} />
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
            >
              <ThemedText style={styles.cancelButtonText}>Otkaži</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.button, styles.saveButton]}
              onPress={handleSave}
            >
              <ThemedText style={styles.saveButtonText}>Spremi</ThemedText>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "90%",
    paddingBottom: 20,
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
  title: {
    fontSize: 20,
  },
  closeButton: {
    padding: 8,
  },
  closeButtonText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FF9500",
  },
  content: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  section: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 8,
  },
  pickerContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  pickerOption: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  pickerOptionSelected: {
    borderColor: "#FF9500",
  },
  pickerOptionText: {
    fontSize: 12,
    fontWeight: "500",
    color: "#FF9500",
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    minHeight: 44,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: "top",
    paddingTop: 10,
  },
  hint: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 12,
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
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  cancelButtonText: {
    color: "#FF9500",
    fontSize: 14,
    fontWeight: "600",
  },
  saveButton: {
    backgroundColor: "#FF9500",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
