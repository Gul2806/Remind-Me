import * as Notifications from 'expo-notifications';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    priority: 'high',  
  }),
});

export const scheduleNotification = async (title, message, dateTime) => {
  const triggerTime = new Date(dateTime).getTime() - Date.now();

  if (triggerTime > 0) {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: message,
        priority: 'high',  // Ensure high priority for notifications
      },
      trigger: {
        seconds: Math.ceil(triggerTime / 1000),
      },
    });
  } else {
    console.error('Scheduled time must be in the future.');
  }
};
