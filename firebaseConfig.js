// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getDatabase } from 'firebase/database';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyDf87140uuZ7ObhObegBQXK9zqwmaDlcEU",
  authDomain: "remind-de321.firebaseapp.com",
  databaseURL: "https://remind-de321-default-rtdb.firebaseio.com", // ADD THIS LINE
  projectId: "remind-de321",
  storageBucket: "remind-de321.appspot.com",
  messagingSenderId: "1036199079534",
  appId: "1:1036199079534:web:36a81b1d129152c9f7007f",
  measurementId: "G-G2ZV14WYCD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
const db = getFirestore(app);
const realtimeDb = getDatabase(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// Export all services you need
export { app, db, realtimeDb, auth };  // Added app and realtimeDb to exports