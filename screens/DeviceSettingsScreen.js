import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, StyleSheet, Animated, TextInput } from 'react-native';
import { Audio } from 'expo-av';
import { supabase } from './supabaseConfig'; // Ensure this is set up correctly
import { Feather, MaterialIcons } from '@expo/vector-icons';
import { Animated as RAnimated } from 'react-native';

const DeviceSettingsScreen = ({ navigation }) => {
  const [recording, setRecording] = useState();
  const [audioUri, setAudioUri] = useState(null);
  const [identityText, setIdentityText] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Animation for fade-in
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  // Start recording audio
  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  // Stop recording and save audio URI
  const stopRecording = async () => {
    await recording.stopAndUnloadAsync();
    setAudioUri(recording.getURI());
    setRecording(null);
  };

  // Upload audio to Supabase
  const uploadAudio = async () => {
    if (!audioUri) return null;
    const fileName = `${Date.now()}.m4a`; // Unique file name
    const formData = new FormData();
    formData.append('file', { uri: audioUri, name: fileName, type: 'audio/m4a' });

    const { data, error } = await supabase.storage.from('audio').upload(fileName, formData);
    if (error) {
      console.error('Error uploading audio:', error);
      Alert.alert('Error', 'Failed to upload audio');
      return null;
    }
    return data?.Key; // The file path in Supabase storage
  };

  // Save audio URL (You can modify this to save to Firestore or your own DB)
  const saveAudioData = async (audioUrl) => {
    // Logic to save the audio URL to your database or Firebase (if needed)
    Alert.alert('Success', `Audio uploaded successfully: ${audioUrl}`);
    navigation.goBack(); // Go back after saving/uploading
  };

  // Handle save button press
  const handleSave = async () => {
    const audioUrl = await uploadAudio();
    if (audioUrl) {
      saveAudioData(audioUrl); // Save the URL
    }
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Text style={styles.header}>Device Settings</Text>

      {/* Identity Input */}
      <TextInput
        style={styles.inputBox}
        placeholder="Enter identity information (e.g., name, age)"
        value={identityText}
        onChangeText={setIdentityText}
      />

      {/* Audio Recording Button */}
      <TouchableOpacity
        style={styles.recordButton}
        onPress={recording ? stopRecording : startRecording}
      >
        <MaterialIcons name={recording ? 'stop' : 'keyboard-voice'} size={26} color="#fff" />
        <Text style={styles.recordButtonText}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
      </TouchableOpacity>

      {/* Save Button */}
      {audioUri && (
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Feather name="check-circle" size={24} color="#fff" />
          <Text style={styles.saveText}>Save Audio</Text>
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#eafafc' },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2b7c85',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputBox: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2b7c85',
    borderWidth: 1,
    borderColor: '#d6eef0',
    marginBottom: 20,
  },
  recordButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#00b6bc',
    borderRadius: 50,
    padding: 16,
    marginBottom: 20,
  },
  recordButtonText: {
    color: '#fff',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#00b6bc',
    borderRadius: 50,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
  },
});

export default DeviceSettingsScreen;
