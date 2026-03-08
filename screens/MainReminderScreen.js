import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Image, ScrollView, Switch } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // Make sure to install expo vector icons
import * as Notifications from 'expo-notifications';
import CONFIG from './Config'; // Import the config file

const { width } = Dimensions.get('window');

export default function MainScreen({ navigation }) {
  const [activeCard, setActiveCard] = useState(null); // State to track which card is active
  const [isReminderActive, setIsReminderActive] = useState(true); // State for toggle (Pause/Resume)

  // Request notification permissions
  useEffect(() => {
    (async () => {
      const { status } = await Notifications.getPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await Notifications.requestPermissionsAsync();
        if (newStatus !== 'granted') {
          console.error('Notification permissions are not granted!');
        }
      }
    })();
  }, []);
  const toggleReminder = async () => {
    try {
      const action = isReminderActive ? 'pause' : 'play'; 
      const response = await fetch(`http://${CONFIG.ESP_IP}/${action}`);
      if (response.ok) {
        const espStartTime = await response.text(); // Get ESP timer start time
        setIsReminderActive(!isReminderActive); // Toggle state
        console.log(`Reminder ${action}d successfully!`);
        
        if (!isReminderActive) {
          const delay = 120000 - (Date.now() % 120000); // Calculate delay for first notification
          Notifications.scheduleNotificationAsync({
            content: {
              title: 'Device Usage Reminder',
              body: 'Please check your mobile app & device and ensure it is being worn properly.',
            },
            trigger: { seconds: delay / 1000 }, // Schedule first notification
          });
          console.log(`First notification synchronized with ESP.`);
        }
      } else {
        console.error(`Failed to ${action} reminder. Status: ${response.status}`);
      }
    } catch (error) {
      console.error('Error while toggling reminder:', error.message);
    }
  };
  

  useEffect(() => {
    const scheduleNotifications = async () => {
      if (isReminderActive) {
        // Schedule the first notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: 'Device Usage Reminder',
            body: 'Please check your device and ensure it is being worn properly.',
          },
          trigger: { seconds: 3600 * 60, repeats: true }, // Repeat every 2 minutes
        });
        console.log('Notification scheduled every 2 minutes.');
  
        
      } else {
        // Cancel notifications if the reminder is paused
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log('Notifications cancelled.');
      }
    };
  
    scheduleNotifications();
  }, [isReminderActive]);
  

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Image
        source={require('../assets/rem.png')} 
        style={styles.image}
      />
      <Text style={styles.title}>Reminders</Text>
      <Text style={styles.description}>
        Stay on top of your tasks and manage your reminders effectively!
      </Text>

      {/* Reminder Settings Card */}
      <TouchableOpacity
        style={[styles.cardDark, activeCard === 'settings' && styles.cardActive]}
        onPress={() => navigation.navigate('ReminderScreen')}
        onPressIn={() => setActiveCard('settings')}
        onPressOut={() => setActiveCard(null)}
      >
        <Ionicons name="alarm" size={50} color="#fff" />
        <Text style={styles.cardText}>Set your Reminder!</Text>
      </TouchableOpacity>

      <Text style={styles.encouragementText}>
        Keep your life organized and productive!
      </Text>

      {/* Two cards in one row */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[styles.cardLight, activeCard === 'viewAll' && styles.cardActive]}
          onPress={() => navigation.navigate('AllRemindersScreen')}
          onPressIn={() => setActiveCard('viewAll')}
          onPressOut={() => setActiveCard(null)}
        >
          <Ionicons name="settings" size={50} color="#fff" />
          <Text style={styles.cardText}>View All</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.cardLight, activeCard === 'activeReminders' && styles.cardActive]}
          onPress={() => navigation.navigate('ActiveRemindersScreen')}
          onPressIn={() => setActiveCard('activeReminders')}
          onPressOut={() => setActiveCard(null)}
        >
          <Ionicons name="checkmark-circle" size={50} color="#fff" />
          <Text style={styles.cardText}>Active Reminders</Text>
        </TouchableOpacity>
      </View>

      {/* Device Usage Reminder Section */} 
      <View style={styles.reminderSection}>
        <Text style={styles.reminderTitle}>Device Usage Reminder</Text>
        <Text style={styles.reminderDescription}>
          This reminder ensures you are wearing the device and using it as intended. 
          Pause or resume the reminders as needed.
        </Text>
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.cardLight2, { width: width * 0.8, height: 57, backgroundColor: isReminderActive ? '#75b7b9' : '#2f9396' }]}
            onPress={toggleReminder}
          >
            <Ionicons name={isReminderActive ? 'pause' : 'play'} size={28} color="#fff" />
            <Text style={styles.cardText2}>
              {isReminderActive ? 'Pause Reminder' : 'Resume Reminder'}
            </Text>
            <Switch
              trackColor={{ false: "#0a3637", true: "#146c6f" }}
              thumbColor={isReminderActive ? "#d1e7e7" : "#f4f3f4"}
              onValueChange={toggleReminder}
              value={isReminderActive}
            />
          </TouchableOpacity>
          <Text style={styles.toggleStatus}>
            Status: {isReminderActive ? 'Active' : 'Paused'}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    justifyContent: 'flex-start',
    alignItems: 'center',
    padding: 20,
  },
  image: {
    width: width * 0.8, // 80% of the screen width
    height: undefined, // Maintain aspect ratio
    aspectRatio: 1, // Adjust this value based on the image's aspect ratio
    resizeMode: 'contain', // Adjust the image scaling
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#2b7c85',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    color: '#595959',
    textAlign: 'center',
    marginBottom: 20,
  },
  cardDark: {
    backgroundColor: '#19888b', // Dark teal color
    width: width * 0.9, // Full width with some padding
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardLight: {
    backgroundColor: '#00acb2', // Light teal color
    width: (width * 0.9) / 2 - 10, // Half width minus margin
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginVertical: 10,
    flexDirection: 'column',
    justifyContent: 'center',
    elevation: 5, // For Android shadow
    shadowColor: '#000', // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cardActive: {
    borderColor: '#00ffcc', // Glowing effect color
    borderWidth: 2,
    shadowColor: '#2f9396', // Glowing shadow color
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    backgroundColor: '#2f9396', // Keep the background color consistent
  },
  cardText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginTop: 10,
  },
  encouragementText: {
    fontSize: 16,
    color: '#2b7c85',
    textAlign: 'center',
    marginVertical: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  reminderSection: {
    marginTop: 20,
    width: '100%',
    backgroundColor: '#f0fafa', // Subtle background
    padding: 15,
    borderRadius: 10,
    borderColor: '#19888b', // Theme border color
    borderWidth: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  reminderTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#19888b', // Theme text color
    marginBottom: 10,
  },
  reminderDescription: {
    fontSize: 16,
    color: '#595959', // Subtle description text color
    marginBottom: 15,
  },
  toggleContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardLight2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#75b7b9', // Light cyan for active reminder
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 5,
    marginBottom: 10,
    width: '100%',
    height: 57,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cardText2: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  toggleStatus: {
    fontSize: 16,
    color: '#333',
    marginTop: 5,
  },
});
