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
import { collection, addDoc, getDocs, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import { Picker } from '@react-native-picker/picker';
import * as Notifications from 'expo-notifications';

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
  const [predefinedExtraInfo, setPredefinedExtraInfo] = useState([
    'Remember to stay active.',
    'Drink water every few hours.',
    'Take your medicine at the prescribed times.',
    'Don’t skip your meals.',
  ]);

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
  const formattedDate = selectedDate.toLocaleDateString();

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
      const userId = user ? user.uid : 'guest';
      const reminderData = {
        category: selectedCategory || customCategory,
        time: formattedTime,
        date: selectedRepetition === 'once' ? formattedDate : null,
        repetition: selectedRepetition,
        extraInfo,
        userId,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, 'Reminders'), reminderData);

      let espReminderStatus = 'Reminder was not set on ESP.';
    try {
      await axios.post('http://192.168.10.6/reminder', reminderData);
      espReminderStatus = 'Reminder has been successfully set on ESP!';
    } catch (espError) {
      console.warn('Failed to set reminder on ESP:', espError);
    }

    const notificationTime = new Date(selectedDate);
    notificationTime.setHours(selectedTime.getHours(), selectedTime.getMinutes(), 0);
    await scheduleNotification(
      selectedCategory || customCategory,
      `Reminder: ${extraInfo || selectedCategory || customCategory}`,
      notificationTime
    );

    Alert.alert(
      'Success',
      `Reminder has been set and notification scheduled!\n\n${espReminderStatus}`
    );
  } catch (error) {
    console.error('Error setting reminder:', error);
    Alert.alert('Error', 'Could not set the reminder. Please try again.');
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

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.subtitle}>Remind Me</Text>
      <Text style={styles.tagline}>Keeping you connected to what matters</Text>

      <Text style={styles.infoText1}>
        Set reminders to help you stay on track and take care of what matters the most!
      </Text>

      {/* Reminder Frequency */}
      <Text style={styles.label}>Reminder Frequency</Text>
      <Text style={styles.frequencyText}>Choose how often you would like to be reminded.</Text>
      <Picker
        selectedValue={selectedRepetition}
        onValueChange={(value) => setSelectedRepetition(value)}
        style={styles.picker}
      >
        <Picker.Item label="Once" value="once" />
        <Picker.Item label="Daily" value="daily" />
        <Picker.Item label="Weekly" value="weekly" />
        <Picker.Item label="Monthly" value="monthly" />
      </Picker>
      <Text style={styles.infoText}>Choose a category, set a time, and get reminded at the right moment!</Text>

      {/* Date Selection for Personal Reminders */}
      {selectedRepetition === 'once' && (
        <View>
          <Text style={styles.label}>Select Date</Text>
          <TouchableOpacity style={styles.registerButton} onPress={() => showDateTimePicker('date')}>
            <Text style={styles.registerButtonText}>Pick Date</Text>
          </TouchableOpacity>
          <Text style={styles.timeText}>Selected Date: <Text style={styles.selectedText}>{formattedDate}</Text></Text>
        </View>
      )}

      {/* Time Selection */}
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

      {/* Category Selection */}
      <Text style={styles.label}>Select Category</Text>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value)}
        style={styles.picker}
      >
        {categories.map((category, index) => (
          <Picker.Item label={category.name} value={category.name} key={index} />
        ))}
      </Picker>

      {/* Custom Category */}
      <Text style={styles.label}>Add Custom Category</Text>
      <TextInput
        style={styles.input}
        placeholder="Enter custom category"
        value={customCategory}
        onChangeText={setCustomCategory}
      />
      <TouchableOpacity style={styles.registerButton} onPress={addCustomCategory}>
        <Text style={styles.registerButtonText}>Add Category</Text>
      </TouchableOpacity>

      {/* Label for Extra Information */}
      <Text style={styles.label}>Extra Information</Text>

      {/* Scrollable container for predefined information */}
      <ScrollView style={styles.extraInfoContainer}>
        {predefinedExtraInfo.map((item, index) => (
          <TouchableOpacity key={index} onPress={() => setExtraInfo(item)}>
            <Text style={styles.extraInfoText}>{item}</Text>
          </TouchableOpacity>
        ))}

        {/* Input for custom extra information */}
        <TextInput
          style={styles.input}
          placeholder="Add your own information"
          value={extraInfo}
          onChangeText={setExtraInfo}
        />
      </ScrollView>

      {/* Set Reminder */}
      <TouchableOpacity style={styles.registerButton} onPress={setReminder}>
        <Text style={styles.registerButtonText}>Set Reminder</Text>
      </TouchableOpacity>
      <Text style={styles.encouragementText}>
        Remember, your reminders keep you organized and connected. View them anytime to stay on track!
      </Text>
      {/* View Reminders */}
      <TouchableOpacity
        style={styles.viewButton}
        onPress={() => navigation.navigate('AllRemindersScreen')}
      >
        <Text style={styles.viewButtonText}>View All Reminders</Text>
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
    textAlign: 'center',  // Aligned left as per your request
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
    textAlign: 'left',  // Left align labels
  },
  picker: {
    backgroundColor: '#f9f6f0',
    borderRadius: 10,
    width: '100%',
    marginBottom: 15,  // Added space between picker and next component
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
    marginTop: 10,  // Increased space for visibility
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
    fontSize: 14,
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
    textAlign: 'left',  // Ensures it is aligned left
    marginBottom: 10,
    fontStyle: 'italic',
  },
  infoText1: {
    fontSize: 17,
    color: '#2b7c85',  // Light color that matches your theme
    fontStyle: 'italic',
    textAlign: 'left',  // Align text to the left for better readability
    marginBottom: 20,   // Added margin to create space below the text
  },
  infoText: {
    fontSize: 16,
    color: '#59d7ee',  // Light color that matches your theme
    fontStyle: 'italic',
    textAlign: 'left',  // Align text to the left for better readability
    marginBottom: 20,   // Added margin to create space below the text
  },
  extraInfoText: {
    fontSize: 16,
    color: '#2b7c85',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 10,
    backgroundColor: '#f9f6f0', // Light background for each option
    borderRadius: 5,
  },
  predefinedInfoText: {
    fontSize: 16,
    color: '#2b7c85',  // Light color that matches the theme
    fontWeight: 'normal', // Different from other labels for differentiation
    padding: 10,
    marginVertical: 5,  // Adds some space between multiple text items
    backgroundColor: '#f9f6f0',  // Slight background color to differentiate
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#2b7c85',  // A border matching the color theme
  },
  encouragementText: {
    fontSize: 14,
    color: '#2b7c85',
    fontStyle: 'italic',
    marginVertical: 20,
    textAlign: 'center',
  },
});
