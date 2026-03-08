import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  FlatList,
} from "react-native";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";

export default function CreateTaskScreen({ route, navigation }) {
  const { linkedPatientId } = route.params; // Patient ID passed from SequentialTaskGuideScreen // 
  // route.params is used to access parameters that were passed to the current screen when navigating.
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [steps, setSteps] = useState([]); // Array to hold task steps
  const [currentStep, setCurrentStep] = useState(""); // Current step being entered
  const [loading, setLoading] = useState(false);

  const addStep = () => {
    if (!currentStep.trim()) {
      Alert.alert("Validation Error", "Step cannot be empty.");
      return;
    }
    setSteps([...steps, currentStep.trim()]);
    setCurrentStep(""); // Clear the input field after adding
  };

  const removeStep = (index) => {
    const updatedSteps = steps.filter((_, i) => i !== index);
    setSteps(updatedSteps);
  };

  const handleSaveTask = async () => {
    if (!title.trim() || !description.trim() || steps.length === 0) {
      Alert.alert(
        "Validation Error",
        "Please fill in all fields and add at least one step."
      );
      return;
    }

    setLoading(true);
    try {
      const taskData = {
        title: title.trim(),
        description: description.trim(),
        steps,
        linkedPatientId,
        createdAt: Timestamp.now(),
      };

      await addDoc(collection(db, "tasks"), taskData);

      Alert.alert("Success", "Task created successfully!");
      navigation.goBack(); // Go back to the previous screen
    } catch (error) {
      console.error("Error creating task:", error);
      Alert.alert("Error", "Failed to create task. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = ({ item, index }) => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepText}>{`${index + 1}. ${item}`}</Text>
      <TouchableOpacity onPress={() => removeStep(index)}>
        <Text style={styles.removeStepText}>Remove</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Create New Task</Text>
      <TextInput
        style={styles.input}
        placeholder="Task Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={[styles.input, styles.textArea]}
        placeholder="Task Description"
        value={description}
        onChangeText={setDescription}
        multiline
      />
      <TextInput
        style={styles.input}
        placeholder="Enter a Step"
        value={currentStep}
        onChangeText={setCurrentStep}
      />
      <TouchableOpacity style={styles.addStepButton} onPress={addStep}>
        <Text style={styles.addStepButtonText}>Add Step</Text>
      </TouchableOpacity>
      <FlatList
        data={steps}
        renderItem={renderStep}
        keyExtractor={(item, index) => index.toString()}
        ListEmptyComponent={<Text style={styles.noStepsText}>No steps added yet.</Text>}
      />
      <TouchableOpacity
        style={styles.saveButton}
        onPress={handleSaveTask}
        disabled={loading}
      >
        <Text style={styles.saveButtonText}>
          {loading ? "Saving..." : "Save Task"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7f7f7",
  },
  heading: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  addStepButton: {
    backgroundColor: "#00b6bc",
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
  },
  addStepButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e8f7f7",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  stepText: {
    fontSize: 14,
    color: "#333",
  },
  removeStepText: {
    fontSize: 14,
    color: "#f55",
  },
  noStepsText: {
    textAlign: "center",
    color: "#555",
    marginTop: 20,
  },
  saveButton: {
    backgroundColor: "#00b6bc",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
