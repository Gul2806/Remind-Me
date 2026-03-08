import React, { useState, useEffect } from 'react';
import { View, Text, Button, Alert, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { getFirestore, updateDoc, doc } from 'firebase/firestore';
import { useRoute } from '@react-navigation/native';
import { db } from '../firebaseConfig';

export default function UpdateReminderScreen() {
  const route = useRoute();
  const { reminder } = route.params;

  const [category, setCategory] = useState(reminder.category);
  const [time, setTime] = useState(reminder.time);
  const [repetition, setRepetition] = useState(reminder.repetition);
  const [extraInfo, setExtraInfo] = useState(reminder.extraInfo);

  const updateReminder = async () => {
    try {
      await updateDoc(doc(db, "Reminders", reminder.id), {
        category,
        time,
        repetition,
        extraInfo,
      });
      Alert.alert('Success', 'Reminder updated successfully!');
    } catch (error) {
      console.error('Error updating reminder:', error);
      Alert.alert('Error', 'Could not update reminder.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Update Reminder</Text>
      
      <Text style={styles.label}>Category</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={category}
          onValueChange={setCategory}
          style={styles.picker}
        >
          <Picker.Item label="Medication" value="Medication" />
          <Picker.Item label="Sleep" value="Sleep" />
          <Picker.Item label="Hydration" value="Hydration" />
        </Picker>
      </View>

      <Text style={styles.label}>Time</Text>
      <TextInput
        style={styles.input}
        value={time}
        onChangeText={setTime}
        placeholder="Reminder Time"
        placeholderTextColor="#999"
      />

      <Text style={styles.label}>Repetition</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={repetition}
          onValueChange={setRepetition}
          style={styles.picker}
        >
          <Picker.Item label="Once" value="once" />
          <Picker.Item label="Daily" value="daily" />
          <Picker.Item label="Weekly" value="weekly" />
          <Picker.Item label="Monthly" value="monthly" />
        </Picker>
      </View>

      <Text style={styles.label}>Extra Info</Text>
      <TextInput
        style={styles.input}
        value={extraInfo}
        onChangeText={setExtraInfo}
        placeholder="Extra Info"
        placeholderTextColor="#999"
      />

      <TouchableOpacity style={styles.updateButton} onPress={updateReminder}>
        <Text style={styles.buttonText}>Update Reminder</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e4f4f3',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2b7c85',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#2b7c85',
    marginBottom: 5,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    padding: 12,
    marginBottom: 15,
    borderColor: '#00b6bc',
    borderRadius: 8,
    backgroundColor: '#fff',
    color: '#333',
    fontSize: 16,
  },
  pickerContainer: {
    borderWidth: 1,
    borderRadius: 8,
    borderColor: '#00b6bc',
    backgroundColor: '#fff',
    marginBottom: 15,
    overflow: 'hidden',
  },
  picker: {
    height: 50,
    color: '#333',
  },
  updateButton: {
    backgroundColor: '#00b6bc',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
