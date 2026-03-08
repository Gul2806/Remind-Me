import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Dimensions,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Audio } from 'expo-av';
import ImageViewer from 'react-native-image-zoom-viewer';
import { Calendar } from 'react-native-calendars';

const { width, height } = Dimensions.get('window');

export default function ItemDetailScreen({ route }) {
  const { item } = route.params;
  const [sound, setSound] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  const imageUrls = item.imageUrls.map((url) => ({
    url: `https://uzoegrwmsxdlnkrpfptt.supabase.co/storage/v1/object/public/${url}`,
  }));

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      easing: Easing.out(Easing.ease),
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
          uri: `https://uzoegrwmsxdlnkrpfptt.supabase.co/storage/v1/object/public/${item.audioUrl}`,
        });
        setSound(newSound);
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

  // Enhanced date formatter with watch icon and bold styling
  const renderDateTimeBox = (timestamp, label) => {
    if (!timestamp) return null;

    const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    
    const day = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
    const date = dateObj.getDate();
    const month = dateObj.toLocaleDateString('en-US', { month: 'long' });
    const year = dateObj.getFullYear();
    const time = dateObj.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true 
    });

    return (
      <View style={styles.dateTimeBox}>
        <Text style={styles.dateTimeLabel}>{label}</Text>
        <View style={styles.dateRow}>
          <Ionicons name="calendar" size={20} color="#00b6bc" style={styles.dateIcon} />
          <Text style={styles.dateText}>
            <Text style={styles.boldText}>{day}</Text>, {month} <Text style={styles.boldText}>{date}</Text>, {year}
          </Text>
        </View>
        <View style={styles.timeRow}>
          <Ionicons name="time" size={20} color="#00b6bc" style={styles.timeIcon} />
          <Text style={styles.timeText}>
            <Text style={styles.boldText}>{time}</Text>
          </Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f1f3f5" />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 150 }}>
        <Animated.View style={{ opacity: fadeAnim }}>

          {/* Big Top Image */}
          <TouchableOpacity onPress={() => setModalVisible(true)}>
            <Image
              source={{
                uri: `https://uzoegrwmsxdlnkrpfptt.supabase.co/storage/v1/object/public/${item.imageUrls[0]}`,
              }}
              style={styles.topImage}
              resizeMode="cover"
            />
          </TouchableOpacity>

          {/* Floating Card */}
          <View style={styles.contentCard}>
            <Text style={styles.title}>{item.title}</Text>
            
            <Text style={styles.description}>{item.description}</Text>
            
            {/* Spacer between description and date boxes */}
            <View style={styles.spacer} />

            {/* Created At */}
            {item.createdAt && renderDateTimeBox(item.createdAt, "CREATED ON")}

            {/* Spacer between date boxes */}
            {item.createdAt && item.timestamp && <View style={styles.smallSpacer} />}

            {/* Reminder/Memory Time (timestamp) */}
            {item.timestamp && renderDateTimeBox(item.timestamp, "SCHEDULED FOR")}
          </View>

          {/* Enhanced Calendar Display */}
          {item.timestamp && (
            <View style={styles.calendarContainer}>
              <Text style={styles.calendarTitle}>CALENDAR VIEW</Text>
              <View style={styles.calendarWrapper}>
                <Calendar
                  current={item.timestamp.toDate ? item.timestamp.toDate() : item.timestamp}
                  markedDates={{
                    [new Date(item.timestamp.toDate ? item.timestamp.toDate() : item.timestamp)
                      .toISOString()
                      .split('T')[0]]: {
                      selected: true,
                      selectedColor: '#00b6bc',
                      customStyles: {
                        container: {
                          borderRadius: 12,
                          elevation: 3,
                        },
                        text: {
                          color: 'white',
                          fontWeight: 'bold',
                        }
                      }
                    },
                  }}
                  theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#00b6bc',
                    selectedDayBackgroundColor: '#00b6bc',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#00b6bc',
                    dayTextColor: '#2d3436',
                    textDisabledColor: '#d9d9d9',
                    dotColor: '#00b6bc',
                    selectedDotColor: '#ffffff',
                    arrowColor: '#00b6bc',
                    monthTextColor: '#00b6bc',
                    textDayFontWeight: '500',
                    textMonthFontWeight: 'bold',
                    textDayHeaderFontWeight: '600',
                    textDayFontSize: 16,
                    textMonthFontSize: 18,
                    textDayHeaderFontSize: 14,
                    'stylesheet.calendar.header': {
                      week: {
                        marginTop: 7,
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                      }
                    }
                  }}
                  hideExtraDays
                  disableMonthChange
                  disableArrowLeft
                  disableArrowRight
                  enableSwipeMonths={false}
                />
              </View>
            </View>
          )}
        </Animated.View>
      </ScrollView>

      {/* Bottom Audio Player */}
      {item.audioUrl && (
        <View style={styles.audioPlayer}>
          <TouchableOpacity onPress={playAudio} style={styles.audioButton}>
            <Ionicons
              name={isPlaying ? 'pause-circle' : 'play-circle'}
              size={48}
              color="#2b7c85"
            />
            <Text style={styles.audioText}>{isPlaying ? 'Pause' : 'Play'} Audio</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Image Zoom Modal */}
      <Modal visible={modalVisible} transparent onRequestClose={() => setModalVisible(false)}>
        <ImageViewer
          imageUrls={imageUrls}
          enableSwipeDown
          onSwipeDown={() => setModalVisible(false)}
          backgroundColor="#000"
          renderIndicator={() => null}
        />
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e6fbfe',
  },
  topImage: {
    width: width,
    height: height * 0.4,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  contentCard: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: -40,
    borderRadius: 20,
    padding: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#00b6bc',
    textAlign: 'center',
    marginBottom: 15,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 16,
    color: '#495057',
    lineHeight: 24,
    marginBottom: 5,
    paddingHorizontal: 5,
  },
  spacer: {
    height: 20,
  },
  smallSpacer: {
    height: 12,
  },
  dateTimeBox: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#00b6bc',
  },
  dateTimeLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#868e96',
    marginBottom: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateIcon: {
    marginRight: 10,
  },
  timeIcon: {
    marginRight: 10,
  },
  dateText: {
    fontSize: 17,
    color: '#495057',
  },
  timeText: {
    fontSize: 17,
    color: '#495057',
  },
  boldText: {
    fontWeight: '800',
    color: '#2d3436',
  },
  audioPlayer: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    paddingVertical: 15,
    paddingHorizontal: 25,
    elevation: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  audioButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  audioText: {
    marginLeft: 15,
    fontSize: 18,
    color: '#00b6bc',
    fontWeight: '700',
  },
  calendarContainer: {
    backgroundColor: '#ffffff',
    marginHorizontal: 20,
    marginTop: 25,
    borderRadius: 20,
    padding: 20,
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  calendarTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#868e96',
    textAlign: 'center',
    marginBottom: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  calendarWrapper: {
    borderRadius: 15,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    elevation: 3,
  },
});