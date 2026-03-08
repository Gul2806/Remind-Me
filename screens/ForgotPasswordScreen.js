import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Dimensions, Alert } from 'react-native';
import { getAuth, sendPasswordResetEmail } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

export default function ForgotPasswordScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handlePasswordReset = async () => {
    const auth = getAuth();
    if (!email) {
      setError("Please enter an email address.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      Alert.alert("Password reset email sent", "Please check your email to reset your password.");
      navigation.navigate('Login');
    } catch (err) {
      setError("There was an error. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.subtitle}>Reset Your Password</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={18} color="#00b6bc" />
        <TextInput
          placeholder="Enter your email"
          value={email}
          onChangeText={setEmail}
          style={styles.input}
          placeholderTextColor="#00b6bc"
        />
      </View>
      {error && <Text style={styles.errorBox}>{error}</Text>}

      {/* Send Reset Email Button */}
      <TouchableOpacity onPress={handlePasswordReset} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Send Password Reset Email</Text>
      </TouchableOpacity>

      {/* Back to Login Button */}
      <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
        <Text style={styles.backButtonText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#e4f4f3',
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#59d7ee',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#00b6bc',
    backgroundColor: '#f9f6f0',
    borderRadius: 10,
    paddingLeft: 10,
    paddingRight: 10,
    marginBottom: 15,
    width: width * 0.9,
  },
  input: {
    height: 40,
    flex: 1,
    paddingLeft: 10,
    fontSize: 16,
    color: '#333',
  },
  errorBox: {
    fontSize: 12,
    color: '#ff0000',
    marginBottom: 10,
  },
  resetButton: {
    backgroundColor: '#00b6bc',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.08,
    borderRadius: 10,
    marginTop: height * 0.03,
    width: width * 0.8,
    minWidth: 250,
    maxWidth: 350,
    alignSelf: 'center',
  },
  resetButtonText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  backButton: {
    marginTop: height * 0.02,
    alignSelf: 'center',
  },
  backButtonText: {
    fontSize: 14,
    color: '#00b6bc',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
