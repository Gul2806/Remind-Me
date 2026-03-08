// NotificationService.js
import * as Notifications from 'expo-notifications';

export async function scheduleNotification(reminderDateTime) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: "Reminder",
      body: "It's time for your scheduled activity!",
      data: { data: "goes here" },
    },
    trigger: reminderDateTime,
  });
}
