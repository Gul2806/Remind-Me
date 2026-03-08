import React, { useState } from 'react';
import { View, TextInput, Button, Text, Alert, StyleSheet, TouchableOpacity, Image, Dimensions, Platform, ActivityIndicator } from 'react-native';
import { getAuth, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { setDoc, doc } from 'firebase/firestore';
import { Picker } from '@react-native-picker/picker';
import { RadioButton } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window'); // Get screen dimensions for responsiveness

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [role, setRole] = useState('');
  const [gender, setGender] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // Added loading state

  const [patientID, setPatientID] = useState('');  // Add this state for caregivers


  const [userImage] = useState(require('../assets/h.webp')); // Image for user role
  const [caregiverImage] = useState(require('../assets/h.png')); // Image for caregiver role

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrors((prevErrors) => ({ ...prevErrors, email: "Please enter a valid email address." }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, email: '' }));
    }
  };

  const validatePassword = (password) => {
    if (password.length < 6) {
      setErrors((prevErrors) => ({ ...prevErrors, password: "Password must be at least 6 characters." }));
    } else {
      setErrors((prevErrors) => ({ ...prevErrors, password: '' }));
    }
  };

  const handleRegister = async () => {
    if (!email || !password || !nickname || !role || !gender) {
      setErrors((prevErrors) => ({ ...prevErrors, general: "Please fill in all fields." }));
      return;
    }
  
    if (role === 'caregiver' && !patientID) {
      setErrors((prevErrors) => ({ ...prevErrors, general: "Please enter the patient ID." }));
      return;
    }
  
    if (Object.values(errors).some(error => error)) {
      setErrors((prevErrors) => ({ ...prevErrors, general: "Please resolve all errors before submitting." }));
      return;
    }
  
    setLoading(true); // Start loading spinner
  
    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
  
      await sendEmailVerification(user);
  
      // Save the user data in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        email,
        nickname,
        role,
        gender,
        createdAt: new Date(),
        patientID: role === 'caregiver' ? patientID : null,  // Store patientID for caregivers
      });
  
      // If user is a caregiver, create a caregiver-patient mapping in a separate collection
      if (role === 'caregiver' && patientID) {
        await setDoc(doc(db, 'caregiver_patient_map', user.uid), {
          patientID: patientID,  // Linking caregiver with patient
        });
      }
  
      Alert.alert(
        "Welcome!",
        "Registration successful! Please verify your email before logging in.",
        [{ text: "OK", onPress: () => navigation.navigate('Login') }]
      );
  
      // Reset the form after successful registration
      setEmail('');
      setPassword('');
      setNickname('');
      setRole('');
      setGender('');
      setPatientID(''); // Clear patient ID if the user was a caregiver
      setErrors({});
    } catch (err) {
      setErrors((prevErrors) => ({ ...prevErrors, general: err.message }));
    } finally {
      setLoading(false); // Stop loading spinner
    }
  };
  
  return (
    <View style={styles.container}>
      {/* Adjusted Image Placement */}
      <Image source={role === 'caregiver' ? caregiverImage : userImage} style={styles.image} />
      
      <Text style={styles.subtitle}>Keeping you connected to what matters</Text>
      <Text style={styles.createAccount}>Create Account</Text>

      {/* Adjusted Input Containers */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={18} color="#00b6bc" />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            validateEmail(text);
            // Clear general error when user is interacting with the email field
            setErrors((prevErrors) => ({ ...prevErrors, general: '' }));
          }}
          style={styles.input}
          placeholderTextColor="#00b6bc"
        />
      </View>
      {errors.email ? <Text style={styles.errorBox}>{errors.email}</Text> : null}

      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={18} color="#00b6bc" />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            validatePassword(text);
            // Clear general error when user is interacting with the password field
            setErrors((prevErrors) => ({ ...prevErrors, general: '' }));
          }}
          style={styles.input}
          placeholderTextColor="#00b6bc"
        />
      </View>
      {errors.password ? <Text style={styles.errorBox}>{errors.password}</Text> : null}

      <View style={styles.inputContainer}>
        <Ionicons name="person" size={18} color="#00b6bc" />
        <TextInput
          placeholder="Nickname"
          value={nickname}
          onChangeText={(text) => {
            setNickname(text);
            if (!text) setErrors((prevErrors) => ({ ...prevErrors, nickname: "Nickname cannot be empty." }));
            else setErrors((prevErrors) => ({ ...prevErrors, nickname: '' }));
            // Clear general error when user is interacting with the nickname field
            setErrors((prevErrors) => ({ ...prevErrors, general: '' }));
          }}
          style={styles.input}
          placeholderTextColor="#00b6bc"
        />
      </View>
      {errors.nickname ? <Text style={styles.errorBox}>{errors.nickname}</Text> : null}

      <Text style={styles.label}>Select Role</Text>
      <Picker
        selectedValue={role}
        onValueChange={(itemValue) => {
          setRole(itemValue);
          // Clear general error when user is interacting with the role field
          setErrors((prevErrors) => ({ ...prevErrors, general: '' }));
        }}
        style={styles.picker}
      >
        <Picker.Item label="Select role..." value="" />
        <Picker.Item label="User" value="user" />
        <Picker.Item label="Caregiver" value="caregiver" />
      </Picker>
      {errors.role && <Text style={styles.errorBox}>Please select a role.</Text>}
      {role === 'caregiver' && (
  <View style={styles.inputContainer}>
    <Ionicons name="id-card" size={18} color="#00b6bc" />
    <TextInput
      placeholder="Patient ID"
      value={patientID}
      onChangeText={(text) => setPatientID(text)}
      style={styles.input}
      placeholderTextColor="#00b6bc"
    />
  </View>
)}

      <Text style={styles.label}>Gender</Text>
      <RadioButton.Group onValueChange={setGender} value={gender}>
        <View style={styles.radioGroup}>
          <Text style={styles.radioText}>Male</Text>
          <RadioButton value="male" color="#00b6bc" />
          <Text style={styles.radioText}>Female</Text>
          <RadioButton value="female" color="#00b6bc" />
          <Text style={styles.radioText}>Other</Text>
          <RadioButton value="other" color="#00b6bc" />
        </View>
      </RadioButton.Group>
      {errors.general && <Text style={styles.errorBox}>{errors.general}</Text>}

      {/* Register Button or Loading Spinner */}
      <TouchableOpacity onPress={handleRegister} style={styles.registerButton} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Text style={styles.registerButtonText}>Register</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#ffff',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  image: {
    width: width * 0.5,
    height: width * 0.5,
    alignSelf: 'flex-start',
    marginBottom: 20,
    alignSelf: 'center',
  },
  subtitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#59d7ee',
    fontStyle: 'italic',
    textAlign: 'left',
    marginBottom: 20,
  },
  createAccount: {
    fontSize: 17,
    color: '#2b7c85',
    marginBottom: 14,
    fontWeight: 'bold',
    textAlign: 'left',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00b6bc',
    backgroundColor: '#e6fbfe',
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 10,
    width: width * 0.9,
  },
  input: {
    height: 35,
    flex: 1,
    paddingLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  errorBox: {
    fontSize: 11,
    color: '#ff0000',
    marginBottom: 10,
    
  },
  label: {
    fontSize: 16,
    color: '#2b7c85',
    marginBottom: 5,
    fontWeight: 'bold',
  },
  picker: {
    width: '100%',
    marginBottom: 15,
    backgroundColor: '#e6fbfe',
  },
  radioGroup: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 3,
  },
  radioText: {
    fontSize: 14,
    color: '#333',
  },
  registerButton: {
    backgroundColor: '#00b6bc',
    paddingVertical: height * 0.015, // Responsive padding based on screen height
    paddingHorizontal: width * 0.08, // Responsive padding based on screen width
    borderRadius: 10,
    shadowColor: '#00b6bc',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    alignSelf: 'center',
    marginTop: height * 0.03, // Responsive margin top
    width: width * 0.8, // Responsive width
    minWidth: 250, // Minimum width for larger screens
    maxWidth: 350, // Maximum width for smaller screens
  },
  registerButtonText: {
    fontSize: width * 0.045, // Responsive font size
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  
});
