// services/firebaseService.js
import { firestore } from '../firebaseConfig';

export const saveReminderToFirestore = async (reminderMessage, reminderTime, userToken) => {
  const reminderRef = firestore.collection('reminders').doc();
  await reminderRef.set({
    message: reminderMessage,
    reminderTime: reminderTime,
    fcmToken: userToken,
    createdAt: new Date(),
  });
};
