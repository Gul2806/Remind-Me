import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig'; // Import your Firebase config
import { doc, getDoc } from 'firebase/firestore'; // Firestore methods for fetching user data
import { MaterialIcons, FontAwesome } from '@expo/vector-icons'; // Icons

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from Firestore on screen load
    const fetchUserData = async () => {
      const user = auth.currentUser ;
      if (user) {
        const userDocRef = doc(db, 'users', user.uid); // Assuming user data is stored under 'users' collection in Firestore
        const docSnap = await getDoc(userDocRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        } else {
          console.log('No such document!');
        }
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    auth.signOut()
      .then(() => {
        Alert.alert('Logged Out', 'You have been logged out successfully.');
        navigation.navigate('Login'); // Redirect to home screen after logout
      })
      .catch((error) => {
        Alert.alert('Error', 'There was an error logging out.');
        console.error(error);
      });
  };

  if (!userData) {
    // If user data is still loading
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Logout Button positioned at the top right */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      {/* Outer Card */}
      <View style={styles.outerCard}>
        

        {/* Profile Image */}
        <Image
          source={{ uri: 'https://img.freepik.com/premium-photo/profile-icon-white-background_941097-162343.jpg' }}
          style={styles.profileImage}
        />
        
        <Text style={styles.profileName}>{userData.nickname || 'Itx-gul'}</Text>

        {/* Inner Card */}
        <View style={styles.innerCard}>
          {/* Info Boxes */}
          <View style={styles.infoBox}>
            <MaterialIcons name="email" size={31} color="#2b7c85" />
            <Text style={styles.infoText}>{userData.email || 'No Email Provided'}</Text>
          </View>

          <View style={styles.infoBox}>
            <FontAwesome name="user" size={31} color="#2b7c85" />
            <Text style={styles.infoText}>Gender: {userData.gender || 'Not Provided'}</Text>
          </View>

          <View style={styles.infoBox}>
            <MaterialIcons name="security" size={31} color="#2b7c85" />
            <Text style={styles.infoText}>Role: {userData.role || 'Not Provided'}</Text>
          </View>

          <View style={styles.infoBox}>
            <FontAwesome name="calendar" size={31} color="#2b7c85" />
            <Text style={styles.infoText}>Account Created At: {userData.createdAt?.toDate().toLocaleString() || 'Not Provided'}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f8fa', // Light background
    justifyContent: 'center',
    alignItems: 'center',
  },
  outerCard: {
    width: '90%',
    height: 600, // Increased height of the outer box
    backgroundColor: '#2b7c85', // Dark color
    borderRadius: 20,
    padding: 15,
    alignItems: 'center',
    justifyContent: 'flex-start',
    shadowColor: '#00bcd4', // Glowing effect color
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 8,
  },
  innerCard: {
    width: '110%', 
    height:"70%",// Full width of the outer card
    backgroundColor: '#59d7ee', // Light color
    borderRadius: 30,
    padding: 10,
    alignItems: 'flex-start', // Align items to the start
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 6,

    marginTop: 10, // Added margin to separate from the username
  },
  profileImage: {
    width: 126, // Increased size of the profile picture
    height: 126,
    borderRadius: 60,
    marginBottom: 10, // Adjusted margin
    borderWidth: 2,
    borderColor: '#ffffff', // Optional: white border for better visibility
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
    elevation: 8,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop:35,
    padding: 1, // Padding for the info box
    marginVertical: 5,
    width: '100%', 
    
    // Full width of the inner card
  },
  infoText: {
    fontSize: 16,
    color: '#2b7c85',
    marginLeft: 10,
    backgroundColor: '#e0f7fa', // Background only for text
    borderRadius: 10,
    padding: 5, // Padding for the text background
    width: '80%', // Set a consistent width for all info texts
  },
  logoutButton: {
    position: 'absolute', // Position the button absolutely
    top: 20, // Distance from the top
    right: 20, // Distance from the right
    backgroundColor: '#59d7ee', // Solid background color
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Glowing effect
  },
  logoutText: {
    color: '#2b7c85',
    fontSize: 20,
    fontWeight: 'bold',
  },
  loadingText: {
    fontSize: 18,
    color: '#2b7c85',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});