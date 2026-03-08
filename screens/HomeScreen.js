import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert, Image,ScrollView,Modal,TextInput,Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { doc, getDoc ,firebase} from 'firebase/firestore';
import { realtimeDb } from '../firebaseConfig';
import { ref, onValue } from 'firebase/database';
import DestinationModal from './DestinationModal'; // Adjust path as needed

import * as MailComposer from "expo-mail-composer";
import { FontAwesome } from '@expo/vector-icons';
import moment from 'moment';
import Svg, { Circle, Line } from 'react-native-svg'; // Import SVG elements


const { width } = Dimensions.get('window'); // Get screen width
const AnalogClock = () => {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const radius = 40;
  const centerX = 50;
  const centerY = 50;

  const hourHandLength = radius * 0.5;
  const minuteHandLength = radius * 0.8;
  const secondHandLength = radius * 0.9;

  const hour = time.getHours() % 12;
  const minute = time.getMinutes();
  const second = time.getSeconds();

  const hourAngle = ((hour * 60 + minute) / 720) * 360;
  const minuteAngle = (minute / 60) * 360;
  const secondAngle = (second / 60) * 360;

  const hourHandX = centerX + hourHandLength * Math.sin((hourAngle * Math.PI) / 180);
  const hourHandY = centerY - hourHandLength * Math.cos((hourAngle * Math.PI) / 180);

  const minuteHandX = centerX + minuteHandLength * Math.sin((minuteAngle * Math.PI) / 180);
  const minuteHandY = centerY - minuteHandLength * Math.cos((minuteAngle * Math.PI) / 180);

  const secondHandX = centerX + secondHandLength * Math.sin((secondAngle * Math.PI) / 180);
  const secondHandY = centerY - secondHandLength * Math.cos((secondAngle * Math.PI) / 180);

  return (
    <Svg style={clockStyles.clockSvg} width="100" height="100" viewBox="0 0 100 100">
      <Circle cx={centerX} cy={centerY} r={radius} stroke="#ccc" strokeWidth="2" fill="#e5f7f8" />
      <Line x1={centerX} y1={centerY} x2={hourHandX} y2={hourHandY} stroke="#333" strokeWidth="3" strokeLinecap="round" />
      <Line x1={centerX} y1={centerY} x2={minuteHandX} y2={minuteHandY} stroke="#666" strokeWidth="2" strokeLinecap="round" />
      <Line x1={centerX} y1={centerY} x2={secondHandX} y2={secondHandY} stroke="#00b6bc" strokeWidth="1" strokeLinecap="round" />
      <Circle cx={centerX} cy={centerY} r="2" fill="#00b6bc" />
    </Svg>
  );
};
const clockStyles = StyleSheet.create({  // Define clockStyles here
  clockSvg: {
    // Add any styling you need for the SVG container here
  },
});

const YearProgress = ({ percent }) => (
  <View style={yearProgressStyles.progressBarBackground}>
    <View
      style={[yearProgressStyles.progressBarFill, { width: `${percent}%` }]}
    />
  </View>
);

