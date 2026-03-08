const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.firestore();

// A helper function to create a reminder document
const createReminder = async (reminderData) => {
  const reminderRef = db.collection("reminders").doc();
  await reminderRef.set(reminderData);
  return reminderRef.id;
};

// Function to handle daily reminders
exports.dailyReminder = functions.pubsub.schedule("every 24 hours").onRun(
  async (context) => {
    const currentTime = new Date();
    const remindersSnapshot = await db
      .collection("reminders")
      .where("frequency", "==", "daily")
      .where("time", "<=", currentTime) // Check if reminder time has passed
      .get();

    remindersSnapshot.forEach((doc) => {
      const reminderData = doc.data();
      // Send the reminder notification or handle accordingly
      console.log(`Sending daily reminder: ${reminderData.message}`);
    });
  }
);

// Function to handle weekly reminders
exports.weeklyReminder = functions.pubsub.schedule("every monday 09:00").onRun(
  async (context) => {
    const currentTime = new Date();
    const remindersSnapshot = await db
      .collection("reminders")
      .where("frequency", "==", "weekly")
      .where("time", "<=", currentTime) // Check if reminder time has passed
      .get();

    remindersSnapshot.forEach((doc) => {
      const reminderData = doc.data();
      // Send the reminder notification or handle accordingly
      console.log(`Sending weekly reminder: ${reminderData.message}`);
    });
  }
);

// Function to handle specific date reminders
exports.dateReminder = functions.pubsub.schedule("every day 00:00").onRun(
  async (context) => {
    const currentTime = new Date();
    const remindersSnapshot = await db
      .collection("reminders")
      .where("frequency", "==", "specific")
      .where(
        "date",
        "==",
        currentTime.toISOString().split("T")[0] // Match today's date
      )
      .get();

    remindersSnapshot.forEach((doc) => {
      const reminderData = doc.data();
      // Send the reminder notification or handle accordingly
      console.log(`Sending reminder for specific date: ${reminderData.message}`);
    });
  }
);

// Cloud Function to add a new reminder to Firestore
exports.addReminder = functions.https.onRequest(async (req, res) => {
  const { message, frequency, time, date } = req.body;

  if (!message || !frequency) {
    return res.status(400).send("Missing required fields.");
  }

  const reminderData = {
    message,
    frequency, // 'daily', 'weekly', or 'specific'
    time, // Time of reminder (optional for specific dates)
    date, // Date for specific reminders (optional for daily/weekly)
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
  };

  try {
    const reminderId = await createReminder(reminderData);
    return res.status(200).send({ message: "Reminder created", reminderId });
  } catch (error) {
    return res.status(500).send("Error creating reminder: " + error.message);
  }
});
