import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { db, auth } from '../firebaseConfig'; // Update with your Firebase config file
import { collection, query, where, onSnapshot, updateDoc, doc, getDocs } from 'firebase/firestore';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation

const PatientRemindersScreen = () => {
  const [activeReminders, setActiveReminders] = useState([]);
  const [pausedReminders, setPausedReminders] = useState([]);
  const [patientId, setPatientId] = useState(null); // State to hold the patient ID
  const navigation = useNavigation(); // Initialize navigation

  useEffect(() => {
    const user = auth.currentUser ;
    const userId = user ? user.uid : null;

    if (!userId) {
      Alert.alert('Error', 'User  not authenticated.');
      return;
    }

    // Fetch the linked patient ID for the caregiver
    const fetchPatientId = async () => {
      const userSnapshot = await getDocs(collection(db, 'users'));
      const userData = userSnapshot.docs.find(doc => doc.id === userId);
      if (userData) {
        setPatientId(userData.data().patientID); // Assuming patientID is stored in user data
      }
    };

    fetchPatientId();

    // Fetch active reminders for the linked patient
    const activeQuery = query(
      collection(db, 'Reminders'),
      where('userId', '==', patientId),
      where('status', '==', 'active'),
      where('repetition', 'in', ['daily', 'weekly', 'monthly']) // Filter for daily, weekly, and monthly reminders
    );

    // Fetch paused reminders for the linked patient
    const pausedQuery = query(
      collection(db, 'Reminders'),
      where('userId', '==', patientId),
      where('status', '==', 'paused'),
      where('repetition', 'in', ['daily', 'weekly', 'monthly']) // Filter for daily, weekly, and monthly reminders
    );

    const unsubscribeActive = onSnapshot(activeQuery, (snapshot) => {
      const reminders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setActiveReminders(reminders);
    });

    const unsubscribePaused = onSnapshot(pausedQuery, (snapshot) => {
      const reminders = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPausedReminders(reminders);
    });

    return () => {
      unsubscribeActive();
      unsubscribePaused();
    };
  }, [patientId]); // Add patientId as a dependency

  const toggleReminderStatus = async (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'paused' : 'active';
    try {
      await updateDoc(doc(db, 'Reminders', id), { status: newStatus });
      Alert.alert('Success', `Reminder has been ${newStatus === 'active' ? 'activated' : 'paused'}.`);
    } catch (error) {
      console.error('Error updating reminder status:', error);
      Alert.alert('Error', 'Could not update reminder status. Please try again.');
    }
  };

  const renderReminder = ({ item, type }) => (
    <View style={styles.reminderContainer}>
      <Text style={styles.reminderText}>
        {item.category} - {item.repetition}
      </Text>
      <Text style={styles.reminderDetailsText}>Description: {item.extraInfo}</Text>
      <Text style={styles.reminderDetailsText}>Status: {item.status}</Text>
      <Text style={styles.reminderDetailsText}>Time: {item.time}</Text>
      <TouchableOpacity
        style={[
          styles.toggleButton,
          type === 'active' ? styles.pauseButton : styles.playButton,
        ]}
        onPress={() => toggleReminderStatus(item.id, item.status)}
      >
        <Text style={styles.toggleButtonText}>
          {type === 'active' ? 'Pause' : 'Activate'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Patient's Reminders</Text>
      <Text style={styles.tagline}>
        Manage the reminders for your linked patient effectively.
      </Text>

      <Text style ={styles.label}>Active Reminders</Text>
      {activeReminders.length > 0 ? (
        <FlatList
          data={activeReminders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderReminder({ item, type: 'active' })}
        />
      ) : (
        <Text style={styles.infoText1}>No active reminders to show.</Text>
      )}

      <Text style={styles.label}>Paused Reminders</Text>
      {pausedReminders.length > 0 ? (
        <FlatList
          data={pausedReminders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => renderReminder({ item, type: 'paused' })}
        />
      ) : (
        <Text style={styles.infoText}>No paused reminders to show.</Text>
      )}

      <Text style={styles.encouragementText}>
        Stay organized and help your patient manage their reminders efficiently.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#e4f4f3',
    flex: 1,
  },
  subtitle: {
    fontSize: 25,
    fontWeight: 'bold',
    color: '#007b7f', // Teal color
    textAlign: 'center',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    color: '#4ba8b8', // Light teal color
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  label: {
    fontSize: 17,
    color: '#007b7f', // Teal color
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  reminderContainer: {
    padding: 15,
    marginVertical: 10,
    backgroundColor: '#f9f6f0',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#007b7f', // Teal border color
  },
  reminderText: {
    fontSize: 16,
    color: '#007b7f', // Teal color
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reminderDetailsText: {
    fontSize: 14,
    color: '#595959',
    fontStyle: 'italic',
    marginBottom: 10,
  },
  toggleButton: {
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    marginTop: 10,
  },
  pauseButton: {
    backgroundColor: '#59d7ee', // Orange color for pause
  },
  playButton: {
    backgroundColor: '#007b7f', // Teal color for play
  },
  toggleButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 15,
  },
  infoText1: {
    fontSize: 17,
    color: '#007b7f', // Teal color
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#4ba8b8', // Light teal color
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 20,
  },
  encouragementText: {
    fontSize: 14,
    color: '#007b7f', // Teal color
    fontStyle: 'italic',
    marginVertical: 20,
    textAlign: 'center',
  },
});

export default PatientRemindersScreen;