import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, TouchableOpacity, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Screens
import LoginScreen from './screens/LoginScreen';
import RegisterScreen from './screens/RegisterScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import HomeScreen from './screens/HomeScreen';
import MainReminderScreen from './screens/MainReminderScreen';
import ProfileScreen from './screens/ProfileScreen';
import ReminderScreen from './screens/ReminderScreen';
import AllRemindersScreen from './screens/AllRemindersScreen';
import UpdateReminderScreen from './screens/UpdateReminderScreen';
import ActiveRemindersScreen from './screens/ActiveRemindersScreen';
import CaregiverReminderScreen from './screens/CaregiverReminderScreen';
import PatientRemindersScreen from './screens/PatientRemindersScreen';
import SequentialTaskGuideScreen from './screens/SequentialTaskGuideScreen';
import CreateTaskScreen from './screens/CreateTaskScreen';
import TaskDetailScreen from './screens/TaskDetailScreen';
import UpdateTaskScreen from './screens/UpdateTaskScreen';
import MemoryVaultScreen from './screens/MemoryVaultScreen';
import AddMemoryScreen from './screens/AddMemoryScreen';
import MemoryDetailScreen from './screens/MemoryDetailScreen';
import LocationTrackingScreen from './screens/LocationTrackingScreen';
import GeofencingScreen from './screens/GeofencingScreen';
import BottomTabNavigator from './screens/BottomTabNavigator';
import AddItemScreen from './screens/AddItemScreen';
import ItemListScreen from './screens/ItemListScreen';
import ItemDetailScreen from './screens/ItemDetailScreen';
import EditItemScreen from './screens/EditItemScreen';
import WiFiConfigScreen from './screens/WiFiConfigScreen';
import DeviceSettingsScreen from './screens/DeviceSettingsScreen';
import DestinationModal from './screens/DestinationModal';







SplashScreen.preventAutoHideAsync();

const Stack = createStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const loginStatus = await AsyncStorage.getItem('@isLoggedIn');
        setIsLoggedIn(loginStatus === 'true');
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    const configureNotifications = () => {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowAlert: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
    };

    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      Alert.alert('Notification', notification.request.content.body || 'You have a new notification!');
    });
 
    configureNotifications();
    prepareApp();

    return () => subscription.remove();
  }, []);

  if (!appIsReady) {
    return null;
  }

  const defaultHeader = ({ navigation }) => ({
    headerTitle: () => <Text style={styles.headerTitle}>RemindMe</Text>,
    headerStyle: styles.headerStyle,
    headerLeft: () => (
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
    ),
    headerRight: () => (
      <TouchableOpacity
        onPress={() => {
          navigation.reset({
            index: 0,
            routes: [{ name: 'BottomTabNavigator' }],
          });
        }}
        style={styles.iconButton}
      >
        <Ionicons name="home" size={24} color="#fff" />
      </TouchableOpacity>
    ),
  });

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName='Login'>
        {isLoggedIn ? (
          // If logged in, show the Bottom Tab Navigator
          <Stack.Screen 
            name="BottomTabNavigator" 
            component={BottomTabNavigator} 
            options={{ headerShown: false }} 
          />
        ) : (
          // If not logged in, show the Login screen
          <Stack.Screen 
            name="Login" 
            component={LoginScreen} 
            options={{ headerShown: false }} 
          />
        )}

        {/* Other Screens */}
       <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} options={defaultHeader} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} options={defaultHeader} />
        <Stack.Screen name="MainReminderScreen" component={MainReminderScreen} options={defaultHeader} />
        <Stack.Screen name="ReminderScreen" component={ReminderScreen } options={defaultHeader} />
        <Stack.Screen name="ProfileScreen" component={ProfileScreen} options={defaultHeader} />
        <Stack.Screen name="AllRemindersScreen" component={AllRemindersScreen} options={defaultHeader} />
        <Stack.Screen name="UpdateReminderScreen" component={UpdateReminderScreen} options={defaultHeader} />
        <Stack.Screen name="ActiveRemindersScreen" component={ActiveRemindersScreen} options={defaultHeader} />
        <Stack.Screen name="CaregiverReminderScreen" component={CaregiverReminderScreen} options={defaultHeader} />
        <Stack.Screen name="PatientRemindersScreen" component={PatientRemindersScreen} options={defaultHeader} />
        <Stack.Screen name="SequentialTaskGuideScreen" component={SequentialTaskGuideScreen} options={defaultHeader} />
        <Stack.Screen name="CreateTaskScreen" component={CreateTaskScreen} options={defaultHeader} />
        <Stack.Screen name="TaskDetailScreen" component={TaskDetailScreen} options={defaultHeader} />
        <Stack.Screen name="UpdateTaskScreen" component={UpdateTaskScreen} options={defaultHeader} />
        <Stack.Screen name="MemoryVaultScreen" component={MemoryVaultScreen} options={defaultHeader} />
        <Stack.Screen name="AddMemoryScreen" component={AddMemoryScreen} options={defaultHeader} />
        <Stack.Screen name="MemoryDetailScreen" component={MemoryDetailScreen} options={defaultHeader} />
        <Stack.Screen name="LocationTrackingScreen" component={LocationTrackingScreen} options={defaultHeader} />
        <Stack.Screen name="GeofencingScreen" component={GeofencingScreen} options={defaultHeader} />
        <Stack.Screen name="AddItemScreen" component={AddItemScreen} options={defaultHeader} />
        <Stack.Screen name="ItemListScreen" component={ItemListScreen} options={defaultHeader} />
        <Stack.Screen name="ItemDetailScreen" component={ItemDetailScreen} options={defaultHeader} />
        <Stack.Screen name="EditItemScreen" component={EditItemScreen} options={defaultHeader} />
        <Stack.Screen name="WiFiConfigScreen" component={WiFiConfigScreen} options={defaultHeader}  />
        <Stack.Screen name="DeviceSettingsScreen" component={DeviceSettingsScreen} options={defaultHeader}  />
        <Stack.Screen name="DestinationModal" component={DestinationModal} options={defaultHeader}  />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#55969d', // Background color of the header
    height: 60,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
  },
  iconButton: {
    paddingHorizontal: 15,
  },
});