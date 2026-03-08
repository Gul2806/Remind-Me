import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Animated } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { supabase } from './supabaseConfig'; 
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { FontAwesome } from '@expo/vector-icons'; 
import { LinearGradient } from 'expo-linear-gradient'; 

const AddMemoryScreen = ({ navigation }) => {
  const [imageUris, setImageUris] = useState([]);
  const [recording, setRecording] = useState();
  const [audioUri, setAudioUri] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  // Animate screen entrance
  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const pickImages = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
    });
    if (!result.canceled) {
      setImageUris(result.assets.map(asset => asset.uri));
    }
  };

  const startRecording = async () => {
    try {
      await Audio.requestPermissionsAsync();
      const { recording } = await Audio.Recording.createAsync(Audio.RecordingOptionsPresets.HIGH_QUALITY);
      setRecording(recording);
    } catch (err) {
      console.error('Failed to start recording', err);
    }
  };

  const stopRecording = async () => {
    await recording.stopAndUnloadAsync();
    setAudioUri(recording.getURI());
    setRecording(null);
  };

  // Upload images to Supabase and return URLs
  const uploadImages = async () => {
    let uploadedUrls = [];
    for (const uri of imageUris) {
      const fileExt = uri.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
      const formData = new FormData();
      formData.append('file', { uri, name: fileName, type: `image/${fileExt}` });

      const { data, error } = await supabase.storage.from('images').upload(fileName, formData);
      if (error) {
        console.error('Error uploading image:', error);
        Alert.alert('Error', 'Failed to upload image');
      } else {
        uploadedUrls.push(data.fullPath);
      }
    }
    return uploadedUrls;
  };

  // Upload audio to Supabase and return URL
  const uploadAudio = async () => {
    if (!audioUri) return null;
    const fileName = `${Date.now()}.m4a`;
    const formData = new FormData();
    formData.append('file', { uri: audioUri, name: fileName, type: 'audio/m4a' });

    const { data, error } = await supabase.storage.from('audio').upload(fileName, formData);
    if (error) {
      console.error('Error uploading audio:', error);
      Alert.alert('Error', 'Failed to upload audio');
      return null;
    }
    return data.fullPath;
  };

  // Save metadata to Firestore
  const saveMetadataToFirestore = async (imageUrls, audioUrl) => {
    const auth = getAuth(); // Get the authentication instance
    const user = auth.currentUser; // Get the currently logged-in user
  
    if (!user) {
      console.error('User not authenticated');
      Alert.alert('Error', 'You must be logged in to save a memory.');
      return;
    }
  
    const memoryData = {
      title,
      description,
      imageUrls, // Array of image URLs
      audioUrl: audioUrl || "", // Empty string if no audio
      userId: user.uid, // Link memory to user
      createdAt: serverTimestamp(), // Firestore timestamp
    };
  
    try {
      await addDoc(collection(db, 'memories'), memoryData);
      console.log('Memory saved to Firestore!');
    } catch (error) {
      console.error('Error saving to Firestore:', error);
      Alert.alert('Error', 'Failed to save memory');
    }
  };

  // Handle Save button
  const handleSave = async () => {
    const imageUrls = await uploadImages();
    const audioUrl = await uploadAudio();
    await saveMetadataToFirestore(imageUrls, audioUrl);
    navigation.goBack();
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}> 
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Title Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter title"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter description"
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Pick Image Button */}
        <TouchableOpacity style={styles.button} onPress={pickImages}>
          <FontAwesome name="image" size={24} color="white" />
          <Text style={styles.buttonText}>Pick Images</Text>
        </TouchableOpacity>

        {/* Display picked images */}
        <View style={styles.imageContainer}>
          {imageUris.map((uri, index) => (
            <Animated.Image key={index} source={{ uri }} style={styles.image} />
          ))}
        </View>

        {/* Recording Button */}
        <TouchableOpacity style={styles.recordButton} onPress={recording ? stopRecording : startRecording}>
          <FontAwesome name={recording ? 'stop-circle' : 'microphone'} size={30} color="white" />
          <Text style={styles.recordText}>{recording ? 'Stop Recording' : 'Start Recording'}</Text>
        </TouchableOpacity>

        {audioUri && <Text style={styles.audioText}>Audio recorded!</Text>}

        {/* Save Memory Button with Gradient */}
        <LinearGradient
          colors={['#2b7c85', '#59d7ee', '#00b6bc']}
          style={styles.saveButton}
        >
          <TouchableOpacity onPress={handleSave} style={styles.saveButtonContent}>
            <FontAwesome name="save" size={24} color="white" />
            <Text style={styles.saveButtonText}>Save Memory</Text>
          </TouchableOpacity>
        </LinearGradient>
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  scrollContainer: { alignItems: 'center' },
  inputContainer: { width: '100%', marginBottom: 20 },
  inputLabel: { fontSize: 16, fontWeight: '600', marginBottom: 5, color: '#333' },
  input: { 
    width: '100%', 
    borderWidth: 1, 
    borderColor: '#ddd', 
    padding: 10, 
    borderRadius: 8, 
    fontSize: 16 
  },
  textArea: { height: 100, textAlignVertical: 'top' },
  button: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#59d7ee', 
    padding: 15, 
    borderRadius: 10, 
    marginVertical: 15, 
    width: '80%', 
    justifyContent: 'center' 
  },
  buttonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 18, 
    marginLeft: 10 
  },
  recordButton: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#2b7c85', 
    padding: 20, 
    borderRadius: 50, 
    marginVertical: 10 
  },
  recordText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 16, 
    marginLeft: 10 
  },
  imageContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'center', 
    marginTop: 10 
  },
  image: { 
    width: 120, 
    height: 120, 
    margin: 5, 
    borderRadius: 10 
  },
  audioText: { 
    fontSize: 14, 
    fontStyle: 'italic', 
    color: '#333', 
    marginVertical: 5 
  },
  saveButton: { 
    width: '100%', 
    borderRadius: 10, 
    marginVertical: 20 
  },
  saveButtonContent: { 
    flexDirection: 'row', 
    alignItems: 'center',   
    justifyContent: 'center', 
    padding: 20 
  },
  saveButtonText: { 
    color: 'white', 
    fontWeight: 'bold', 
    fontSize: 18, 
    marginLeft: 10 
  },
});

export default AddMemoryScreen;
