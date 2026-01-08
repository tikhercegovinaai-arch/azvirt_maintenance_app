import { useState } from "react";
import {
  Modal,
  Pressable,
  StyleSheet,
  View,
  Alert,
  ActivityIndicator,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { useAppData } from "@/hooks/use-app-data";
import { useThemeColor } from "@/hooks/use-theme-color";

interface CustomReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ReportSection {
  id: string;
  label: string;
  enabled: boolean;
}

export function CustomReportModal({ isOpen, onClose }: CustomReportModalProps) {
  const insets = useSafeAreaInsets();
  const { appState } = useAppData();
  const [loading, setLoading] = useState(false);
  const backgroundColor = useThemeColor({}, "background");
  const isDark = backgroundColor === "#151718";

  const [sections, setSections] = useState<ReportSection[]>([
    { id: "equipment", label: "Status Opreme", enabled: true },
    { id: "services", label: "Istorija Servisa", enabled: true },
    { id: "fuel", label: "Evidencija Goriva", enabled: true },
    { id: "lubrication", label: "Raspored Podmazivanja", enabled: false },
    { id: "inventory", label: "Inventar Rezervnih Dijelova", enabled: false },
    { id: "fuelStock", label: "Zaliha Goriva na Lokaciji", enabled: true },
    { id: "summary", label: "Sažetak i Statistika", enabled: true },
  ]);

  const toggleSection = (id: string) => {
    setSections((prev) =>
      prev.map((section) =>
        section.id === id ? { ...section, enabled: !section.enabled } : section,
      ),
    );
  };

  const generateHTMLReport = (): string => {
    const enabledSections = sections.filter((s) => s.enabled);
    const timestamp = new Date().toLocaleString("sr-RS");

    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body {
            font-family: Arial, sans-serif;
            margin: 20px;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #FF9500;
            padding-bottom: 15px;
          }
          .header h1 {
            color: #FF9500;
            margin: 0;
            font-size: 28px;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .section {
            margin: 25px 0;
            page-break-inside: avoid;
          }
          .section-title {
            background-color: #FF9500;
            color: white;
            padding: 10px 15px;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 10px;
            text-align: left;
          }
          th {
            background-color: #f5f5f5;
            font-weight: bold;
          }
          .status-good { color: #34C759; font-weight: bold; }
          .status-warning { color: #FF9500; font-weight: bold; }
          .status-critical { color: #FF3B30; font-weight: bold; }
          .summary-box {
            background-color: #f9f9f9;
            border-left: 4px solid #FF9500;
            padding: 15px;
            margin: 10px 0;
          }
          .summary-item {
            margin: 8px 0;
            font-size: 14px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #999;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 15px;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>AZVIRT Maintenance Report</h1>
          <p>Izvještaj o Održavanju Opreme</p>
          <p>Generisano: ${timestamp}</p>
        </div>
    `;

    // Equipment Status Section
    if (enabledSections.find((s) => s.id === "equipment")) {
      html += `
        <div class="section">
          <div class="section-title">Status Opreme</div>
          <table>
            <thead>
              <tr>
                <th>Oprema</th>
                <th>Trenutni Sati</th>
                <th>Zadnji Servis</th>
                <th>Do Servisa</th>
                <th>Gorivo</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
      `;
      appState.equipment.forEach((eq) => {
        const hoursUntilService = eq.serviceIntervalHours - (eq.currentHours - eq.lastServiceHours);
        const statusClass =
          hoursUntilService <= 0
            ? "status-critical"
            : hoursUntilService <= 50
              ? "status-warning"
              : "status-good";
        const fuelPercent = eq.fuelCapacity
          ? ((eq.fuelLevel || 0) / eq.fuelCapacity * 100).toFixed(0)
          : "N/A";
        html += `
          <tr>
            <td>${eq.displayName}</td>
            <td>${eq.currentHours}h</td>
            <td>${eq.lastServiceDate}</td>
            <td class="${statusClass}">${hoursUntilService}h</td>
            <td>${eq.fuelLevel || 0}L / ${eq.fuelCapacity || 0}L (${fuelPercent}%)</td>
            <td class="${statusClass}">${hoursUntilService <= 0 ? "Zakasnio" : hoursUntilService <= 50 ? "Upozorenje" : "Dobar"}</td>
          </tr>
        `;
      });
      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    // Service History Section
    if (enabledSections.find((s) => s.id === "services")) {
      html += `
        <div class="section">
          <div class="section-title">Istorija Servisa</div>
          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Oprema</th>
                <th>Tip Servisa</th>
                <th>Tehničar</th>
                <th>Sati</th>
                <th>Cijena</th>
              </tr>
            </thead>
            <tbody>
      `;
      const sortedServices = [...appState.serviceRecords].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      sortedServices.forEach((service) => {
        const equipment = appState.equipment.find((eq) => eq.id === service.equipmentId);
        html += `
          <tr>
            <td>${service.date}</td>
            <td>${equipment?.displayName || "N/A"}</td>
            <td>${service.serviceType}</td>
            <td>${service.technician}</td>
            <td>${service.hoursAtService}h</td>
            <td>€${service.cost.toFixed(2)}</td>
          </tr>
        `;
      });
      const totalServiceCost = appState.serviceRecords.reduce((sum, s) => sum + s.cost, 0);
      html += `
            </tbody>
            <tfoot>
              <tr>
                <th colspan="5" style="text-align: right;">Ukupno:</th>
                <th>€${totalServiceCost.toFixed(2)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    }

    // Fuel Logs Section
    if (enabledSections.find((s) => s.id === "fuel")) {
      html += `
        <div class="section">
          <div class="section-title">Evidencija Goriva</div>
          <table>
            <thead>
              <tr>
                <th>Datum</th>
                <th>Oprema</th>
                <th>Litara</th>
                <th>Cijena/L</th>
                <th>Ukupno</th>
                <th>Sati</th>
              </tr>
            </thead>
            <tbody>
      `;
      const sortedFuel = [...appState.fuelLogs].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
      );
      sortedFuel.forEach((fuel) => {
        const equipment = appState.equipment.find((eq) => eq.id === fuel.equipmentId);
        html += `
          <tr>
            <td>${fuel.date}</td>
            <td>${equipment?.displayName || "N/A"}</td>
            <td>${fuel.litersAdded.toFixed(1)}L</td>
            <td>€${fuel.costPerLiter.toFixed(2)}</td>
            <td>€${fuel.totalCost.toFixed(2)}</td>
            <td>${fuel.hoursAtFueling}h</td>
          </tr>
        `;
      });
      const totalFuelCost = appState.fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);
      const totalLiters = appState.fuelLogs.reduce((sum, f) => sum + f.litersAdded, 0);
      html += `
            </tbody>
            <tfoot>
              <tr>
                <th colspan="2" style="text-align: right;">Ukupno:</th>
                <th>${totalLiters.toFixed(1)}L</th>
                <th></th>
                <th>€${totalFuelCost.toFixed(2)}</th>
                <th></th>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    }

    // Lubrication Schedule Section
    if (enabledSections.find((s) => s.id === "lubrication")) {
      html += `
        <div class="section">
          <div class="section-title">Raspored Podmazivanja</div>
          <table>
            <thead>
              <tr>
                <th>Oprema</th>
                <th>Lokacija</th>
                <th>Frekvencija</th>
                <th>Zadnje Urađeno</th>
                <th>Sljedeće</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
      `;
      appState.lubricationPoints.forEach((point) => {
        const equipment = appState.equipment.find((eq) => eq.id === point.equipmentId);
        const statusClass =
          point.status === "overdue"
            ? "status-critical"
            : point.status === "due"
              ? "status-warning"
              : "status-good";
        html += `
          <tr>
            <td>${equipment?.displayName || "N/A"}</td>
            <td>${point.name}</td>
            <td>${point.frequency === "daily" ? "Dnevno" : point.frequency === "weekly" ? "Sedmično" : "Mjesečno"}</td>
            <td>${point.lastCompleted || "N/A"}</td>
            <td>${point.nextDue}</td>
            <td class="${statusClass}">${point.status === "overdue" ? "Zakasnio" : point.status === "due" ? "Upozorenje" : "Dobar"}</td>
          </tr>
        `;
      });
      html += `
            </tbody>
          </table>
        </div>
      `;
    }

    // Inventory Section
    if (enabledSections.find((s) => s.id === "inventory")) {
      html += `
        <div class="section">
          <div class="section-title">Inventar Rezervnih Dijelova</div>
          <table>
            <thead>
              <tr>
                <th>Dio</th>
                <th>Broj Dijela</th>
                <th>Na Lageru</th>
                <th>Minimum</th>
                <th>Cijena</th>
                <th>Ukupna Vrijednost</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
      `;
      appState.spareParts.forEach((part) => {
        const totalValue = part.currentStock * part.price;
        const statusClass =
          part.currentStock === 0
            ? "status-critical"
            : part.currentStock <= part.minimumLevel
              ? "status-warning"
              : "status-good";
        html += `
          <tr>
            <td>${part.name}</td>
            <td>${part.partNumber}</td>
            <td>${part.currentStock}</td>
            <td>${part.minimumLevel}</td>
            <td>€${part.price.toFixed(2)}</td>
            <td>€${totalValue.toFixed(2)}</td>
            <td class="${statusClass}">${part.currentStock === 0 ? "Nema" : part.currentStock <= part.minimumLevel ? "Nisko" : "Dobro"}</td>
          </tr>
        `;
      });
      const totalInventoryValue = appState.spareParts.reduce(
        (sum, p) => sum + p.currentStock * p.price,
        0,
      );
      html += `
            </tbody>
            <tfoot>
              <tr>
                <th colspan="5" style="text-align: right;">Ukupna Vrijednost:</th>
                <th colspan="2">€${totalInventoryValue.toFixed(2)}</th>
              </tr>
            </tfoot>
          </table>
        </div>
      `;
    }

    // Fuel Stock Section
    if (enabledSections.find((s) => s.id === "fuelStock") && appState.fuelStock) {
      const fuelPercent = (
        (appState.fuelStock.currentLiters / (appState.fuelStock.minimumLevel * 2.5)) *
        100
      ).toFixed(0);
      const statusClass =
        appState.fuelStock.currentLiters < appState.fuelStock.minimumLevel
          ? "status-critical"
          : "status-good";
      html += `
        <div class="section">
          <div class="section-title">Zaliha Goriva na Lokaciji</div>
          <div class="summary-box">
            <div class="summary-item"><strong>Trenutna Zaliha:</strong> <span class="${statusClass}">${appState.fuelStock.currentLiters.toFixed(1)}L</span></div>
            <div class="summary-item"><strong>Minimalna Zaliha:</strong> ${appState.fuelStock.minimumLevel}L</div>
            <div class="summary-item"><strong>Procenat Popunjenosti:</strong> ${fuelPercent}%</div>
            <div class="summary-item"><strong>Status:</strong> <span class="${statusClass}">${appState.fuelStock.currentLiters < appState.fuelStock.minimumLevel ? "Nisko - Potrebno Dopuniti" : "Dobro"}</span></div>
          </div>
        </div>
      `;
    }

    // Summary Section
    if (enabledSections.find((s) => s.id === "summary")) {
      const totalServiceCost = appState.serviceRecords.reduce((sum, s) => sum + s.cost, 0);
      const totalFuelCost = appState.fuelLogs.reduce((sum, f) => sum + f.totalCost, 0);
      const totalLiters = appState.fuelLogs.reduce((sum, f) => sum + f.litersAdded, 0);
      const totalHours = appState.equipment.reduce((sum, eq) => sum + eq.currentHours, 0);
      const avgFuelEfficiency = totalHours > 0 ? totalLiters / totalHours : 0;

      html += `
        <div class="section">
          <div class="section-title">Sažetak i Statistika</div>
          <div class="summary-box">
            <div class="summary-item"><strong>Ukupan Broj Opreme:</strong> ${appState.equipment.length}</div>
            <div class="summary-item"><strong>Ukupno Radnih Sati:</strong> ${totalHours}h</div>
            <div class="summary-item"><strong>Ukupan Broj Servisa:</strong> ${appState.serviceRecords.length}</div>
            <div class="summary-item"><strong>Ukupni Troškovi Servisa:</strong> €${totalServiceCost.toFixed(2)}</div>
            <div class="summary-item"><strong>Ukupno Goriva Potrošeno:</strong> ${totalLiters.toFixed(1)}L</div>
            <div class="summary-item"><strong>Ukupni Troškovi Goriva:</strong> €${totalFuelCost.toFixed(2)}</div>
            <div class="summary-item"><strong>Prosječna Potrošnja Goriva:</strong> ${avgFuelEfficiency.toFixed(2)}L/h</div>
            <div class="summary-item"><strong>Ukupni Troškovi:</strong> €${(totalServiceCost + totalFuelCost).toFixed(2)}</div>
          </div>
        </div>
      `;
    }

    html += `
        <div class="footer">
          <p>AZVIRT Maintenance Tracker - Sistem za Praćenje Održavanja</p>
          <p>Generisano: ${timestamp}</p>
        </div>
      </body>
      </html>
    `;

    return html;
  };

  const handleGeneratePDF = async () => {
    const enabledCount = sections.filter((s) => s.enabled).length;
    if (enabledCount === 0) {
      Alert.alert("Greška", "Molimo odaberite najmanje jednu sekciju za izvještaj");
      return;
    }

    try {
      setLoading(true);

      if (Platform.OS === "web") {
        // For web, generate HTML and open in new window for printing
        const htmlContent = generateHTMLReport();
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          Alert.alert("Uspjeh", "Izvještaj je otvoren u novom prozoru. Koristite Ctrl+P za štampanje.");
        }
      } else {
        // For mobile, we would use react-native-html-to-pdf
        Alert.alert(
          "Info",
          "PDF generisanje na mobilnim uređajima će biti dostupno uskoro. Za sada koristite web verziju.",
        );
      }

      onClose();
    } catch (error) {
      console.error("Error generating PDF:", error);
      Alert.alert("Greška", "Greška pri generisanju izvještaja");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={isOpen} transparent animationType="fade" onRequestClose={onClose}>
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
              Prilagođeni Izvještaj
            </ThemedText>
            <Pressable onPress={onClose} style={styles.closeButton}>
              <ThemedText style={styles.closeButtonText}>✕</ThemedText>
            </Pressable>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            <ThemedText type="default" style={styles.description}>
              Odaberite sekcije koje želite uključiti u PDF izvještaj:
            </ThemedText>

            {sections.map((section) => (
              <View
                key={section.id}
                style={[
                  styles.sectionRow,
                  {
                    backgroundColor: isDark
                      ? "rgba(255, 255, 255, 0.05)"
                      : "rgba(0, 0, 0, 0.03)",
                  },
                ]}
              >
                <ThemedText type="default" style={styles.sectionLabel}>
                  {section.label}
                </ThemedText>
                <Switch
                  value={section.enabled}
                  onValueChange={() => toggleSection(section.id)}
                  trackColor={{ false: "#ccc", true: "#FF9500" }}
                  thumbColor={section.enabled ? "#fff" : "#f4f3f4"}
                />
              </View>
            ))}

            <View style={styles.infoBox}>
              <ThemedText type="default" style={styles.infoText}>
                ℹ️ Izvještaj će sadržati sve podatke iz odabranih sekcija. Za web verziju,
                koristite Ctrl+P za štampanje ili čuvanje kao PDF.
              </ThemedText>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <Pressable
              style={[styles.button, styles.cancelButton]}
              onPress={onClose}
              disabled={loading}
            >
              <ThemedText style={styles.cancelButtonText}>Otkaži</ThemedText>
            </Pressable>
            <Pressable
              style={[styles.button, styles.generateButton, loading && styles.buttonDisabled]}
              onPress={handleGeneratePDF}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <ThemedText style={styles.generateButtonText}>Generiši PDF</ThemedText>
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
    maxWidth: 500,
    maxHeight: "85%",
    borderRadius: 16,
    padding: 20,
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
    color: "#FF9500",
  },
  content: {
    flex: 1,
    marginBottom: 20,
  },
  description: {
    marginBottom: 16,
    fontSize: 14,
    lineHeight: 20,
  },
  sectionRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
  },
  sectionLabel: {
    flex: 1,
    fontSize: 15,
  },
  infoBox: {
    backgroundColor: "rgba(255, 149, 0, 0.1)",
    borderRadius: 8,
    padding: 12,
    marginTop: 16,
  },
  infoText: {
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    flexDirection: "row",
    gap: 12,
  },
  button: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 48,
  },
  cancelButton: {
    borderWidth: 1,
    borderColor: "#ccc",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
  },
  generateButton: {
    backgroundColor: "#FF9500",
  },
  generateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
