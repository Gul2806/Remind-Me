import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Alert,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Dimensions
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { collection, addDoc, getDocs, serverTimestamp, query, where, doc,setDoc,getDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';
import axios from 'axios';

const { width } = Dimensions.get('window');

export default function ReminderScreen({ navigation }) {
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([
    { name: 'Hydration' },
    { name: 'Exercise' },
    { name: 'Medication' },
    { name: 'Sleep' },
  ]);
  const [customCategory, setCustomCategory] = useState('');
  const [selectedRepetition, setSelectedRepetition] = useState('once');
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [extraInfo, setExtraInfo] = useState('');
  const [role, setRole] = useState('patient'); // Default role  
  const [linkedPatientId, setLinkedPatientId] = useState(null);
  const [linkedPatientNickname, setLinkedPatientNickname] = useState('');
  const [selectedUser , setSelectedUser ] = useState('myself'); // Default to 'myself'
  const [predefinedExtraInfo, setPredefinedExtraInfo] = useState([
    'Remember to stay active.',
    'Drink water every few hours.',
    'Take your medicine at the prescribed times.',
    'Don’t skip your meals.',
  ]);
  const [selectedDays, setSelectedDays] = useState({
    Sunday: false,
    Monday: false,
    Tuesday: false,
    Wednesday: false,
    Thursday: false,
    Friday: false,
    Saturday: false,
  });
  const [linkedPatients, setLinkedPatients] = useState([]);

  useEffect(() => {
    const fetchLinkedPatients = async () => {
      try {
        const caregiverId = auth.currentUser ?.uid;
        const patientsSnapshot = await getDocs(
          query(collection(db, 'Patients'), where('caregiverId', '==', caregiverId))
        );

        const patientsList = patientsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLinkedPatients(patientsList);
      } catch (error) {
        console.error('Error fetching linked patients:', error);
      }
    };

    if (auth.currentUser ) {
      fetchLinkedPatients();
    }
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categorySnapshot = await getDocs(collection(db, 'categories'));
        const categoryList = categorySnapshot.docs.map((doc) => doc.data().name);
        setCategories((prevCategories) => Array.from(new Set([...prevCategories, ...categoryList])));
      } catch (error) {
        console.error('Error fetching categories:', error);
      }
    };
    fetchCategories();
  }, []);

  const formattedTime = selectedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const scheduleNotification = async (title, message, time) => {
    const trigger = new Date(time);
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body: message,
          sound: true,
        },
        trigger,
      });
    } catch (error) {
      console.error('Error scheduling notification:', error);
    }
  };

  const setReminder = async () => {
    try {
      const user = auth.currentUser;
      const userId = selectedUser === 'myself' ? user?.uid : selectedUser; // Caregiver sets a reminder for themselves or a linked patient
  
      const reminderData = {
        category: selectedCategory || customCategory,
        time: formattedTime,
        repetition: selectedRepetition,
        extraInfo,
        userId,
        createdAt: serverTimestamp(),
        status: 'active',
        daysOfWeek:
          selectedRepetition === 'weekly' || selectedRepetition === 'monthly'
            ? Object.keys(selectedDays).filter(day => selectedDays[day])
            : null,
      };
  
      // Add the reminder to the 'Reminders' collection
      const reminderRef = await addDoc(collection(db, 'Reminders'), reminderData);
  
      // Update ReminderIDs document
      await updateReminderIDs(reminderRef.id, 'add');
  
      // Send reminder to ESP device
      let espReminderStatus = 'Reminder was not set on ESP.';
      try {
        const response = await axios.post('http://192.168.10.7/setReminder', reminderData, {
          headers: { 'Content-Type': 'application/json' },
        });
        console.log('Response from ESP:', response.data);
        espReminderStatus = 'Reminder has been successfully set on ESP!';
      } catch (espError) {
        console.warn('Failed to set reminder on ESP:', espError.message);
      }
  
      // Handle caregiver-patient scenario
      if (selectedUser !== 'myself') {
        try {
          const patientResponse = await axios.post('http://192.168.10.7/setReminder', reminderData, {
            headers: { 'Content-Type': 'application/json' },
          });
          console.log('Response for patient device:', patientResponse.data);
        } catch (error) {
          console.error('Failed to send reminder to patient device:', error.message);
        }
      }
  
      // Schedule local notifications
      const notificationTime = new Date(selectedDate);
      notificationTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0);
  
      if (selectedRepetition === 'once') {
        await scheduleNotification(
          selectedCategory || customCategory,
          `Reminder: ${extraInfo || selectedCategory || customCategory}`,
          notificationTime
        );
      } else if (selectedRepetition === 'daily') {
        for (let i = 0; i < 7; i++) {
          const dailyNotificationTime = new Date(notificationTime);
          dailyNotificationTime.setDate(notificationTime.getDate() + i);
          await scheduleNotification(
            selectedCategory || customCategory,
            `Daily Reminder: ${extraInfo || selectedCategory || customCategory}`,
            dailyNotificationTime
          );
        }
      } else if (selectedRepetition === 'weekly') {
        for (let i = 0; i < 4; i++) {
          const weeklyNotificationTime = new Date(notificationTime);
          weeklyNotificationTime.setDate(notificationTime.getDate() + i * 7);
          await scheduleNotification(
            selectedCategory || customCategory,
            `Weekly Reminder: ${extraInfo || selectedCategory || customCategory}`,
            weeklyNotificationTime
          );
        }
      } else if (selectedRepetition === 'monthly') {
        for (let i = 0; i < 3; i++) {
          const monthlyNotificationTime = new Date(notificationTime);
          monthlyNotificationTime.setMonth(notificationTime.getMonth() + i);
          await scheduleNotification(
            selectedCategory || customCategory,
            `Monthly Reminder: ${extraInfo || selectedCategory || customCategory}`,
            monthlyNotificationTime
          );
        }
      }
  
      Alert.alert(
        'Success',
        `Reminder has been set and notifications scheduled!\n\n${espReminderStatus}`
      );
    } catch (error) {
      console.error('Error setting reminder:', error);
      Alert.alert('Error', 'Could not set the reminder. Please try again.');
    }
  };
  
  // Function to update the ReminderIDs document
  const updateReminderIDs = async (reminderId, action) => {
    try {
      const docRef = doc(db, 'MetaData', 'ReminderIDs'); // Use a central document for reminder IDs
      const docSnap = await getDoc(docRef);
  
      let currentIDs = [];
      if (docSnap.exists()) {
        currentIDs = docSnap.data().ids || [];
      }
  
      if (action === 'add') {
        currentIDs.push(reminderId);
      } else if (action === 'remove') {
        currentIDs = currentIDs.filter(id => id !== reminderId);
      }
  
      await setDoc(docRef, { ids: currentIDs }, { merge: true });
    } catch (error) {
      console.error('Error updating ReminderIDs:', error);
    }
  };

  const addCustomCategory = async () => {
    if (customCategory.trim() !== '') {
      try {
        await addDoc(collection(db, 'categories'), { name: customCategory });
        setCategories((prevCategories) => Array.from(new Set([...prevCategories, { name: customCategory }])));
        setCustomCategory('');
        Alert.alert('Success', 'Category added successfully!');
      } catch (error) {
        console.error('Error adding category:', error);
        Alert.alert('Error', 'Could not add category.');
      }
    } else {
      Alert.alert('Error', 'Please enter a category name.');
    }
  };

  const showDateTimePicker = (pickerType) => {
    if (pickerType === 'time') setShowTimePicker(true);
    else setShowDatePicker(true);
  };

  const toggleDaySelection = (day) => {
    setSelectedDays(prev => ({ ...prev, [day]: !prev[day] }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subtitle}>Remind Me</Text>
      <Text style={styles.tagline}>Keeping you connected to what matters</Text>

      <Text style={styles.infoText1}>
        Set reminders to help you stay on track and take care of what matters the most!
      </Text>

      {role === 'caregiver' && (
        <View>
          <Text style={styles.label}>Select Patient</Text>
          <Picker
            selectedValue={selectedUser }
            onValueChange={(value) => setSelectedUser (value)}
            style={styles.picker}
          >
            <Picker.Item label="Myself" value="myself" />
            {linkedPatients.map((patient) => (
              <Picker.Item key={patient.id} label={patient.nickname} value={patient.id} />
            ))}
          </Picker>
        </View>
      )}

      <Text style={styles.label}>Reminder Frequency</Text>
      < Picker
        selectedValue={selectedRepetition}
        onValueChange={(value) => setSelectedRepetition(value)}
        style={styles.picker}
      >
        <Picker.Item label="Once" value="once" />
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Weekly" value="weekly" />
        <Picker.Item label="Monthly" value="monthly" />
      </Picker>

      {selectedRepetition === 'once' && (
        <View>
          <Text style={styles.label}>Select Date</Text>
          <TouchableOpacity style={styles.registerButton} onPress={() => showDateTimePicker('date')}>
            <Text style={styles.registerButtonText}>Pick Date</Text>
          </TouchableOpacity>
          <Text style={styles.timeText}>Selected Date: <Text style={styles.selectedText}>{selectedDate.toLocaleDateString()}</Text></Text>
        </View>
      )}

      <Text style={styles.label}>Select Time</Text>
      <TouchableOpacity style={styles.registerButton} onPress={() => showDateTimePicker('time')}>
        <Text style={styles.registerButtonText}>Pick Time</Text>
      </TouchableOpacity>
      <Text style={styles.timeText}>Selected Time: <Text style={styles.selectedText}>{formattedTime}</Text></Text>

      {showTimePicker && (
        <DateTimePicker
          value={selectedTime}
          mode="time"
          display="default"
          onChange={(e, d) => {
            setShowTimePicker(false);
            if (d) setSelectedTime(d);
          }}
        />
      )}

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display="default"
          onChange={(e, d) => {
            setShowDatePicker(false);
            if (d) setSelectedDate(d);
          }}
        />
      )}

      {selectedRepetition === 'weekly' && (
        <View style={styles.daySelectionContainer}>
          <Text style={styles.label}>Select Days of the Week</Text>
          {Object.keys(selectedDays).map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDays[day] && styles.selectedDayButton,
              ]}
              onPress={() => toggleDaySelection(day)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  selectedDays[day] && styles.selectedDayButtonText,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {selectedRepetition === 'monthly' && (
        <View style={styles.daySelectionContainer}>
          <Text style={styles.label}>Select Days of the Week for Monthly Reminders</Text>
          {Object.keys(selectedDays).map((day) => (
            <TouchableOpacity
              key={day}
              style={[
                styles.dayButton,
                selectedDays[day] && styles.selectedDayButton,
              ]}
              onPress={() => toggleDaySelection(day)}
            >
              <Text
                style={[
                  styles.dayButtonText,
                  selectedDays[day] && styles.selectedDayButtonText,
                ]}
              >
                {day}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      <Text style={styles.label}>Choose a Category</Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(itemValue) => setSelectedCategory(itemValue)}
        style={styles.picker}
      >
        {categories.map((category, index) => (
          <Picker.Item key={index} label={category.name} value={category.name} />
        ))}
      </Picker>

      <TextInput
        style={styles.input}
        placeholder="Add Custom Category"
        value={customCategory}
        onChangeText={setCustomCategory}
      />
      <TouchableOpacity style={styles.registerButton} onPress={addCustomCategory}>
        <Text style={styles.registerButtonText}>Add Category</Text>
      </TouchableOpacity>

      <ScrollView style={styles.extraInfoContainer}>
        {predefinedExtraInfo.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => setExtraInfo(item)}>
            <Text style={styles.extraInfoText}>{item}</Text>
          </TouchableOpacity>
        ))}

        <TextInput
          style={styles.input}
          placeholder="Add your own information"
          value={extraInfo}
          onChangeText={setExtraInfo}
        />
      </ScrollView>

      <TouchableOpacity style={styles.registerButton} onPress={setReminder}>
        <Text style={styles.registerButtonText}>Set Reminder</Text>
      </TouchableOpacity>
    </ScrollView>
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
    color: '#2b7c85',
    textAlign: 'center',  
    marginBottom: 10,
  },
  tagline: {
    fontSize: 15,
    color: '#59d7ee',
    textAlign: 'center',
    marginBottom: 15,
    fontStyle: 'italic',
  },
  label: {
    fontSize: 17,
    color: '#2b7c85',
    marginBottom: 5,
    fontWeight: 'bold',
    textAlign: 'left',  
  },
  picker: {
    backgroundColor: '#f9f6f0',
    borderRadius: 10,
    width: '100%',
    marginBottom: 15, 
  },
  registerButton: {
    backgroundColor: '#00b6bc',
    padding: 10,
    borderRadius: 5,
    width: '90%',
    alignItems: 'center',
    alignSelf: 'center',
    marginVertical: 10,
  },
  registerButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 17,
  },
  viewButton: {
    marginTop: 10,  
    backgroundColor: '#59d7ee',
    padding: 10,
    borderRadius: 5,
    width: '80%',
    alignSelf: 'center',
    alignItems: 'center',
    
  },
  viewButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  input: {
    borderColor: '#2b7c85',
    borderWidth: 1,
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#f9f6f0',
  },
  timeText: {
    fontSize: 16,
    fontStyle: 'italic',
    
    color: '#595959',
    marginTop: 5,
  },
  description: {
    fontSize: 16,
    color: '#2b7c85',
    fontStyle: 'italic',
    textAlign: 'left',
    marginBottom: 15,
  },
  reminderText: {
    fontSize: 16,
    color: '#595959',
    textAlign: 'left', 
    marginBottom: 10,
    fontStyle: 'italic',
  },
  infoText1: {
    fontSize: 17,
    color: '#2b7c85',  
    fontStyle: 'italic',
    textAlign: 'left',  
    marginBottom: 20,  
  },
  infoText: {
    fontSize: 16,
    color: '#59d7ee',  
    fontStyle: 'italic',
    textAlign: 'left',  
    marginBottom: 20,   
  },
  extraInfoText: {
    fontSize: 16,
    color: '#2b7c85',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
    backgroundColor: '#f9f6f0', 
    borderRadius: 5,
  },
  predefinedInfoText: {
    fontSize: 16,
    color: '#2b7c85',  
    fontWeight: 'normal', 
    padding: 10,
    marginVertical: 5,  
    backgroundColor: '#f9f6f0',  
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#2b7c85',  
  },
  encouragementText: {
    fontSize: 14,
    color: '#2b7c85',
    fontStyle: 'italic',
    marginVertical: 20,
    textAlign: 'center',
  },
  daySelectionContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 20,
  },
  dayButton: {
    backgroundColor: '#f1f1f1',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    margin: 5,
  },
  selectedDayButton: {
    backgroundColor: '#6a5acd',
  },
  dayButtonText: {
    fontSize: 14,
    color: '#000',
  },
  selectedDayButtonText: {
    color: '#fff',
  },
});
