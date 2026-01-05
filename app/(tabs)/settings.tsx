import { useState, useEffect } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { ThemedText } from "@/components/themed-text";
import { useAppData } from "@/hooks/use-app-data";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const { appState } = useAppData();
  const isDark = colorScheme === "dark";

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [maintenanceAlerts, setMaintenanceAlerts] = useState(true);
  const [inventoryAlerts, setInventoryAlerts] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [lastBackupDate, setLastBackupDate] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem("appSettings");
      if (settings) {
        const parsed = JSON.parse(settings);
        setNotificationsEnabled(parsed.notificationsEnabled ?? true);
        setMaintenanceAlerts(parsed.maintenanceAlerts ?? true);
        setInventoryAlerts(parsed.inventoryAlerts ?? true);
        setSoundEnabled(parsed.soundEnabled ?? true);
        setVibrationEnabled(parsed.vibrationEnabled ?? true);
      }

      const backupDate = await AsyncStorage.getItem("lastBackupDate");
      if (backupDate) {
        setLastBackupDate(backupDate);
      }
    } catch (error) {
      console.error("Error loading settings:", error);
    }
  };

  const saveSettings = async (
    key: string,
    value: boolean,
  ) => {
    try {
      const settings = await AsyncStorage.getItem("appSettings");
      const parsed = settings ? JSON.parse(settings) : {};
      parsed[key] = value;
      await AsyncStorage.setItem("appSettings", JSON.stringify(parsed));
    } catch (error) {
      console.error("Error saving settings:", error);
    }
  };

  const handleNotificationsToggle = (value: boolean) => {
    setNotificationsEnabled(value);
    saveSettings("notificationsEnabled", value);
  };

  const handleMaintenanceAlertsToggle = (value: boolean) => {
    setMaintenanceAlerts(value);
    saveSettings("maintenanceAlerts", value);
  };

  const handleInventoryAlertsToggle = (value: boolean) => {
    setInventoryAlerts(value);
    saveSettings("inventoryAlerts", value);
  };

  const handleSoundToggle = (value: boolean) => {
    setSoundEnabled(value);
    saveSettings("soundEnabled", value);
  };

  const handleVibrationToggle = (value: boolean) => {
    setVibrationEnabled(value);
    saveSettings("vibrationEnabled", value);
  };

  const handleBackup = async () => {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        equipment: appState.equipment,
        serviceRecords: appState.serviceRecords,
        fuelLogs: appState.fuelLogs,
        spareParts: appState.spareParts,
        lubricationPoints: appState.lubricationPoints,
      };

      const backupJson = JSON.stringify(backup, null, 2);
      const backupDate = new Date().toLocaleString();

      await AsyncStorage.setItem("appBackup", backupJson);
      await AsyncStorage.setItem("lastBackupDate", backupDate);
      setLastBackupDate(backupDate);

      Alert.alert("Uspjeh", "Podaci su uspješno sigurnosno kopirani");
    } catch (error) {
      console.error("Error creating backup:", error);
      Alert.alert("Greška", "Greška pri sigurnosnom kopiranju podataka");
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      "Potvrda",
      "Sigurno želite vratiti podatke iz sigurnosne kopije? Trenutni podaci će biti zamijenjeni.",
      [
        { text: "Otkaži", onPress: () => {} },
        {
          text: "Vrati",
          onPress: async () => {
            try {
              const backupJson = await AsyncStorage.getItem("appBackup");
              if (!backupJson) {
                Alert.alert("Greška", "Nema dostupne sigurnosne kopije");
                return;
              }

              const backup = JSON.parse(backupJson);

              // Restore all data
              await AsyncStorage.setItem(
                "appState",
                JSON.stringify({
                  equipment: backup.equipment,
                  serviceRecords: backup.serviceRecords,
                  fuelLogs: backup.fuelLogs,
                  spareParts: backup.spareParts,
                  lubricationPoints: backup.lubricationPoints,
                  dailyReports: backup.dailyReports || [],
                  monthlyReports: backup.monthlyReports || [],
                }),
              );

              Alert.alert("Uspjeh", "Podaci su uspješno vraćeni");
              // Reload app or refresh state
            } catch (error) {
              console.error("Error restoring backup:", error);
              Alert.alert("Greška", "Greška pri vraćanju podataka");
            }
          },
        },
      ],
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Potvrda",
      "Sigurno želite obrisati sve podatke? Ova akcija se ne može vratiti.",
      [
        { text: "Otkaži", onPress: () => {} },
        {
          text: "Obriši",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("appState");
              Alert.alert("Uspjeh", "Svi podaci su obrisani");
              // Reload app
            } catch (error) {
              console.error("Error clearing data:", error);
              Alert.alert("Greška", "Greška pri brisanju podataka");
            }
          },
          style: "destructive",
        },
      ],
    );
  };

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

      <ScrollView
        style={[styles.content, { paddingTop: Math.max(insets.top, 16) }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title" style={styles.headerTitle}>
            Postavke
          </ThemedText>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Obavijesti
          </ThemedText>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: isDark
                  ? "rgba(30, 30, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
              },
            ]}
          >
            <View style={styles.settingContent}>
              <ThemedText type="defaultSemiBold">
                Omogući obavijesti
              </ThemedText>
              <ThemedText type="default" style={styles.settingDescription}>
                Primaj obavijesti o servisu i zalihama
              </ThemedText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: "#767577", true: "#FF9500" }}
              thumbColor={notificationsEnabled ? "#FF9500" : "#f4f3f4"}
            />
          </View>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: isDark
                  ? "rgba(30, 30, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
                opacity: notificationsEnabled ? 1 : 0.5,
              },
            ]}
          >
            <View style={styles.settingContent}>
              <ThemedText type="defaultSemiBold">
                Upozorenja o servisu
              </ThemedText>
              <ThemedText type="default" style={styles.settingDescription}>
                Obavijesti kada je servis zakašnjen
              </ThemedText>
            </View>
            <Switch
              value={maintenanceAlerts}
              onValueChange={handleMaintenanceAlertsToggle}
              disabled={!notificationsEnabled}
              trackColor={{ false: "#767577", true: "#FF9500" }}
              thumbColor={maintenanceAlerts ? "#FF9500" : "#f4f3f4"}
            />
          </View>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: isDark
                  ? "rgba(30, 30, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
                opacity: notificationsEnabled ? 1 : 0.5,
              },
            ]}
          >
            <View style={styles.settingContent}>
              <ThemedText type="defaultSemiBold">
                Upozorenja o zalihama
              </ThemedText>
              <ThemedText type="default" style={styles.settingDescription}>
                Obavijesti kada su zalihe niske
              </ThemedText>
            </View>
            <Switch
              value={inventoryAlerts}
              onValueChange={handleInventoryAlertsToggle}
              disabled={!notificationsEnabled}
              trackColor={{ false: "#767577", true: "#FF9500" }}
              thumbColor={inventoryAlerts ? "#FF9500" : "#f4f3f4"}
            />
          </View>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: isDark
                  ? "rgba(30, 30, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
                opacity: notificationsEnabled ? 1 : 0.5,
              },
            ]}
          >
            <View style={styles.settingContent}>
              <ThemedText type="defaultSemiBold">
                Zvuk obavijesti
              </ThemedText>
              <ThemedText type="default" style={styles.settingDescription}>
                Reproduciraj zvuk za obavijesti
              </ThemedText>
            </View>
            <Switch
              value={soundEnabled}
              onValueChange={handleSoundToggle}
              disabled={!notificationsEnabled}
              trackColor={{ false: "#767577", true: "#FF9500" }}
              thumbColor={soundEnabled ? "#FF9500" : "#f4f3f4"}
            />
          </View>

          <View
            style={[
              styles.settingItem,
              {
                backgroundColor: isDark
                  ? "rgba(30, 30, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
                opacity: notificationsEnabled ? 1 : 0.5,
              },
            ]}
          >
            <View style={styles.settingContent}>
              <ThemedText type="defaultSemiBold">
                Vibracija
              </ThemedText>
              <ThemedText type="default" style={styles.settingDescription}>
                Vibracija pri obavijestima
              </ThemedText>
            </View>
            <Switch
              value={vibrationEnabled}
              onValueChange={handleVibrationToggle}
              disabled={!notificationsEnabled}
              trackColor={{ false: "#767577", true: "#FF9500" }}
              thumbColor={vibrationEnabled ? "#FF9500" : "#f4f3f4"}
            />
          </View>
        </View>

        {/* Backup & Restore Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            Sigurnosna Kopija
          </ThemedText>

          {lastBackupDate && (
            <View
              style={[
                styles.infoBox,
                {
                  backgroundColor: isDark
                    ? "rgba(52, 199, 89, 0.1)"
                    : "rgba(52, 199, 89, 0.05)",
                },
              ]}
            >
              <ThemedText type="default" style={styles.infoText}>
                Zadnja sigurnosna kopija: {lastBackupDate}
              </ThemedText>
            </View>
          )}

          <Pressable
            style={[
              styles.button,
              styles.backupButton,
              {
                backgroundColor: isDark
                  ? "rgba(255, 149, 0, 0.2)"
                  : "rgba(255, 149, 0, 0.15)",
              },
            ]}
            onPress={handleBackup}
          >
            <ThemedText style={styles.backupButtonText}>
              💾 Kreiraj Sigurnosnu Kopiju
            </ThemedText>
          </Pressable>

          <Pressable
            style={[
              styles.button,
              styles.restoreButton,
              {
                backgroundColor: isDark
                  ? "rgba(0, 122, 255, 0.2)"
                  : "rgba(0, 122, 255, 0.15)",
              },
            ]}
            onPress={handleRestore}
          >
            <ThemedText style={styles.restoreButtonText}>
              ↩️ Vrati Podatke
            </ThemedText>
          </Pressable>
        </View>

        {/* App Information Section */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={styles.sectionTitle}>
            O Aplikaciji
          </ThemedText>

          <View
            style={[
              styles.infoItem,
              {
                backgroundColor: isDark
                  ? "rgba(30, 30, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
              },
            ]}
          >
            <ThemedText type="default">Verzija</ThemedText>
            <ThemedText type="defaultSemiBold">1.0.0</ThemedText>
          </View>

          <View
            style={[
              styles.infoItem,
              {
                backgroundColor: isDark
                  ? "rgba(30, 30, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
              },
            ]}
          >
            <ThemedText type="default">Naziv Aplikacije</ThemedText>
            <ThemedText type="defaultSemiBold">AZVIRT Održavanje</ThemedText>
          </View>

          <View
            style={[
              styles.infoItem,
              {
                backgroundColor: isDark
                  ? "rgba(30, 30, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
              },
            ]}
          >
            <ThemedText type="default">Ukupna Oprema</ThemedText>
            <ThemedText type="defaultSemiBold">
              {appState.equipment.length}
            </ThemedText>
          </View>

          <View
            style={[
              styles.infoItem,
              {
                backgroundColor: isDark
                  ? "rgba(30, 30, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
              },
            ]}
          >
            <ThemedText type="default">Ukupni Servisi</ThemedText>
            <ThemedText type="defaultSemiBold">
              {appState.serviceRecords.length}
            </ThemedText>
          </View>

          <View
            style={[
              styles.infoItem,
              {
                backgroundColor: isDark
                  ? "rgba(30, 30, 30, 0.85)"
                  : "rgba(255, 255, 255, 0.85)",
              },
            ]}
          >
            <ThemedText type="default">Rezervni Dijelovi</ThemedText>
            <ThemedText type="defaultSemiBold">
              {appState.spareParts.length}
            </ThemedText>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <ThemedText type="subtitle" style={[styles.sectionTitle, { color: "#FF3B30" }]}>
            Opasna Zona
          </ThemedText>

          <Pressable
            style={[
              styles.button,
              styles.dangerButton,
              {
                backgroundColor: isDark
                  ? "rgba(255, 59, 48, 0.2)"
                  : "rgba(255, 59, 48, 0.15)",
              },
            ]}
            onPress={handleClearAllData}
          >
            <ThemedText style={styles.dangerButtonText}>
              🗑️ Obriši Sve Podatke
            </ThemedText>
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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
  section: {
    paddingHorizontal: 16,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#FF9500",
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  settingContent: {
    flex: 1,
    marginRight: 12,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  button: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  backupButton: {
    borderColor: "rgba(255, 149, 0, 0.3)",
  },
  backupButtonText: {
    color: "#FF9500",
    fontSize: 14,
    fontWeight: "600",
  },
  restoreButton: {
    borderColor: "rgba(0, 122, 255, 0.3)",
  },
  restoreButtonText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },
  dangerButton: {
    borderColor: "rgba(255, 59, 48, 0.3)",
  },
  dangerButtonText: {
    color: "#FF3B30",
    fontSize: 14,
    fontWeight: "600",
  },
  infoBox: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "rgba(52, 199, 89, 0.2)",
  },
  infoText: {
    fontSize: 12,
    color: "#34C759",
  },
  infoItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
});
