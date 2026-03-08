import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, Image, Animated } from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';
import animatedImage from '../assets/memoryvalut.jpg';
import placeholderImage from '../assets/placeholder.gif';
import * as Notifications from 'expo-notifications';

export default function MemoryVaultScreen() {
  const [memories, setMemories] = useState([]);
  const [fadeAnim] = useState(new Animated.Value(0)); // Animation state
  const [imageAnim] = useState(new Animated.Value(0)); // Animation for title image
  const navigation = useNavigation();

  useEffect(() => {
    const fetchMemories = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;
        if (!user) return;

        const q = query(collection(db, 'memories'), where('userId', '==', user.uid));
        const querySnapshot = await getDocs(q);

        const memoryList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setMemories(memoryList);

        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }).start();

        Animated.timing(imageAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }).start();
      } catch (error) {
        console.error('Error fetching memories:', error);
      }
    };

    fetchMemories();
  }, []);


  
  useEffect(() => {
    if (memories.length > 0) {
      scheduleDailyMemoryNotification();
    }
  }, [memories]);

  const scheduleDailyMemoryNotification = async () => {
    const randomMemory = memories[Math.floor(Math.random() * memories.length)];
    if (!randomMemory) return;

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Memory Recall!",
        body: `Remember: ${randomMemory.title}`,
        sound: true,
      },
      trigger: { hour: 10, minute: 0, repeats: true }, // Adjust time as needed
    });
  };

  return (
    <View style={styles.container}>
      <Animated.Image
        source={animatedImage}
        style={[styles.animatedImage, { opacity: imageAnim }]}
      />
      <Text style={styles.header}>Memory Vault</Text>
      <Animated.View style={{ opacity: fadeAnim }}>
        <FlatList
          data={memories}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.memoryItem}
              onPress={() => navigation.navigate('MemoryDetailScreen', { memory: item })}
            >
              <MaterialIcons name="memory" size={24} color="#004d61" style={styles.memoryIcon} />
              <Image source={item.imageUrl ? { uri: item.imageUrl } : placeholderImage} style={styles.memoryImage} />
              <View style={styles.memoryTextContainer}>
                <Text style={styles.memoryTitle}>{item.title}</Text>
                <Text style={styles.memoryDescription}>{item.description || 'No description available'}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      </Animated.View>
      
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('AddMemoryScreen')}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#ffff' },
  animatedImage: { width: '100%', height: 240, resizeMode: 'contain', marginBottom: 10 },
  header: { fontSize: 26, fontWeight: 'bold', color: '#004d61', textAlign: 'center', marginBottom: 20 },
  memoryItem: { flexDirection: 'row', alignItems: 'center', padding: 15, backgroundColor: '#e0f7fa', borderRadius: 12, marginBottom: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4, elevation: 5 },
  memoryIcon: { marginRight: 10 },
  memoryImage: { width: 60, height: 60, borderRadius: 10, marginRight: 15 },
  memoryTextContainer: { flex: 1 },
  memoryTitle: { fontSize: 18, fontWeight: 'bold', color: '#004d61' },
  memoryDescription: { fontSize: 14, color: '#007b83', marginTop: 4 },
  fab: { position: 'absolute', right: 20, bottom: 20, backgroundColor: '#007b83', padding: 15, borderRadius: 50, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 4, elevation: 5 },
});