const yearProgressStyles = StyleSheet.create({
  progressBarBackground: {
    width: '100%',
    height: 10,
    backgroundColor: '#99e1e4',
    borderRadius: 8,
    marginVertical: 8,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: 10,
    backgroundColor: '#00b6bc',
    borderRadius: 8,
  },
});
export default function HomeScreen({ navigation }) {
  const [userRole, setUserRole] = useState(null); // 
  const [loading, setLoading] = useState(true); // Loading state while fetching data
  const [showOptions, setShowOptions] = useState(false);
  const [formVisible, setFormVisible] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [helpMessage, setHelpMessage] = useState("");
  const [nickname, setNickname] = useState('');


  const [showModal, setShowModal] = useState(false);

  // Firebase listener for destination requests
 useEffect(() => {
  const userId = 'SKjObE3R7Fd4q9v6jify4Albi4C2'; // Your user ID
  const userRef = ref(realtimeDb, `Users/${userId}`);

  const unsubscribe = onValue(userRef, (snapshot) => {
    const userData = snapshot.val();
    if (userData && userData.needsDestinationInfo) {
      setShowModal(true);
    }
  });

  return () => unsubscribe();
}, []);

  const [currentTime, setCurrentTime] = useState(moment().format('h:mm A'));
  const [currentDate, setCurrentDate] = useState(
    moment().format('dddd, MMMM D, YYYY')
  );
  const [daysLeft, setDaysLeft] = useState(
    moment().endOf('year').diff(moment(), 'days')
  );
  const [percentOfYear, setPercentOfYear] = useState(0);

  useEffect(() => {
    const calculateYearProgress = () => {
      const now = moment();
      const startOfYear = moment().startOf('year');
      const endOfYear = moment().endOf('year');
      const yearDays = endOfYear.diff(startOfYear, 'days') + 1;
      const daysPassed = now.diff(startOfYear, 'days');
      const percent = ((daysPassed / yearDays) * 100).toFixed(1);
      setPercentOfYear(percent);
    };

    calculateYearProgress(); // Calculate initial value

    const intervalId = setInterval(() => {
      const now = moment();
      setCurrentTime(now.format('h:mm A'));
      setCurrentDate(now.format('dddd, MMMM D, YYYY'));
      setDaysLeft(moment().endOf('year').diff(now, 'days'));
      calculateYearProgress(); // Update year progress
    }, 60000);

    return () => clearInterval(intervalId);
  }, []);

  

  const openForm = (formType) => {
    setSelectedForm(formType);
    setFormVisible(true);
  };

  const TimeDateSection = () => {
    const [currentTime, setCurrentTime] = useState(moment().format('h:mm A'));
    const [currentDate, setCurrentDate] = useState(moment().format('dddd, MMMM D, YYYY'));
    const [daysLeft, setDaysLeft] = useState(moment().endOf('year').diff(moment(), 'days'));
  
    const YearProgress = ({ daysLeft }) => {
      const totalDays = moment().isLeapYear() ? 366 : 365;
      const percent = ((totalDays - daysLeft) / totalDays) * 100;
      return (
        <View style={styles.progressBarBackground}>
          <View style={[styles.progressBarFill, { width: `${percent}%` }]} />
        </View>
      );
    };
    
    const HomeHeader = () => {
      const [currentTime, setCurrentTime] = useState(moment().format('HH:mm'));
      const [daysLeft, setDaysLeft] = useState(moment().endOf('year').diff(moment(), 'days'));
      const [today, setToday] = useState(moment().format('YYYY/MM/DD'));
      const [weekday, setWeekday] = useState(moment().format('dddd'));
    
      useEffect(() => {
        const interval = setInterval(() => {
          setCurrentTime(moment().format('HH:mm'));
          setDaysLeft(moment().endOf('year').diff(moment(), 'days'));
          setToday(moment().format('YYYY/MM/DD'));
          setWeekday(moment().format('dddd'));
        }, 1000);
        return () => clearInterval(interval);
      }, []);
    }}
  
  const sendHelpMessage = async () => {
    if (!helpMessage.trim()) {
      Alert.alert("Error", "Please enter a message before sending.");
      return;
    }

    const emailOptions = {
      recipients: ["gulraiz57575@gmail.com"],
      subject: "Help Desk Inquiry",
      body: helpMessage,
    };

    const isAvailable = await MailComposer.isAvailableAsync();
    if (isAvailable) {
      await MailComposer.composeAsync(emailOptions);
      setHelpMessage(""); 
      setFormVisible(false); // Close modal
      Alert.alert("Success", "Your message has been sent.");
    } else {
      Alert.alert("Error", "Email is not available on this device.");
    }
  };
  useEffect(() => {
    const auth = getAuth();
    const userId = auth.currentUser?.uid; // Get the current user UID
  
    if (userId) {
      const userRef = doc(db, 'users', userId);
  
      getDoc(userRef)
        .then((docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setNickname(userData.nickname || 'User');  // Get username, default to 'User'
            setUserRole(userData.role);  // Get user role
          } else {
            Alert.alert('No user data found');
          }
        })
        .catch((error) => {
          console.error('Error fetching user data: ', error);
          Alert.alert('Error', 'There was an error fetching user data.');
        })
        .finally(() => setLoading(false)); // Set loading to false once data is fetched
    } else {
      setLoading(false); // No user is logged in
      Alert.alert('No user logged in');
    }
  }, []);
  


  if (loading) {
    return <ActivityIndicator size="large" color="#00b6bc" style={styles.loading} />;
  }

  return (
    <ScrollView style={styles.container}>

      {/* Header with Settings Icon */}
      
      
       {/* Settings Icon Button */}
      <TouchableOpacity onPress={() => navigation.navigate('DeviceSettingsScreen')}>
        <Ionicons name="settings" size={30} color="#00b6bc" />
      </TouchableOpacity>
      

      {/* Time and Date Section */}
<View style={styles.timeDateContainer}>
<View style={styles.clockRow}>  
                    <AnalogClock />
                    <View style={styles.timeContainer}> 
                        <Text style={styles.greetingText}>Hello, {nickname}!</Text> 
                        <Text style={styles.currentTimeText}>{currentTime}</Text> 
                    </View>
                </View>

        <Text style={styles.greeting}>Live every day with ease!</Text>

        <View style={styles.dateSection}>
          <Text style={styles.dayName}>{moment().format('dddd')}</Text>
          <Text style={styles.fullDate}>{moment().format('YYYY/MM/DD')}</Text>
        </View>
        <Text style={styles.progressLabel}>The rest of the year</Text>
        <YearProgress percent={percentOfYear} />

        <View style={styles.daysLeftContainer}>
          <Text style={styles.daysLeftText}>Days left this year: {daysLeft}</Text>
        </View>

       
      </View>
      <View style={styles.header}>
        
        <Image
          source={require('../assets/final.png')} // Replace with your actual icon path
          style={styles.iconImage}
        />
        <Text style={styles.heading}>RemindMe</Text>
      </View>
      <Text style={styles.subtitle}>Keeping you connected to what matters</Text>
      <DestinationModal 
        visible={showModal}
        onClose={() => setShowModal(false)}
      />
      

     
      
     
     {/* Three Buttons for Opening Forms */}
     <View style={styles.optionsContainer}>
        <TouchableOpacity style={styles.optionButton} onPress={() => openForm("About Us")}>
          <Text style={styles.optionText}>About Us</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={() => openForm("Help Desk")}>
          <Text style={styles.optionText}>Help Desk</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionButton} onPress={() => openForm("Logout")}>
          <Text style={styles.optionText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {/* Modal Form - Covers Entire Screen */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={formVisible}
        onRequestClose={() => setFormVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.formContainer}>
            <View style={styles.formHeader}>
              <Text style={styles.formTitle}>{selectedForm}</Text>
              <TouchableOpacity onPress={() => setFormVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#fff" />
              </TouchableOpacity>
            </View>

            {/* About Us Section */}
            {selectedForm === "About Us" && (
              <Text style={styles.formContent}>
                Project Name: RemindMe - Cognitive Assistance Bracelet {"\n\n"}
                Project Type: Final Year Capstone Project {"\n\n"}
                University: [University Of Education Lahore Jauhrabad Campus] {"\n\n"}
                Author: Gulraiz Zia {"\n\n"}
                Description: RemindMe is a cognitive assistance device designed to help 
                individuals with memory impairments stay on track with their daily tasks. It provides 
                reminders, location tracking, and emergency alerts to ensure user safety and efficiency.
              </Text>
            )}

            {/* Help Desk Section */}
            {selectedForm === "Help Desk" && (
              <View style={styles.helpContainer}>
                <Text style={styles.formContent}>
                  Need help? Enter your message below, and we will get back to you soon!
                </Text>
                <TextInput
                  style={styles.input}
                  placeholder="Write your message here..."
                  placeholderTextColor="#ddd"
                  multiline
                  value={helpMessage}
                  onChangeText={setHelpMessage}
                />
                <TouchableOpacity style={styles.sendButton} onPress={sendHelpMessage}>
                  <Text style={styles.sendButtonText}>Send Message</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Logout Section */}
            {selectedForm === "Logout" && (
              <View style={styles.logoutContainer}>
                <Text style={styles.formContent}>
                  You are about to log out. Are you sure?
                </Text>
                <TouchableOpacity style={styles.logoutButton} onPress={() => {
                  setFormVisible(false);
                  Alert.alert("Logged Out", "You have been successfully logged out.");
                  // Add actual logout logic here
                }}>
                  <Text style={styles.logoutButtonText}>Logout</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
      


      <View style={styles.divider}>
      <View style={styles.line} />
      <Text style={styles.dividerText}>Reminders</Text>
      <View style={styles.line} />
    </View>


      <View style={styles.remindersContainer}>
        {/* My Reminders Box - Larger */}
        <TouchableOpacity
          style={styles.largeFeatureBox}
          onPress={() => navigation.navigate('MainReminderScreen')}
        >
          <Ionicons name="alarm" size={60} color="#00b6bc" />
          <Text style={styles.featureText}>My Reminders</Text>
          <Text style={styles.featureDescription}>
            Manage all your daily and personal reminders.
          </Text>
        </TouchableOpacity>

        {/* Pyramid Structure - Fixed Alignment */}
        <View style={styles.pyramidContainer}>
          {/* Set Reminders - Centered Properly */}
          <TouchableOpacity style={styles.featureBox} onPress={() => navigation.navigate('ReminderScreen')}>
            <Ionicons name="add-circle" size={50} color="#00b6bc" />
            <Text style={styles.featureText}>Set Reminders</Text>
            
          </TouchableOpacity>

          {/* View All & View Active - Fixed Underneath */}
          <View style={styles.row}>
            <TouchableOpacity style={styles.smallFeatureBox} onPress={() => navigation.navigate('AllRemindersScreen')}>
              <Ionicons name="settings" size={35} color="#00b6bc" />
              <Text style={styles.featureText}>reminder Settings</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.smallFeatureBox} onPress={() => navigation.navigate('ActiveRemindersScreen')}>
              <FontAwesome name="exclamation-circle" size={35} color="#00b6bc" />
              <Text style={styles.featureText}>View Active</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>


      
    
    
      
     
      <View style={styles.featureBoxesInRow}>
  <TouchableOpacity
    style={styles.featureBoxInRow}
    onPress={() => navigation.navigate('SequentialTaskGuideScreen')}
  >
    <Ionicons name="list" size={50} color="#00b6bc" />
    <Text style={styles.featureText}>Task Guide</Text>
    <Text style={styles.featureDescription}>Get step-by-step guidance for important tasks.</Text>
  </TouchableOpacity>
</View>


<View style={styles.divider}>
  <View style={styles.line} />
  <Text style={styles.dividerText}>Item Location Aid</Text>
  <View style={styles.line} />
</View>

<View style={styles.itemLocationAidContainer}>
  {/* Main Box for Viewing Items - Same row as Edit Items */}
  <View style={styles.itemRow}>
    <TouchableOpacity
      style={styles.itemMainBox}
      onPress={() => navigation.navigate('ItemListScreen')}
    >
      <Ionicons name="cube" size={50} color="#fff" />
      <Text style={styles.itemBoxTitle}>My Items</Text>
      <Text style={styles.itemBoxDescription}>View all stored items with locations</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={styles.itemEditBox}
      onPress={() => navigation.navigate('EditItemScreen')}
    >
      <Ionicons name="create" size={40} color="#00b6bc" />
      <Text style={styles.itemEditTitle}>Edit Items</Text>
      <Text style={styles.featureDescription}>
            Manage all stored items as you want 
          </Text>
    </TouchableOpacity>
  </View>

  {/* Add Item Box - Below in a separate row */}
  <TouchableOpacity
    style={styles.itemAddBox}
    onPress={() => navigation.navigate('AddItemScreen')}
  >
    <Ionicons name="add-circle-outline" size={40} color="#00b6bc" />
    <Text style={styles.itemAddTitle}>Add New Item</Text>
    <Text style={styles.featureDescription}>
            add a new item here 
          </Text>
  </TouchableOpacity>
</View>


      
  <>
    
    <View style={styles.divider}>
      <View style={styles.line} />
      <Text style={styles.dividerText}>Memory Vault</Text>
      <View style={styles.line} />
    </View>

    
    <TouchableOpacity
      style={styles.memoryVaultBox}
      onPress={() => navigation.navigate('MemoryVaultScreen')} 
    >
      <Ionicons name="lock-closed" size={50} color="#fff" />
      <Text style={styles.memoryVaultTitle}>Memory Vault</Text>
      <Text style={styles.memoryVaultDescription}>
        Securely store your cherished memories and revisit them anytime.
      </Text>
    </TouchableOpacity>
  </>



  <>
    {/* Existing Location Services Section */}
    <View style={styles.divider}>
      <View style={styles.line} />
      <Text style={styles.dividerText}>Location Services</Text>
      <View style={styles.line} />
    </View>

    <View style={styles.locationContainer}>
      {/* Real-Time Location Tracking */}
      <TouchableOpacity
        style={styles.locationBox}
        onPress={() => navigation.navigate('LocationTrackingScreen')}
      >
        <Ionicons name="map" size={50} color="#fff" />
        <Text style={styles.locationTitle}>Real-Time Tracking</Text>
        <Text style={styles.locationDescription}>
          See the live location of your patient.
        </Text>
      </TouchableOpacity>

      {/* Geofencing */}
      <TouchableOpacity
        style={styles.locationBox}
        onPress={() => navigation.navigate('GeofencingScreen')}
      >
        <Ionicons name="location" size={50} color="#fff" />
        <Text style={styles.locationTitle}>Geofencing</Text>
        <Text style={styles.locationDescription}>
          Set safe zones and get alerts when the patient leaves the area.
        </Text>
      </TouchableOpacity>
    </View>

    {/* Floating Action Button for Trip Log */}
   
  </>

<View style={styles.infoSection}>
  <Text style={styles.infoHeading}>Why RemindMe?</Text>
  <Text style={styles.infoParagraph}>
    RemindMe is designed to simplify your life. 
    Whether it’s staying on top of your tasks, managing reminders, 
    or keeping precious memories safe, we’ve got you covered. 
    Built for convenience and accessibility, RemindMe helps you focus on what truly matters. 
    With thoughtful features and a seamless experience, it’s the ultimate companion 
    for staying organized every day.
  </Text>
</View>


    </ScrollView>
  );
  
}

const styles = StyleSheet.create({
  infoSection: {
    width: '105%',
    backgroundColor: '#e8f9ff', // Soft blue for a calming and modern touch
    borderRadius: 15,
    padding: 20,
    marginTop: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  infoHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00788c', // Deep teal for emphasis
    marginBottom: 10,
  },
  infoParagraph: {
    fontSize: 16,
    color: '#495057', // Neutral dark gray for readability
    lineHeight: 25,
    textAlign: 'left', // Align text to the left
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center', // Vertically aligns the icon and heading
    justifyContent: 'flex-start', // Places them closer together
    marginBottom: -18,
  },
  clockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', // Align items horizontally
    backgroundColor: '#b2e9ea',
    borderRadius: 15,
    padding: 13,
    marginBottom: 13,
    width:270,
    marginLeft:0,
  },
  timeContainer: {
    marginLeft: 2, // Add some space between the clock and text
    alignItems: 'flex-start', // Align text to the left
  },
  greetingText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  currentTimeText: {
    fontSize: 20,
    color: '#555',
  },

  
  iconImage: {
    width: 150,
    height: 150,
    marginRight: -10, // Reduced margin to almost no gap
  },
  heading: {
    fontSize: 42, // Matches icon's proportion
    fontWeight: 'bold',
    color: '#2b7c85',
  },
  
  subtitle: {
    fontSize: 19,
    color: '#59d7ee',
    textAlign: 'center',
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    color: '#6c757d',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 21,
  },
  
  
  featureBoxesInRow: {
    flexDirection: 'column', // Keeps items in a column format
    alignItems: 'center', // Centers the feature box horizontally
    width: '100%',
    marginTop: 20,
    paddingHorizontal: 15, // Avoids touching screen edges
  },
  
  featureBoxInRow: {
    width: '90%', // Adjusts width to be almost full screen
    height: 150, // Adjust the height as needed
    backgroundColor: '#e6fbfe',
    borderRadius: 15,
    alignItems: 'center', // Ensures everything is centered inside the box
    justifyContent: 'center', // Centers content vertically
    elevation: 5,
    padding: 15, // Adjust padding to give more space inside the box
    marginHorizontal: '5%', // Adds slight margin on each side for spacing
  },
 
  
  
  

  daysLeftText: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
  progressLabel: {
    fontSize: 14,
    color: '#888',
    marginBottom: 5,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'spaceAround',
    marginBottom: 15,
  },
  statItem: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#e5f7f8',
  },
  clockCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0d1',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  clockText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  helpContainer: {
    alignItems: 'center',
  },
  
  
  
  featureText: {
    fontSize: 17,
    fontWeight: 'bold',
    color: '#00b6bc',
    marginTop: 10,
  },
  featureDescription: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'center',
    marginTop: 5,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 20, // Spacing above and below the divider
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: '#ccc',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#6c757d',
  },
  
  memoryVaultBox: {
    width: '100%', // Full width
    backgroundColor: '#2b7c85', // Dark teal for a rich look
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    marginTop: 10,
  },
  memoryVaultTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff', // White text for contrast
    marginTop: 10,
  },
  memoryVaultDescription: {
    fontSize: 14,
    color: '#d8f3f6', // Soft white text for the description
    textAlign: 'center',
    marginTop: 5,
    lineHeight: 20,
  },

  optionsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    padding: 20,
  },
  optionButton: {
    backgroundColor: "#00b6bc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: "center",
  },
  optionText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Dim the background
    justifyContent: "center",
    alignItems: "center",
  },
  formContainer: {
    width: "85%",
    backgroundColor: "#2b7c85",
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    alignItems: "center",
  },
  formHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginBottom: 10,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  formContent: {
    fontSize: 16,
    color: "#d8f3f6",
    textAlign: "center",
    marginTop: 10,
  },
  helpContainer: {
    width: "100%",
    alignItems: "center",
  },
  input: {
    width: "100%",
    height: 100,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    textAlignVertical: "top",
    color: "#000",
  },
  sendButton: {
    marginTop: 10,
    backgroundColor: "#00b6bc",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  sendButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  logoutContainer: {
    width: "100%",
    alignItems: "center",
  },
  logoutButton: {
    marginTop: 10,
    backgroundColor: "red",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  remindersContainer: {
    flexDirection: 'row',
    justifyContent: 'center', // Center horizontally
    alignItems: 'flex-start',
    width: width * 0.9, // Adjust for screen size
  },
  largeFeatureBox: {
    width: width * 0.4, // Adjust width to fit screen
    height: 200,
    backgroundColor: '#e6fbfe',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 10,
  },
  featureBox: {
    width: width * 0.4, // Adjust width
    height: 100,
    backgroundColor: '#e6fbfe',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    padding: 10,
  },
  featureText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 5,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  pyramidContainer: {
    alignItems: 'center',
    marginLeft: 20, // Add spacing between columns
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    width: width * 0.4, // Match width of Set Reminder box
  },
  smallFeatureBox: {
    width: (width * 0.4) / 2.1, // Make sure both fit side by side
    height: 85,
    backgroundColor: '#e6fbfe',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 7,
    marginTop: 20,
  },
  
  locationBox: {
    flex: 1,
    backgroundColor: '#00b6bc',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 5,
    elevation: 5,
  },
  
  locationTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 10,
  },
  
  locationDescription: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 5,
  },
  itemLocationAidContainer: {
    marginTop: 20,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  itemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 15,
  },
  itemMainBox: {
    backgroundColor: '#00b6bc',
    width: '60%',
    height: 150,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    elevation: 5,
  },
  itemEditBox: {
    backgroundColor: '#e6fbfe',
    width: '35%',
    height: 150,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  itemAddBox: {
    backgroundColor: '#e6fbfe',
    width: '100%',
    height: 89,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
  },
  itemBoxTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 10,
    textAlign: 'center',
  },
  itemBoxDescription: {
    color: '#f0f0f0',
    textAlign: 'center',
    marginTop: 5,
    fontSize: 14,
  },
  itemEditTitle: {
    fontSize: 16,
    color: '#00b6bc',
    marginTop: 10,
    fontWeight: 'bold',
  },
  itemAddTitle: {
    fontSize: 16,
    color: '#00b6bc',
    marginTop: 10,
    fontWeight: 'bold',
  },
  
  timeDateContainer: {
    backgroundColor: '#e6fbfe',
    borderRadius: 16,
    padding: 20,
    margin: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  greeting: {
    fontSize: 18,
    color: '#2b7c85',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  dateSection: {
    borderBottomWidth: 1,
    borderBottomColor: '#dfe6e9',
    paddingBottom: 15,
    marginBottom: 15,
  },
  dayName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#2b7c85',
    textAlign: 'center',
  },
  fullDate: {
    fontSize: 18,
    color: '#636e72',
    textAlign: 'center',
    marginTop: 5,
  },
  daysLeftContainer: {
    backgroundColor: '#e5f7f8',
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  daysLeftText: {
    fontSize: 16,
    color: '#2b7c85',
    textAlign: 'center',
    fontWeight: '600',
  },
  floatingButton: {
    position: 'absolute',
    bottom: 30,
    right: 20,
    backgroundColor: '#4285F4',
    width: 140,
    height: 50,
    borderRadius: 25,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
  },
  floatingButtonText: {
    color: '#fff',
    fontWeight: '600',
    marginLeft: 8,
    fontSize: 16,
  },
});