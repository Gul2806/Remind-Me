import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Alert } from 'react-native';

const ESP_IP_ADDRESS = 'http://192.168.10.5'; // Replace with your ESP8266 IP address

const App = () => {
  const [ledStatus, setLedStatus] = useState('OFF');
  const [buzzerStatus, setBuzzerStatus] = useState('OFF');

  const toggleLED = async (action) => {
    try {
      const response = await fetch(`${ESP_IP_ADDRESS}/led/${action}`);
      const message = await response.text();
      setLedStatus(action === 'on' ? 'ON' : 'OFF');
      Alert.alert('LED Status', message);
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the ESP8266.');
    }
  };

  const toggleBuzzer = async (action) => {
    try {
      const response = await fetch(`${ESP_IP_ADDRESS}/buzzer/${action}`);
      const message = await response.text();
      setBuzzerStatus(action === 'on' ? 'ON' : 'OFF');
      Alert.alert('Buzzer Status', message);
    } catch (error) {
      Alert.alert('Error', 'Failed to connect to the ESP8266.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>ESP8266 Control</Text>

      <View style={styles.controlContainer}>
        <Text style={styles.label}>LED is: {ledStatus}</Text>
        <View style={styles.buttonRow}>
          <Button title="Turn ON LED" onPress={() => toggleLED('on')} />
          <Button title="Turn OFF LED" onPress={() => toggleLED('off')} />
        </View>
      </View>

      <View style={styles.controlContainer}>
        <Text style={styles.label}>Buzzer is: {buzzerStatus}</Text>
        <View style={styles.buttonRow}>
          <Button title="Turn ON Buzzer" onPress={() => toggleBuzzer('on')} />
          <Button title="Turn OFF Buzzer" onPress={() => toggleBuzzer('off')} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  controlContainer: {
    marginVertical: 20,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  label: {
    fontSize: 18,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default App;
