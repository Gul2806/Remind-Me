import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function CaregiverReminderScreen({ route }) {
  const { type } = route.params; // 'caregiver' or 'user'
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid;

    if (userId) {
      const reminderRef = collection(db, 'reminders');
      const q = query(reminderRef, where('userId', '==', userId), where('type', '==', type));
      getDocs(q).then((querySnapshot) => {
        const reminderList = [];
        querySnapshot.forEach((doc) => {
          reminderList.push({ id: doc.id, ...doc.data() });
        });
        setReminders(reminderList);
      });
    }
  }, [type]);

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>{type === 'caregiver' ? 'My Reminders' : 'Patient Reminders'}</Text>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.reminderItem}>
            <Text style={styles.reminderText}>{item.title}</Text>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00b6bc',
    marginBottom: 20,
  },
  reminderItem: {
    padding: 15,
    backgroundColor: '#f9f9f9',
    marginBottom: 10,
    borderRadius: 10,
  },
  reminderText: {
    fontSize: 18,
    color: '#333',
  },
});
