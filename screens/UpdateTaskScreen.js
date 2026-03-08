import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  StyleSheet,
  FlatList,
} from "react-native";
import { collection, doc, getDocs, updateDoc, deleteDoc, getDoc } from "firebase/firestore"; // Add getDoc here
import { getAuth } from "firebase/auth"; // Ensure this is imported

import { db } from "../firebaseConfig"; // Ensure firebaseConfig is correctly set up
import { query, where } from "firebase/firestore";

export default function TaskManagementScreen() {
  const [tasks, setTasks] = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [editedTitle, setEditedTitle] = useState("");
  const [editedDescription, setEditedDescription] = useState("");
  const [taskSteps, setTaskSteps] = useState([]);
  const [loading, setLoading] = useState(true);

  const auth = getAuth(); // Create an auth instanc

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "tasks"));
        const tasksArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTasks(tasksArray);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const handleUpdate = async (taskId) => {
    if (!editedTitle.trim() || !editedDescription.trim()) {
      Alert.alert("Error", "Title and description are required.");
      return;
    }

    try {
      const taskRef = doc(db, "tasks", taskId);
      await updateDoc(taskRef, {
        title: editedTitle,
        description: editedDescription,
        steps: taskSteps,
      });

      setTasks((prevTasks) =>
        prevTasks.map((task) =>
          task.id === taskId
            ? { ...task, title: editedTitle, description: editedDescription, steps: taskSteps }
            : task
        )
      );
      setEditingTask(null);
      Alert.alert("Success", "Task updated successfully.");
    } catch (error) {
      console.error("Error updating task:", error);
      Alert.alert("Error", "Failed to update task.");
    }
  };

 

  const handleEditStep = (index, newText) => {
    const updatedSteps = [...taskSteps];
    updatedSteps[index] = newText;
    setTaskSteps(updatedSteps);
  };

  const handleAddStep = () => {
    setTaskSteps([...taskSteps, ""]);
  };

  const handleDeleteStep = (index) => {
    const updatedSteps = taskSteps.filter((_, i) => i !== index);
    setTaskSteps(updatedSteps);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const renderTask = ({ item }) => {
    const isEditing = editingTask === item.id;

    return (
      <View style={styles.taskCard}>
        {isEditing ? (
          <>
            <TextInput
              style={styles.input}
              value={editedTitle}
              onChangeText={setEditedTitle}
              placeholder="Task Title"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={editedDescription}
              onChangeText={setEditedDescription}
              placeholder="Task Description"
              multiline
            />
            <FlatList
              data={taskSteps}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item: step, index }) => (
                <View style={styles.stepContainer}>
                  <TextInput
                    style={styles.stepInput}
                    value={step}
                    onChangeText={(text) => handleEditStep(index, text)}
                    placeholder={`Step ${index + 1}`}
                  />
                 
                </View>
              )}
              ListFooterComponent={
                <TouchableOpacity style={styles.addStepButton} onPress={handleAddStep}>
                  <Text style={styles.addStepText}>Add Step</Text>
                </TouchableOpacity>
              }
            />
            <TouchableOpacity
              style={styles.saveButton}
              onPress={() => handleUpdate(item.id)}
            >
              <Text style={styles.saveButtonText}>Save</Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.taskTitle}>{item.title}</Text>
            <Text style={styles.taskDescription}>{item.description}</Text>
            <TouchableOpacity
              style={styles.updateButton}
              onPress={() => {
                setEditingTask(item.id);
                setEditedTitle(item.title);
                setEditedDescription(item.description);
                setTaskSteps(item.steps || []);
              }}
            >
              <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
            <TouchableOpacity
      style={styles.deleteButton}
      onPress={() =>
        Alert.alert(
          "Confirm Delete",
          "Are you sure you want to delete this task?",
          [
            { text: "Cancel", style: "cancel" },
            { text: "Delete", style: "destructive", onPress: () => deleteTask(item.id) },
          ]
        )
      }
    >
      
    </TouchableOpacity>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={renderTask}
        contentContainerStyle={styles.list}
      />
    </View>
  );
}



const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f8f8",
    padding: 16,
  },
  taskCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 10,
    marginBottom: 16,
    elevation: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
  },
  taskTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#005f6b",
  },
  taskDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 12,
  },
  updateButton: {
    backgroundColor: "#00796b",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 10,
  },
  updateButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  deleteButton: {
    backgroundColor: "#004d4d",
    padding: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  formContainer: {
    backgroundColor: "#e0f2f1",
    borderRadius: 10,
    padding: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 1 },
  },
  input: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#b2dfdb",
    marginBottom: 10,
    fontSize: 14,
    color: "#004d4d",
  },
  addStepButton: {
    backgroundColor: "#26a69a",
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  addStepText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  stepContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  stepInput: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#b2dfdb",
    marginRight: 8,
    fontSize: 14,
  },
  deleteStepButton: {
    backgroundColor: "#c62828",
    padding: 8,
    borderRadius: 10,
  },
  deleteStepText: {
    color: "#fff",
    fontSize: 12,
  },
  saveButton: {
    backgroundColor: "#00796b",
    padding: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  list: {
    paddingBottom: 16,
  },
  loadingText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#00796b",
  },
});
