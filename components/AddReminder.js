import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { addDoc, collection, Timestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { scheduleNotification } from '../utils/notificationHandler';

const AddReminder = () => {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [date, setDate] = useState('');

  const handleAddReminder = async () => {
    const reminder = {
      title,
      message,
      timestamp: Timestamp.fromDate(new Date(date)),
    };

    try {
      await addDoc(collection(db, 'reminders'), reminder);
      await scheduleNotification(title, message, date);
      alert('Reminder added successfully!');
    } catch (error) {
      console.error('Error adding reminder:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Add Reminder</Text>
      <TextInput
        placeholder="Title"
        style={styles.input}
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        placeholder="Message"
        style={styles.input}
        value={message}
        onChangeText={setMessage}
      />
      <TextInput
        placeholder="Date & Time (YYYY-MM-DD HH:mm:ss)"
        style={styles.input}
        value={date}
        onChangeText={setDate}
      />
      <Button title="Add Reminder" onPress={handleAddReminder} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  heading: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
});

export default AddReminder;
