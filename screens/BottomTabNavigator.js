import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

// Import Screens
import HomeScreen from './HomeScreen';
import ProfileScreen from './ProfileScreen';
import MainReminderScreen from './MainReminderScreen';

// Custom Header
const defaultHeader = ({ navigation }) => ({
  headerTitle: () => <Text style={styles.headerTitle}>RemindMe</Text>,
  headerStyle: styles.headerStyle,
  headerLeft: () => (
    <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
      <Ionicons name="arrow-back" size={24} color="#fff" />
    </TouchableOpacity>
  ),
  headerRight: () => (
    <TouchableOpacity onPress={() => navigation.navigate('HomeTab')} style={styles.iconButton}>
      <Ionicons name="home" size={24} color="#fff" />
    </TouchableOpacity>
  ),
});

// Stack Navigator for each Tab
const Stack = createStackNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={defaultHeader} />
    </Stack.Navigator>
  );
}

function ReminderStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Reminders" component={MainReminderScreen} options={defaultHeader} />
    </Stack.Navigator>
  );
}

function ProfileStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Profile" component={ProfileScreen} options={defaultHeader} />
    </Stack.Navigator>
  );
}

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

export default function BottomTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'ReminderTab') {
            iconName = 'notifications';
          } else if (route.name === 'ProfileTab') {
            iconName = 'person';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#59d7ee',
        tabBarInactiveTintColor: '#bbd5d7',
        tabBarStyle: styles.tabBarStyle,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStack} options={{ headerShown: false }} />
      <Tab.Screen name="ReminderTab" component={ReminderStack} options={{ headerShown: false }} />
      <Tab.Screen name="ProfileTab" component={ProfileStack} options={{ headerShown: false }} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#55969d',
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
  tabBarStyle: {
    position: 'absolute',
    backgroundColor: '#55969d',
    borderRadius: 15,
    height: 60,
    bottom: 4,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
});
