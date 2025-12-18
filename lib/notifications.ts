import * as Notifications from "expo-notifications";

// Configure notification behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function requestNotificationPermissions() {
  try {
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch (error) {
    console.error("Error requesting notification permissions:", error);
    return false;
  }
}

export async function scheduleMaintenanceAlert(
  equipmentName: string,
  hoursUntilService: number
) {
  try {
    if (hoursUntilService <= 0) {
      // Overdue - schedule immediate notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Servis Zakašnjen",
          body: `${equipmentName} trebao bi servis. Kontaktirajte tehničara.`,
          data: { type: "maintenance_overdue", equipment: equipmentName },
          sound: "default",
        },
        trigger: null,
      });
    } else if (hoursUntilService <= 50) {
      // Warning - schedule notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Servis Uskoro",
          body: `${equipmentName} trebao bi servis za ${hoursUntilService} sati.`,
          data: { type: "maintenance_warning", equipment: equipmentName },
          sound: "default",
        },
        trigger: null,
      });
    }
  } catch (error) {
    console.error("Error scheduling maintenance alert:", error);
  }
}

export async function scheduleInventoryAlert(
  partName: string,
  currentStock: number,
  minimumStock: number
) {
  try {
    if (currentStock <= minimumStock) {
      // Critical - schedule immediate notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Kritična Zaliha",
          body: `${partName} je na kritičnoj razini (${currentStock} dostupno).`,
          data: { type: "inventory_critical", part: partName },
          sound: "default",
        },
        trigger: null,
      });
    } else if (currentStock <= minimumStock * 1.5) {
      // Low - schedule notification
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Niska Zaliha",
          body: `${partName} je na niskoj razini (${currentStock} dostupno).`,
          data: { type: "inventory_low", part: partName },
          sound: "default",
        },
        trigger: null,
      });
    }
  } catch (error) {
    console.error("Error scheduling inventory alert:", error);
  }
}

export async function cancelAllNotifications() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error canceling notifications:", error);
  }
}

export async function getScheduledNotifications() {
  try {
    return await Notifications.getAllScheduledNotificationsAsync();
  } catch (error) {
    console.error("Error getting scheduled notifications:", error);
    return [];
  }
}
