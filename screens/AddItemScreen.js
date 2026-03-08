// AddItemScreen.js
import React, { useState, useEffect } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, TextInput, Alert, ScrollView, Animated, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Audio } from 'expo-av';
import { supabase } from './supabaseConfig';
import { db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Ionicons, Feather, MaterialIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const AddItemScreen = ({ navigation }) => {
  const [imageUris, setImageUris] = useState([]);
  const [recording, setRecording] = useState();
  const [audioUri, setAudioUri] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const fadeAnim = useState(new Animated.Value(0))[0];

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const captureImages = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert("Permission required", "Camera access is needed to take photos.");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      setImageUris([...imageUris, result.assets[0].uri]);
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

  const saveMetadataToFirestore = async (imageUrls, audioUrl) => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      Alert.alert('Error', 'You must be logged in to save an item.');
      return;
    }

    const memoryData = {
      title,
      description,
      imageUrls,
      audioUrl: audioUrl || "",
      userId: user.uid,
      createdAt: serverTimestamp(),
    };

    try {
      await addDoc(collection(db, 'Items'), memoryData);
      console.log('Item saved to Firestore!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save item');
    }
  };

  const handleSave = async () => {
    const imageUrls = await uploadImages();
    const audioUrl = await uploadAudio();
    await saveMetadataToFirestore(imageUrls, audioUrl);
    navigation.goBack();
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <BlurView intensity={100} tint="light" style={styles.blurWrapper}>
        <ScrollView contentContainerStyle={styles.content}>
          <Text style={styles.header}>🧠 New Memory Aid</Text>

          <View style={styles.cardContainer}>
  <Text style={styles.label}>Title</Text>
  <TextInput
    style={styles.inputBox}
    value={title}
    onChangeText={setTitle}
    placeholder="Enter item title"
    placeholderTextColor="#7ea7ab"
  />

  <Text style={styles.label}>Description</Text>
  <TextInput
    style={styles.textAreaBox}
    value={description}
    onChangeText={setDescription}
    placeholder="Add a description..."
    placeholderTextColor="#7ea7ab"
    multiline
    numberOfLines={4}
  />
</View>


          <FlatList
            data={imageUris}
            horizontal
            keyExtractor={(uri) => uri}
            renderItem={({ item }) => (
              <Image source={{ uri: item }} style={styles.previewImage} />
            )}
            showsHorizontalScrollIndicator={false}
            style={styles.gallery}
          />

          {audioUri && (
            <Text style={styles.audioStatus}>🎧 Audio attached</Text>
          )}

          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            <Feather name="check-circle" size={24} color="#fff" />
            <Text style={styles.saveText}>Save Item</Text>
          </TouchableOpacity>
        </ScrollView>
      </BlurView>

      {/* Floating Buttons */}
      <TouchableOpacity style={styles.fabLeft} onPress={captureImages}>
        <Ionicons name="camera" size={26} color="#fff" />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.fabRight}
        onPress={recording ? stopRecording : startRecording}
      >
        <MaterialIcons name={recording ? 'stop' : 'keyboard-voice'} size={26} color="#fff" />
      </TouchableOpacity>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#eafafc' },
  blurWrapper: {
    flex: 1,
    padding: 20,
  },
  content: {
    paddingBottom: 100,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2b7c85',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#00b6bc',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  cardContainer: {
    backgroundColor: '#f6ffff',
    borderRadius: 20,
    padding: 20,
    shadowColor: '#00b6bc',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    color: '#2b7c85',
    marginBottom: 8,
    fontWeight: '600',
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
  textAreaBox: {
    backgroundColor: '#ffffff',
    borderRadius: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#2b7c85',
    borderWidth: 1,
    borderColor: '#d6eef0',
    textAlignVertical: 'top',
  },
  
  previewImage: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 10,
  },
  gallery: {
    marginVertical: 10,
    paddingLeft: 10,
  },
  audioStatus: {
    color: '#00b6bc',
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#00b6bc',
    borderRadius: 50,
    padding: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginHorizontal: 40,
  },
  saveText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
    fontWeight: 'bold',
  },
  fabLeft: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: '#59d7ee',
    borderRadius: 30,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    elevation: 5,
  },
  fabRight: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#2b7c85',
    borderRadius: 30,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    elevation: 5,
  },
});

export default AddItemScreen;
