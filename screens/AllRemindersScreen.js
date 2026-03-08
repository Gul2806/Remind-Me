import React, { useState, useEffect } from 'react';
import { View, Text, Alert, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { getDocs, collection, deleteDoc, doc } from 'firebase/firestore';
import { auth } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import { db } from '../firebaseConfig';

export default function AllRemindersScreen() {
  const [caregiverReminders, setCaregiverReminders] = useState([]);
  const [patientReminders, setPatientReminders] = useState([]);
  const [isCaregiver, setIsCaregiver] = useState(false); // State to check if the user is a caregiver
  const navigation = useNavigation();

  useEffect(() => {
    const fetchReminders = async () => {
      try {
        const user = auth.currentUser ;
        const userId = user ? user.uid : null;

        if (!userId) {
          Alert.alert('Error', 'User  not authenticated.');
          return;
        }

        // Fetch user data
        const userSnapshot = await getDocs(collection(db, "users"));
        const userData = userSnapshot.docs.find(doc => doc.id === userId);

        if (!userData) {
          Alert.alert('Error', 'User  not found.');
          return;
        }

        // Check if the user is a caregiver
        setIsCaregiver(userData.data().role === 'caregiver');

        // Fetch reminders for both caregiver and patient
        const reminderSnapshot = await getDocs(collection(db, "Reminders"));
        
        // Caregiver reminders (own reminders)
        const caregiverReminders = reminderSnapshot.docs
          .filter(doc => doc.data().userId === userId)
          .map(doc => ({ id: doc.id, ...doc.data() }));

        // If the user is a caregiver, fetch reminders for their linked patient
        let patientReminders = [];
        if (isCaregiver) {
          const patientId = userData.data().patientID;

          // Fetch reminders for the associated patient
          patientReminders = reminderSnapshot.docs
            .filter(doc => doc.data().userId === patientId)
            .map(doc => ({ id: doc.id, ...doc.data() }));
        }

        setCaregiverReminders(caregiverReminders);
        setPatientReminders(patientReminders);
      } catch (error) {
        console.error('Error fetching reminders:', error);
        Alert.alert('Error', 'Could not fetch reminders.');
      }
    };

    fetchReminders();
  }, [isCaregiver]);

  const deleteReminder = async (id) => {
    try {
      await deleteDoc(doc(db, "Reminders", id));
      Alert.alert('Success', 'Reminder deleted.');
      setCaregiverReminders(prev => prev.filter(reminder => reminder.id !== id));
      setPatientReminders(prev => prev.filter(reminder => reminder.id !== id));
    } catch (error) {
      console.error('Error deleting reminder:', error);
      Alert.alert('Error', 'Could not delete reminder.');
    }
  };

  const updateReminder = (reminder) => {
    navigation.navigate('UpdateReminderScreen', { reminder });
  };

  return (
    <ScrollView style={styles.container}>
      {/* Caregiver Reminders Section */}
      {isCaregiver && caregiverReminders.length > 0 && (
        <Text style={styles.header}>Caregiver Reminders</Text>
      )}
      {caregiverReminders.length > 0 ? (
        caregiverReminders.map((reminder) => (
          <View key={reminder.id} style={styles.reminderCard}>
            <Text style={styles.reminderText}>Category: {reminder.category}</Text>
            <Text style={styles.reminderText}>Time: {reminder.time}</Text>
            <Text style={styles.reminderText}>Repetition: {reminder.repetition}</Text>
            <Text style={styles.reminderText}>Info: {reminder.extraInfo}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => updateReminder(reminder)}
              >
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteReminder(reminder.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View >
        ))
      ) : (
        <Text style={styles.noRemindersText}>No caregiver reminders set yet.</Text>
      )}

      {/* Patient Reminders Section */}
      {patientReminders.length > 0 && (
        <Text style={styles.header}>Patient Reminders</Text>
      )}
      {patientReminders.length > 0 ? (
        patientReminders.map((reminder) => (
          <View key={reminder.id} style={styles.reminderCard}>
            <Text style={styles.reminderText}>Category: {reminder.category}</Text>
            <Text style={styles.reminderText}>Time: {reminder.time}</Text>
            <Text style={styles.reminderText}>Repetition: {reminder.repetition}</Text>
            <Text style={styles.reminderText}>Info: {reminder.extraInfo}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={styles.updateButton}
                onPress={() => updateReminder(reminder)}
              >
                <Text style={styles.buttonText}>Update</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => deleteReminder(reminder.id)}
              >
                <Text style={styles.buttonText}>Delete</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      ) : (
        <Text style={styles.noRemindersText}>No patient reminders set yet.</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e4f4f3',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 20,
    color: '#333',
  },
  reminderCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 3,
  },
  reminderText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  updateButton: {
    backgroundColor: '#59d7ee',
    padding: 10,
    borderRadius: 5,
  },
  deleteButton: {
    backgroundColor: '#F44336',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  noRemindersText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#888',
  },
});