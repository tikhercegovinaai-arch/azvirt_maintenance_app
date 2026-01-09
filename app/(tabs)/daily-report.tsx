import { useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ThemedText } from "@/components/themed-text";
import { useAppData } from "@/hooks/use-app-data";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { DailyReport } from "@/types";

const CHECKLIST_ITEMS = [
  { id: "safety_gear", label: "Sigurnosna oprema provjerena" },
  { id: "fire_extinguisher", label: "Aparat za gašenje požara proveren" },
  { id: "first_aid", label: "Prva pomoć dostupna" },
  { id: "equipment_clean", label: "Oprema čista i uredna" },
  { id: "work_area_safe", label: "Radno područje sigurno" },
  { id: "tools_organized", label: "Alati organizovani" },
  { id: "fuel_levels", label: "Nivoi goriva provjereni" },
  { id: "oil_levels", label: "Nivoi ulja provjereni" },
];

export default function DailyReportScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { appState, addDailyReport, updateEquipmentHours } = useAppData();
  const isDark = colorScheme === "dark";

  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [shift, setShift] = useState<"morning" | "afternoon" | "night">("morning");
  const [equipmentHours, setEquipmentHours] = useState<Record<string, string>>({});
  const [checklist, setChecklist] = useState<Record<string, boolean>>({});
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    // Validate equipment hours
    const hasHours = Object.keys(equipmentHours).length > 0;
    if (!hasHours) {
      Alert.alert("Greška", "Molimo unesite sate za najmanje jednu opremu.");
      return;
    }

    // Validate all hours are positive numbers
    for (const [equipmentId, hours] of Object.entries(equipmentHours)) {
      const hoursNum = parseFloat(hours);
      if (isNaN(hoursNum) || hoursNum < 0) {
        Alert.alert("Greška", "Svi sati moraju biti pozitivni brojevi.");
        return;
      }
    }

    setSaving(true);

    try {
      // Create equipment data array
      const equipmentData = Object.entries(equipmentHours).map(([equipmentId, hours]) => ({
        equipmentId,
        hours: parseFloat(hours),
      }));

      // Create checklist items array
      const checklistItems = Object.entries(checklist).map(([itemId, completed]) => ({
        itemId,
        completed,
        notes: "",
      }));

      // Create daily report
      const report: DailyReport = {
        id: `report-${Date.now()}`,
        date,
        shift,
        equipmentData,
        checklistItems,
        operator: "User",
        generalNotes: notes,
      };

      // Save report
      addDailyReport(report);

      // Update equipment hours
      for (const [equipmentId, hours] of Object.entries(equipmentHours)) {
        const equipment = appState.equipment.find((eq) => eq.id === equipmentId);
        if (equipment) {
          const newHours = equipment.currentHours + parseFloat(hours);
          updateEquipmentHours(equipmentId, newHours);
        }
      }

      Alert.alert("Uspjeh", "Dnevni izvještaj je sačuvan.");

      // Reset form
      setEquipmentHours({});
      setChecklist({});
      setNotes("");
      setDate(new Date().toISOString().split("T")[0]);
      setShift("morning");
    } catch (error) {
      Alert.alert("Greška", "Nije moguće sačuvati dnevni izvještaj.");
    } finally {
      setSaving(false);
    }
  };

  const completedCount = Object.values(checklist).filter(Boolean).length;
  const totalCount = CHECKLIST_ITEMS.length;
  const completionRate = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <View style={styles.container}>
      <ImageBackground
        source={require("@/assets/images/background.jpg")}
        style={styles.backgroundImage}
        imageStyle={{ opacity: 0.15 }}
      >
        <View style={[styles.overlay, { backgroundColor: isDark ? "rgba(15,15,15,0.85)" : "rgba(255,255,255,0.85)" }]} />
        <View
          style={[
            styles.content,
            {
              paddingTop: Math.max(insets.top, 20),
              paddingBottom: Math.max(insets.bottom, 20),
              paddingLeft: Math.max(insets.left, 16),
              paddingRight: Math.max(insets.right, 16),
            },
          ]}
        >
          <ThemedText type="title" style={styles.title}>
            Dnevni Izvještaj
          </ThemedText>

          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Date and Shift */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Datum i Smjena
              </ThemedText>
              <View style={styles.dateShiftContainer}>
                <View style={styles.dateContainer}>
                  <ThemedText style={styles.label}>Datum</ThemedText>
                  <TextInput
                    style={[
                      styles.dateInput,
                      { color: isDark ? "#fff" : "#000", backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" },
                    ]}
                    value={date}
                    onChangeText={setDate}
                    placeholder="YYYY-MM-DD"
                    placeholderTextColor={isDark ? "#999" : "#666"}
                  />
                </View>
                <View style={styles.shiftContainer}>
                  <ThemedText style={styles.label}>Smjena</ThemedText>
                  <View style={styles.shiftButtons}>
                    {(["morning", "afternoon", "night"] as const).map((s) => (
                      <Pressable
                        key={s}
                        style={[
                          styles.shiftButton,
                          shift === s && styles.shiftButtonActive,
                        ]}
                        onPress={() => setShift(s)}
                      >
                        <ThemedText style={[styles.shiftButtonText, shift === s && styles.shiftButtonTextActive]}>
                          {s === "morning" ? "Jutro" : s === "afternoon" ? "Popodne" : "Noć"}
                        </ThemedText>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </View>
            </View>

            {/* Equipment Hours */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Sati Opreme
              </ThemedText>
              {appState.equipment.map((equipment) => (
                <View key={equipment.id} style={styles.equipmentRow}>
                  <View style={styles.equipmentInfo}>
                    <ThemedText style={styles.equipmentName}>{equipment.displayName}</ThemedText>
                    <ThemedText style={styles.equipmentCurrentHours}>
                      Trenutno: {equipment.currentHours}h
                    </ThemedText>
                  </View>
                  <TextInput
                    style={[
                      styles.hoursInput,
                      { color: isDark ? "#fff" : "#000", backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" },
                    ]}
                    value={equipmentHours[equipment.id] || ""}
                    onChangeText={(text) =>
                      setEquipmentHours((prev) => ({ ...prev, [equipment.id]: text }))
                    }
                    placeholder="0"
                    placeholderTextColor={isDark ? "#999" : "#666"}
                    keyboardType="decimal-pad"
                  />
                </View>
              ))}
            </View>

            {/* Operational Checklist */}
            <View style={styles.section}>
              <View style={styles.checklistHeader}>
                <ThemedText type="subtitle" style={styles.sectionTitle}>
                  Operativna Kontrolna Lista
                </ThemedText>
                <View style={styles.completionBadge}>
                  <ThemedText style={styles.completionText}>
                    {completedCount}/{totalCount} ({completionRate.toFixed(0)}%)
                  </ThemedText>
                </View>
              </View>
              {CHECKLIST_ITEMS.map((item) => (
                <View key={item.id} style={styles.checklistItem}>
                  <Switch
                    value={checklist[item.id] || false}
                    onValueChange={(value) =>
                      setChecklist((prev) => ({ ...prev, [item.id]: value }))
                    }
                    trackColor={{ false: "#767577", true: "#FF9500" }}
                    thumbColor={checklist[item.id] ? "#fff" : "#f4f3f4"}
                  />
                  <ThemedText style={styles.checklistLabel}>{item.label}</ThemedText>
                </View>
              ))}
            </View>

            {/* Notes */}
            <View style={styles.section}>
              <ThemedText type="subtitle" style={styles.sectionTitle}>
                Napomene
              </ThemedText>
              <TextInput
                style={[
                  styles.notesInput,
                  { color: isDark ? "#fff" : "#000", backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)" },
                ]}
                value={notes}
                onChangeText={setNotes}
                placeholder="Opšte napomene i zapažanja..."
                placeholderTextColor={isDark ? "#999" : "#666"}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Save Button */}
            <Pressable
              style={[styles.saveButton, saving && styles.saveButtonDisabled]}
              onPress={handleSave}
              disabled={saving}
            >
              <ThemedText style={styles.saveButtonText}>
                {saving ? "Čuvanje..." : "Sačuvaj Izvještaj"}
              </ThemedText>
            </Pressable>
          </ScrollView>
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    flex: 1,
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
  title: {
    marginBottom: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  dateShiftContainer: {
    gap: 12,
  },
  dateContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  dateInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF9500",
    fontSize: 16,
  },
  shiftContainer: {
    gap: 8,
  },
  shiftButtons: {
    flexDirection: "row",
    gap: 8,
  },
  shiftButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF9500",
    alignItems: "center",
  },
  shiftButtonActive: {
    backgroundColor: "#FF9500",
  },
  shiftButtonText: {
    fontSize: 14,
    fontWeight: "600",
  },
  shiftButtonTextActive: {
    color: "#fff",
  },
  equipmentRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF9500",
    marginBottom: 8,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
  },
  equipmentInfo: {
    flex: 1,
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: "600",
  },
  equipmentCurrentHours: {
    fontSize: 13,
    opacity: 0.7,
    marginTop: 2,
  },
  hoursInput: {
    width: 80,
    padding: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#FF9500",
    fontSize: 16,
    textAlign: "center",
  },
  checklistHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  completionBadge: {
    backgroundColor: "#FF9500",
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  completionText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF9500",
    marginBottom: 8,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
    gap: 12,
  },
  checklistLabel: {
    flex: 1,
    fontSize: 15,
  },
  notesInput: {
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FF9500",
    fontSize: 15,
    minHeight: 100,
  },
  saveButton: {
    backgroundColor: "#FF9500",
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
});
