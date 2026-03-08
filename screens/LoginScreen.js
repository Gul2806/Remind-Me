import React, { useState , useEffect} from 'react';
import { View, TextInput, Text, StyleSheet, TouchableOpacity, Image, Dimensions, ActivityIndicator } from 'react-native';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const isLoggedIn = await AsyncStorage.getItem('@isLoggedIn');
        if (isLoggedIn === 'true') {
          navigation.navigate('HomeScreen'); // If logged in, navigate to ReminderScreen
        }
      } catch (e) {
        console.error('Failed to read login state', e);
      }
    };
    checkLoginStatus();
  }, []);

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

  const handleLogin = async () => {
    if (!email || !password) {
      setErrors((prevErrors) => ({ ...prevErrors, general: "Please fill in all fields." }));
      return;
    }

    if (Object.values(errors).some(error => error)) {
      setErrors((prevErrors) => ({ ...prevErrors, general: "Please resolve all errors before submitting." }));
      return;
    }

    setLoading(true);

    try {
      const auth = getAuth();
      await signInWithEmailAndPassword(auth, email, password);
      // Save login state in AsyncStorage
      await AsyncStorage.setItem('@isLoggedIn', 'true');
      navigation.navigate('HomeScreen'); // Navigate to Home screen after successful login
    } catch (err) {
      setErrors((prevErrors) => ({ ...prevErrors, general: err.message }));
      navigation.navigate('Login'); 
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Logo or Image at the top */}
      <Image
        source={require('../assets/loginnn.png')} // Replace with your image path
        style={styles.logo}
      />
      
      {/* Bold and Large Text aligned to the left */}
      <Text style={styles.remindMeText}>REMIND ME</Text>

      {/* Subtitle */}
      <Text style={styles.subtitle}>Keeping you connected to what matters</Text>

      {/* "Login" heading aligned to the left */}
      <Text style={styles.createAccount}>Login</Text>

      {/* Email Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="mail" size={20} color="#00b6bc" />
        <TextInput
          placeholder="Email"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            validateEmail(text);
            setErrors((prevErrors) => ({ ...prevErrors, general: '' }));
          }}
          style={styles.input}
          placeholderTextColor="#00b6bc"
        />
      </View>
      {errors.email ? <Text style={styles.errorBox}>{errors.email}</Text> : null}

      {/* Password Input */}
      <View style={styles.inputContainer}>
        <Ionicons name="lock-closed" size={20} color="#00b6bc" />
        <TextInput
          placeholder="Password"
          secureTextEntry
          value={password}
          onChangeText={(text) => {
            setPassword(text);
            validatePassword(text);
            setErrors((prevErrors) => ({ ...prevErrors, general: '' }));
          }}
          style={styles.input}
          placeholderTextColor="#00b6bc"
        />
      </View>
      {errors.password ? <Text style={styles.errorBox}>{errors.password}</Text> : null}

      {errors.general && <Text style={styles.errorBox}>{errors.general}</Text>}

      {/* Login Button */}
      <TouchableOpacity onPress={handleLogin} style={styles.loginButton} disabled={loading}>
        {loading ? (
          <ActivityIndicator size="large" color="#fff" />
        ) : (
          <Text style={styles.loginButtonText}>Login</Text>
        )}
      </TouchableOpacity>

      {/* Forgot Password Link */}
      <TouchableOpacity onPress={() => navigation.navigate('ForgotPasswordScreen')}>
        <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
      </TouchableOpacity>

      {/* Sign Up Link (more attractive style) */}
      <TouchableOpacity 
        onPress={() => navigation.navigate('Register')} 
        style={styles.signUpButton}
      >
        <Text style={styles.signUpText}>Don't have an account? Sign Up</Text>
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
  logo: {
    width: width * 1,
    height: height * 0.3,
    marginBottom: 4,
    resizeMode: 'contain',
  },
  remindMeText: {
    fontSize: width * 0.1,
    fontWeight: 'bold',
    color: '#2b7c85',
    textAlign: 'left',
    marginBottom: 13,
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
    fontSize: 18,
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
    height: 45,
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
  loginButton: {
    backgroundColor: '#00b6bc',
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.08,
    borderRadius: 10,
    shadowColor: '#00b6bc',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
    alignSelf: 'center',
    marginTop: height * 0.03,
    width: width * 0.8,
    minWidth: 250,
    maxWidth: 350,
  },
  loginButtonText: {
    fontSize: width * 0.049,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  forgotPasswordText: {
    fontSize: 16,
    color: '#2b7c85',
    marginTop: 10,
    textAlign: 'right',  // Align to the right
    width: '100%',  // Take up full width of the container
    paddingRight: 20,  // Padding on the right for spacing
  },
  signUpButton: {
    borderWidth: 2,
    borderColor: '#00b6bc',  // Border color
    backgroundColor: 'transparent',  // No background color
    paddingVertical: height * 0.015,
    paddingHorizontal: width * 0.08,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'center',  // Center align the button horizontally
  },
  signUpText: {
    fontSize: 14,  // Smaller font size
    color: '#CFB53B',  // Text color to match the border
    fontWeight: 'bold',
    textAlign: 'center',  // Center the text inside the button
  },
});
