import React, { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from "react-native";
import { db } from "../firebaseConfig"; // Ensure firebaseConfig is correctly set up
import { doc, getDoc } from "firebase/firestore";

import { ImageBackground } from 'react-native';



export default function TaskDetailsScreen({ route, navigation }) {
  const { taskId } = route.params; // Retrieve taskId from the navigation params
  const [task, setTask] = useState(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0); // Track current step
  const [steps, setSteps] = useState([]);
  const [isTaskComplete, setIsTaskComplete] = useState(false);
  const flatListRef = useRef(null); // Reference for FlatList

  // Fetch task details
  useEffect(() => {
    const fetchTaskDetails = async () => {
      try {
        const taskRef = doc(db, "tasks", taskId);
        const taskSnap = await getDoc(taskRef);

        if (taskSnap.exists()) {
          const taskData = taskSnap.data();
          setTask(taskData);
          setSteps(taskData.steps || []); // Assuming the task document has a 'steps' array
          console.log("Task Data:", taskData); // Log the fetched data to verify
        } else {
          Alert.alert("Error", "Task not found.");
        }
      } catch (error) {
        console.error("Error fetching task:", error);
      }
    };

    fetchTaskDetails();
  }, [taskId]);

  const handleStepComplete = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1); // Show next step
      flatListRef.current.scrollToIndex({ index: currentStepIndex + 1, animated: true }); // Smooth scroll to next step
    } else {
      setIsTaskComplete(true); // Task is completed
    }
  };

  const renderStep = ({ item, index }) => {
    const isCurrentStep = index === currentStepIndex;
    const isCompleted = index < currentStepIndex;

    return (
      <ImageBackground
        source={require('../assets/cardhh.jpg')} // Path to the background image for each card
        style={[
          styles.stepCard,
          isCurrentStep ? styles.currentStep : {},
          isCompleted ? styles.completedStep : {},
        ]}
        imageStyle={{ borderRadius: 16 }} // Ensures the image corners are rounded if needed
      >
        <Text style={styles.stepTitle}>Step {index + 1}</Text>
        <Text style={styles.stepDescription}>{item}</Text>
  
        {isCurrentStep && !isCompleted && (
          <TouchableOpacity style={styles.checkButton} onPress={handleStepComplete}>
            <Text style={styles.checkButtonText}>✓ Mark as Complete</Text>
          </TouchableOpacity>
        )}
  
        {isCompleted && <Text style={styles.completedText}>Step Completed!</Text>}
      </ImageBackground>
    );
  };

  return (
    <View style={styles.container}>
      {isTaskComplete ? (
        <View style={styles.completeContainer}>
          <Text style={styles.congratsText}>🎉 Congratulations! You've completed your task!</Text>
          <Text style={styles.subText}>Great job, keep it up!</Text>
          <TouchableOpacity style={styles.finishButton} onPress={() => navigation.goBack()}>
            <Text style={styles.finishButtonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <Text style={styles.heading}>Task Details</Text>
          <FlatList
            ref={flatListRef} // Referencing the FlatList to control scrolling
            data={steps}
            renderItem={renderStep}
            keyExtractor={(item, index) => index.toString()}
            horizontal={true} // Only one step is visible at a time
            pagingEnabled={true} // Enabling paging so one card stays at the center
            showsHorizontalScrollIndicator={false}
            scrollEnabled={false} // Prevent scrolling, just move step by step
            contentContainerStyle={styles.stepsContainer}
            onScrollToIndexFailed={() => {}}
            initialScrollIndex={currentStepIndex} // Ensure the first step is visible at the start
          />
        </>
      )}
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7f7f7",
    justifyContent: "center", // Centers the card vertically
    alignItems: "center", // Centers the card horizontally
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
    color:"#00b6bc",
  },
  stepCard: {
    backgroundColor: "#fff",  // White background for the card
    padding: 20,  // Slightly reduced padding for smaller card
    borderRadius: 15,  // Rounded corners for the card
    marginBottom: 16,
    shadowColor: "#00b6bc",  // Glowing shadow color
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,  // Smaller shadow radius
    elevation: 10,  // Adjusted elevation for a smaller card
    width: 280,  // Fixed width for the card
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,  // Glowing border effect
    borderColor: "#00b6bc",  // Glowing border color
  },
  currentStep: {
    borderColor: "#00b6bc",  // Glowing border for current step
    borderWidth: 2,
  },
  completedStep: {
    backgroundColor: "#e0f7fa",  // Light background for completed steps
  },
  stepTitle: {
    fontSize: 23,  // Adjusted font size for the step title
    fontWeight: "bold",
    marginBottom: 8,
    color: "#333",  // Dark color for text
  },
  stepDescription: {
    fontSize: 20,  // Smaller font size for description
    color: "#555",  // Lighter text color
    marginBottom: 12,
    textAlign: "center",
  },
  checkButton: {
    backgroundColor: "#00b6bc",  // Color for the button
    paddingVertical: 12,  // Larger vertical padding for button
    paddingHorizontal: 30,  // More horizontal padding for better appearance
    borderRadius: 12,  // More rounded button
    alignItems: "center",
    marginTop: 16,
    shadowColor: "#00b6bc",  // Glowing effect for the button
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,  // Shadow effect on Android
  },
  checkButtonText: {
    color: "#fff",  // White text on the button
    fontSize: 18,
    fontWeight: "bold",
  },
  completedText: {
    color: "#4caf50",  // Green color for completion text
    fontSize: 14,
    fontWeight: "bold",
  },
  completeContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 40,
  },
  congratsText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2b7c85",  // Green color for congrats text
    marginBottom: 16,
  },
  subText: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#59d7ee",  // Green color for congrats text
    marginBottom: 16,
  },
  finishButton: {
    backgroundColor: "#00b6bc",
    padding: 12,
    borderRadius: 12,
    marginTop: 20,
    alignItems: "center",
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 23,
    fontWeight: "bold",
  },
  stepsContainer: {
    alignItems: "center",
  },
});


