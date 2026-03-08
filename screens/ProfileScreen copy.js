import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { auth, db } from '../firebaseConfig'; // Import your Firebase config
import { doc, getDoc } from 'firebase/firestore'; // Firestore methods for fetching user data

export default function ProfileScreen({ navigation }) {
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch user data from Firestore on screen load
    const fetchUserData = async () => {
      const user = auth.currentUser;
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
      <TouchableOpacity 
        style={styles.logoutButton} 
        onPress={handleLogout}
      >
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>

      <Image 
        source={{ uri: 'https://img.freepik.com/premium-photo/profile-icon-white-background_941097-162343.jpg' }} 
        style={styles.profileImage} 
      />
      <Text style={styles.profileName}>{userData.nickname || 'Itx-gul'}</Text>
      <Text style={styles.profileEmail}>{userData.email || 'No Email Provided'}</Text>
      <View style={styles.infoBox}>
        <Text style={styles.infoText}>Gender: {userData.gender || 'Not Provided'}</Text>
        <Text style={styles.infoText}>Role: {userData.role || 'Not Provided'}</Text>
        <Text style={styles.infoText}>User ID: <Text style={styles.userId}>{auth.currentUser.uid}</Text></Text>
        <Text style={styles.infoText}>Account Created At: {userData.createdAt?.toDate().toLocaleString() || 'Not Provided'}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  logoutButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: '#ff3b30',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 20,
    alignSelf: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00b6bc',
    marginBottom: 10,
    textAlign: 'center',
  },
  profileEmail: {
    fontSize: 16,
    color: '#888',
    marginBottom: 20,
    textAlign: 'center',
  },
  infoBox: {
    width: '100%',
    padding: 15,
    backgroundColor: '#e6fbfe',
    borderRadius: 10,
    marginTop: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#00b6bc',
    marginBottom: 5,
  },
  userId: {
    fontWeight: 'bold',
    color: '#ff3b30', // You can choose another color for better visibility
  },
  loadingText: {
    fontSize: 18,
    color: '#00b6bc',
    fontStyle: 'italic',
    textAlign: 'center',
  },
});
