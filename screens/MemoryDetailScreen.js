import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Easing
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from './LottieView'; // adjust the path accordingly

import ImageViewer from 'react-native-image-zoom-viewer';

const { width, height } = Dimensions.get('window');



export default function MemoryDetailScreen({ route }) {
  const { memory } = route.params;
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStatus, setPlaybackStatus] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const progressAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const imageUrls = memory.imageUrls.map((url) => ({
    url: `https://uzoegrwmsxdlnkrpfptt.supabase.co/storage/v1/object/public/${url}`,
  }));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1500,
      easing: Easing.ease,
      useNativeDriver: true,
    }).start();
  }, []);

  const playAudio = async () => {
    if (isPlaying && sound) {
      await sound.pauseAsync();
      setIsPlaying(false);
      return;
    }
    try {
      if (!sound) {
        const { sound: newSound } = await Audio.Sound.createAsync({
          uri: `https://uzoegrwmsxdlnkrpfptt.supabase.co/storage/v1/object/public/${memory.audioUrl}`,
        });
        setSound(newSound);
        newSound.setOnPlaybackStatusUpdate(setPlaybackStatus);
        await newSound.playAsync();
      } else {
        await sound.playAsync();
      }
      setIsPlaying(true);
    } catch (error) {
      console.error('Error playing audio:', error);
    }
  };

  useEffect(() => {
    return () => {
      if (sound) {
        sound.unloadAsync();
      }
    };
  }, [sound]);

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" />
      <LinearGradient
        colors={['#2b7c85', '#9ee8f5', '#00b6bc']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        locations={[0, 0.5, 1]}
        style={styles.gradientBackground}
      />
      <View style={styles.headerRow}>
        <LottieView
          source={require('../assets/animations/hearbeat.json')}
          autoPlay
          loop
          style={[styles.heartbeat, { transform: [{ scale: 1.5 }] }]}
        />
        <Text style={styles.title}>{memory.title}</Text>
      </View>
      <Animated.View style={[styles.card, { opacity: fadeAnim }]}>
        <Text style={styles.description}>{memory.description}</Text>

        {memory.audioUrl && (
          <TouchableOpacity onPress={playAudio} style={styles.audioContainer}>
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={50} color="#fff" />
            <Text style={styles.audioText}>{isPlaying ? 'Pause Memory' : 'Play Memory'}</Text>
          </TouchableOpacity>
        )}

        <FlatList
          data={imageUrls}
          horizontal
          keyExtractor={(item, index) => index.toString()}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item, index }) => (
            <TouchableOpacity onPress={() => {
              setSelectedImageIndex(index);
              setModalVisible(true);
            }}>
              <Image source={{ uri: item.url }} style={styles.imageCarousel} />
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.carouselContainer}
        />
      </Animated.View>

      <Modal visible={modalVisible} transparent onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalBackground}>
          <ImageViewer
            imageUrls={imageUrls}
            index={selectedImageIndex}
            enableSwipeDown
            onSwipeDown={() => setModalVisible(false)}
            renderIndicator={() => null}
          />
        </View>
      </Modal>
      {/* Animated Line Divider */}
<LottieView
  source={require('../assets/animations/line.json')} 
  autoPlay
  loop
  style={{ width: '100%', height: 9 }}
/>

  

  


      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#00b6bc',
  },
  gradientBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 70,
  },
  heartbeat: {
    width: 200,
    height: 200,
    marginRight: -40,
    marginTop:-50,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: '#ffffff',
    marginTop: 0,
    
    marginRight: 50,
  },
  description: {
    fontSize: 18,
    color: '#fff',
    textAlign: 'center',
    marginVertical: 15,
    lineHeight: 22,
  },
  audioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#59d7ee',
    paddingVertical: 12,
    paddingHorizontal: 25,
    borderRadius: 50,
    marginVertical: 20,
    elevation: 5,
  },
  audioText: {
    color: '#fff',
    fontSize: 20,
    marginLeft: 10,
  },
  carouselContainer: {
    paddingVertical: 10,
  },
  imageCarousel: {
    width: width * 0.7,
    height: height * 0.35,
    borderRadius: 20,
    marginRight: 20,
    transform: [{ scale: 1.05 }],
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 10,
    elevation: 10,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  animatedLine: {
    width: '100%',
    height: 5,
    marginTop: 200, // Adjust this value to increase spacing from images
  },
  
});
