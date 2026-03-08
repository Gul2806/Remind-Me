import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseConfig"; // Ensure firebaseConfig is correctly set up
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { FontAwesome } from '@expo/vector-icons';


export default function SequentialTaskGuideScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState(""); // Role of the logged-in user
  const [linkedPatientId, setLinkedPatientId] = useState(""); // Patient linked to the caregiver

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const auth = getAuth();
        const user = auth.currentUser;

        if (!user) {
          Alert.alert("Error", "User not logged in.");
          return;
        }

        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          setRole(userData.role);

          // Use `patientID` instead of `linkedPatientId`
          setLinkedPatientId(userData.patientID || user.uid); // Fallback to user ID for patients
          console.log("Role:", userData.role);
          console.log("Linked Patient ID:", userData.patientID || user.uid);
        } else {
          console.error("User document not found.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const fetchTasks = async () => {
      setLoading(true);
      try {
        if (!linkedPatientId) return;

        const tasksQuery = query(
          collection(db, "tasks"),
          where("linkedPatientId", "==", linkedPatientId)
        );
        const taskSnapshot = await getDocs(tasksQuery);

        const fetchedTasks = taskSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setTasks(fetchedTasks);
        
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [linkedPatientId]);

  const handleCreateTask = () => {
    navigation.navigate("CreateTaskScreen", { linkedPatientId });
  };

  const handleTaskPress = (taskId) => {
    navigation.navigate("TaskDetailScreen", { taskId });
  };

  const renderTask = ({ item }) => (
    <TouchableOpacity
      style={[styles.card, styles.glowingEffect]}
      onPress={() => handleTaskPress(item.id)} // Navigate to TaskDetailsScreen on press
    >
    <View style={styles.neonBorder}/>
      <Text style={styles.title}>{item.title}</Text>
      <Text style={styles.description}>{item.description}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Sequential Task Guide</Text>

      {role === "caregiver" && (
        <TouchableOpacity style={styles.createButton} onPress={handleCreateTask}>
        <FontAwesome name="tasks" size={20} color="#fff" style={styles.updateIcon} />
          <Text style={styles.createButtonText}>Create Task</Text>
        </TouchableOpacity>
      )}
      {role === "caregiver" && (
  <TouchableOpacity style={styles.updateButton} onPress={() => navigation.navigate("UpdateTaskScreen")}>
    <FontAwesome name="cog" size={20} color="#fff" style={styles.updateIcon} />
    <Text style={styles.updateButtonText}>Update Task</Text>
  </TouchableOpacity>
)}

      {loading ? (
        <Text style={styles.loadingText}>Loading tasks...</Text>
      ) : (
        <View style={styles.taskContainer}> 
        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.flatlistContainer}
          
          
        />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f4f9fc",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color: "#333",
  },
  createButton: {
    backgroundColor: "#00b6bc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
    alignSelf: "center",
    width: "90%",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingText: {
    fontSize: 16,
    textAlign: "center",
    color: "#777",
    marginTop: 20,
  },
  flatlistContainer: {
    // Center the items
    paddingLeft: 66,
    paddingHorizontal: 8,
    paddingBottom: 16, // Add some padding at the bottom
  },
  card: {
    width: "75%", // Adjust width to allow for spacing
    margin: "5.5%", // Margin for spacing between cards
    padding: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 0, // Remove default border
    justifyContent: "space-between",
    height: 180, // Fixed height for the cards
    alignItems: "center",
    overflow: "hidden", // Ensures rounded corners work well
    position: "relative",
    
   // Position for pseudo-elements
  },
  neonBorder: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 12,
    borderWidth: 3,
    borderColor: "#00b6bc", // Neon color
    opacity: 0.5,
    zIndex: -1, // Send the border behind the card
    shadowColor: "#00b6bc",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 1,
    shadowRadius: 10,
    elevation: 10, // Android shadow
  },
  glowingEffect: {
    shadowColor: "#00b6bc",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.8,
    shadowRadius: 16,
    elevation: 10, // Android shadow
    transform: [{ scale: 1.05 }], // Subtle zoom effect on press
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  updateButton: {
    backgroundColor: "#004d4d", // Blue color for distinction
    flexDirection: "row", // For icon and text alignment
    alignItems: "center",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignSelf: "center",
    width: "90%",
    justifyContent: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8, // Space between icon and text
  },
  updateIcon: {
    marginRight: 8,
  },
  
});