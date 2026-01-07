import { useEffect, useState } from "react";
import {
  Alert,
  ImageBackground,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  View,
  ActivityIndicator,
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
  const [isBackingUp, setIsBackingUp] = useState(false);

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

  const saveSettings = async (key: string, value: boolean) => {
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
      setIsBackingUp(true);
      const backup = {
        timestamp: new Date().toISOString(),
        equipment: appState.equipment,
        serviceRecords: appState.serviceRecords,
        fuelLogs: appState.fuelLogs,
        lubricationPoints: appState.lubricationPoints,
        spareParts: appState.spareParts,
      };

      const backupString = JSON.stringify(backup, null, 2);
      await AsyncStorage.setItem("appBackup", backupString);
      const backupDate = new Date().toLocaleString("hr-HR");
      await AsyncStorage.setItem("lastBackupDate", backupDate);
      setLastBackupDate(backupDate);

      Alert.alert("Uspješno!", "Sigurnosna kopija je uspješno kreirana");
    } catch (error) {
      Alert.alert("Greška", "Nije moguće kreirati sigurnosnu kopiju");
      console.error("Error creating backup:", error);
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleRestore = async () => {
    Alert.alert(
      "Potvrda",
      "Ova akcija će vratiti sve podatke iz sigurnosne kopije. Svi trenutni podaci će biti zamijenjeni.",
      [
        { text: "Otkaži", onPress: () => {} },
        {
          text: "Vrati",
          onPress: async () => {
            try {
              setIsBackingUp(true);
              const backupString = await AsyncStorage.getItem("appBackup");
              if (!backupString) {
                Alert.alert("Greška", "Nema dostupne sigurnosne kopije");
                return;
              }

              const backup = JSON.parse(backupString);
              await AsyncStorage.setItem("appState", JSON.stringify(backup));
              Alert.alert("Uspješno!", "Podaci su uspješno vraćeni");
              // Reload the app data
              window.location.reload();
            } catch (error) {
              Alert.alert("Greška", "Nije moguće vratiti podatke");
              console.error("Error restoring backup:", error);
            } finally {
              setIsBackingUp(false);
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const handleClearAllData = () => {
    Alert.alert(
      "Upozorenje",
      "Ova akcija će obrisati sve podatke iz aplikacije. Ovo se ne može poništiti!",
      [
        { text: "Otkaži", onPress: () => {} },
        {
          text: "Obriši sve",
          onPress: async () => {
            try {
              await AsyncStorage.removeItem("appState");
              await AsyncStorage.removeItem("appSettings");
              await AsyncStorage.removeItem("appBackup");
              Alert.alert("Uspješno!", "Svi podaci su obrisani");
            } catch (error) {
              Alert.alert("Greška", "Nije moguće obrisati podatke");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const equipmentCount = appState.equipment.length;
  const serviceCount = appState.serviceRecords.length;
  const partsCount = appState.spareParts.length;

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
              ? "rgba(0, 0, 0, 0.6)"
              : "rgba(255, 255, 255, 0.85)",
          },
        ]}
      />

      <ScrollView
        style={[
          styles.content,
          {
            paddingTop: Math.max(insets.top, 16),
            paddingBottom: Math.max(insets.bottom, 16),
          },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <ThemedText type="title">Postavke</ThemedText>
        </View>

        {/* Notification Settings Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              🔔 Obavijesti
            </ThemedText>
          </View>

          <View style={styles.settingItem}>
            <View style={styles.settingLabel}>
              <ThemedText type="defaultSemiBold">Omogući obavijesti</ThemedText>
              <ThemedText type="default" style={styles.settingDescription}>
                Primaj obavijesti o održavanju i inventaru
              </ThemedText>
            </View>
            <Switch
              value={notificationsEnabled}
              onValueChange={handleNotificationsToggle}
              trackColor={{ false: "#767577", true: "#FF9500" }}
              thumbColor={notificationsEnabled ? "#fff" : "#f4f3f4"}
            />
          </View>

          {notificationsEnabled && (
            <>
              <View style={styles.settingItem}>
                <View style={styles.settingLabel}>
                  <ThemedText type="default">Upozorenja o održavanju</ThemedText>
                </View>
                <Switch
                  value={maintenanceAlerts}
                  onValueChange={handleMaintenanceAlertsToggle}
                  trackColor={{ false: "#767577", true: "#FF9500" }}
                  thumbColor={maintenanceAlerts ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLabel}>
                  <ThemedText type="default">Upozorenja o inventaru</ThemedText>
                </View>
                <Switch
                  value={inventoryAlerts}
                  onValueChange={handleInventoryAlertsToggle}
                  trackColor={{ false: "#767577", true: "#FF9500" }}
                  thumbColor={inventoryAlerts ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLabel}>
                  <ThemedText type="default">Zvuk obavijesti</ThemedText>
                </View>
                <Switch
                  value={soundEnabled}
                  onValueChange={handleSoundToggle}
                  trackColor={{ false: "#767577", true: "#FF9500" }}
                  thumbColor={soundEnabled ? "#fff" : "#f4f3f4"}
                />
              </View>

              <View style={styles.settingItem}>
                <View style={styles.settingLabel}>
                  <ThemedText type="default">Vibracija</ThemedText>
                </View>
                <Switch
                  value={vibrationEnabled}
                  onValueChange={handleVibrationToggle}
                  trackColor={{ false: "#767577", true: "#FF9500" }}
                  thumbColor={vibrationEnabled ? "#fff" : "#f4f3f4"}
                />
              </View>
            </>
          )}
        </View>

        {/* Data Management Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              💾 Upravljanje Podacima
            </ThemedText>
          </View>

          <Pressable
            style={[styles.button, styles.primaryButton]}
            onPress={handleBackup}
            disabled={isBackingUp}
          >
            {isBackingUp ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <ThemedText type="defaultSemiBold" style={styles.buttonText}>
                Kreiraj Sigurnosnu Kopiju
              </ThemedText>
            )}
          </Pressable>

          {lastBackupDate && (
            <View style={styles.backupInfo}>
              <ThemedText type="default" style={styles.backupInfoText}>
                Zadnja kopija: {lastBackupDate}
              </ThemedText>
            </View>
          )}

          <Pressable
            style={[styles.button, styles.secondaryButton]}
            onPress={handleRestore}
            disabled={isBackingUp}
          >
            <ThemedText type="defaultSemiBold" style={styles.secondaryButtonText}>
              Vrati iz Sigurnosne Kopije
            </ThemedText>
          </Pressable>
        </View>

        {/* Statistics Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              📊 Statistika
            </ThemedText>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <ThemedText type="title" style={styles.statValue}>
                {equipmentCount}
              </ThemedText>
              <ThemedText type="default" style={styles.statLabel}>
                Opreme
              </ThemedText>
            </View>

            <View style={styles.statCard}>
              <ThemedText type="title" style={styles.statValue}>
                {serviceCount}
              </ThemedText>
              <ThemedText type="default" style={styles.statLabel}>
                Servisa
              </ThemedText>
            </View>

            <View style={styles.statCard}>
              <ThemedText type="title" style={styles.statValue}>
                {partsCount}
              </ThemedText>
              <ThemedText type="default" style={styles.statLabel}>
                Dijelova
              </ThemedText>
            </View>
          </View>
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              ℹ️ O Aplikaciji
            </ThemedText>
          </View>

          <View style={styles.aboutItem}>
            <ThemedText type="default" style={styles.aboutLabel}>
              Naziv
            </ThemedText>
            <ThemedText type="defaultSemiBold">AZVIRT Održavanje</ThemedText>
          </View>

          <View style={styles.aboutItem}>
            <ThemedText type="default" style={styles.aboutLabel}>
              Verzija
            </ThemedText>
            <ThemedText type="defaultSemiBold">1.0.0</ThemedText>
          </View>

          <View style={styles.aboutItem}>
            <ThemedText type="default" style={styles.aboutLabel}>
              Opis
            </ThemedText>
            <ThemedText type="default" style={styles.aboutDescription}>
              Aplikacija za praćenje održavanja opreme, promjene ulja i upravljanje inventarom
            </ThemedText>
          </View>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <ThemedText type="subtitle" style={[styles.sectionTitle, styles.dangerTitle]}>
              ⚠️ Opasna Zona
            </ThemedText>
          </View>

          <Pressable
            style={[styles.button, styles.dangerButton]}
            onPress={handleClearAllData}
          >
            <ThemedText type="defaultSemiBold" style={styles.dangerButtonText}>
              Obriši sve podatke
            </ThemedText>
          </Pressable>

          <ThemedText type="default" style={styles.dangerWarning}>
            Ova akcija će trajno obrisati sve podatke iz aplikacije. Ovo se ne može poništiti!
          </ThemedText>
        </View>
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
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
    backgroundColor: "rgba(255, 149, 0, 0.05)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
    overflow: "hidden",
  },
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 149, 0, 0.2)",
  },
  sectionTitle: {
    color: "#FF9500",
    fontSize: 16,
  },
  settingItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 149, 0, 0.1)",
  },
  settingLabel: {
    flex: 1,
  },
  settingDescription: {
    fontSize: 12,
    opacity: 0.6,
    marginTop: 4,
  },
  button: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
  },
  primaryButton: {
    backgroundColor: "#FF9500",
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
  },
  secondaryButton: {
    backgroundColor: "rgba(0, 102, 204, 0.1)",
    borderWidth: 1,
    borderColor: "#0066CC",
  },
  secondaryButtonText: {
    color: "#0066CC",
    fontSize: 14,
  },
  backupInfo: {
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(52, 199, 89, 0.1)",
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: "#34C759",
  },
  backupInfoText: {
    fontSize: 12,
    color: "#34C759",
  },
  statsGrid: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  statCard: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "rgba(255, 149, 0, 0.2)",
  },
  statValue: {
    color: "#FF9500",
    fontSize: 20,
  },
  statLabel: {
    fontSize: 11,
    opacity: 0.6,
    marginTop: 4,
  },
  aboutItem: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255, 149, 0, 0.1)",
  },
  aboutLabel: {
    fontSize: 12,
    opacity: 0.6,
    marginBottom: 4,
  },
  aboutDescription: {
    fontSize: 13,
    lineHeight: 18,
  },
  dangerTitle: {
    color: "#FF3B30",
  },
  dangerButton: {
    backgroundColor: "rgba(255, 59, 48, 0.1)",
    borderWidth: 1,
    borderColor: "#FF3B30",
  },
  dangerButtonText: {
    color: "#FF3B30",
    fontSize: 14,
  },
  dangerWarning: {
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "rgba(255, 59, 48, 0.05)",
    borderRadius: 8,
    fontSize: 12,
    opacity: 0.7,
    lineHeight: 16,
  },
});
