import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import axios from 'axios';

const WiFiConfigScreen = () => {
    const [ssid, setSSID] = useState('');
    const [password, setPassword] = useState('');

    const updateWiFiCredentials = async () => {
      try {
          const response = await axios.post(
              'http://192.168.43.221/setwifi',
              { 
                  ssid: ssid,
                  password: password 
              },
              {
                  headers: {
                      'Content-Type': 'application/json',
                  },
                  timeout: 5000
              }
          );
          console.log('Response:', response.data);
          Alert.alert('Success', 'WiFi credentials updated!');
      } catch (error) {
          console.error('Error:', error);
          Alert.alert('Error', `Failed to update WiFi: ${error.message}`);
      }
  };

    return (
        <View>
            <TextInput
                placeholder="WiFi SSID"
                value={ssid}
                onChangeText={setSSID}
            />
            <TextInput
                placeholder="WiFi Password"
                secureTextEntry
                value={password}
                onChangeText={setPassword}
            />
            <Button
                title="Update WiFi"
                onPress={updateWiFiCredentials}
            />
        </View>
    );
};

export default WiFiConfigScreen;