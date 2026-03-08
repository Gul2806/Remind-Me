import React, { useEffect, useState } from 'react';
import { Alert, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import * as SplashScreen from 'expo-splash-screen';
import * as Notifications from 'expo-notifications';

// Import Screens
import LoginScreen from './screens/LoginScreen';
import HomeScreen from './screens/HomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import ReminderScreen from './screens/ReminderScreen';
import ForgotPasswordScreen from './screens/ForgotPasswordScreen';
import AllRemindersScreen from './screens/AllRemindersScreen';
import UpdateReminderScreen from './screens/UpdateReminderScreen';

SplashScreen.preventAutoHideAsync(); // Prevent the splash screen from auto-hiding

const Stack = createStackNavigator();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepareApp() {
      try {
        // Simulate loading resources (e.g., fonts, assets)
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        setAppIsReady(true);
        await SplashScreen.hideAsync(); // Hide the splash screen once ready
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

    // Listen for local notifications
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      Alert.alert('Notification', notification.request.content.body || 'You have a new notification!');
    });

    configureNotifications();
    prepareApp();

    return () => subscription.remove(); // Cleanup notification listener
  }, []);

  if (!appIsReady) {
    return null; // Return null while the splash screen is visible
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={RegisterScreen} />
        <Stack.Screen name="ForgotPasswordScreen" component={ForgotPasswordScreen} />
        <Stack.Screen name="HomeScreen" component={HomeScreen} />

        <Stack.Screen name="ReminderScreen" component={ReminderScreen} />
        <Stack.Screen name="AllRemindersScreen" component={AllRemindersScreen} />
        <Stack.Screen name="UpdateReminderScreen" component={UpdateReminderScreen} />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#f2f2f2',
  },
});
