import React, { useState } from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, Button } from 'react-native';
import { getDatabase, ref, update } from 'firebase/database'; // Import from modular SDK
import { app } from '../firebaseConfig'; // Adjust path as needed

const DestinationModal = ({ visible, onClose }) => {
  const [selectedPurpose, setSelectedPurpose] = useState(null);

  const purposes = [
    { id: 'shopping', name: 'Shopping' },
    { id: 'medical', name: 'Medical Appointment' },
    { id: 'family', name: 'Visiting Family' },
    { id: 'exercise', name: 'Exercise' },
    { id: 'other', name: 'Other' }
  ];

  const handlePurposeSelect = (purpose) => {
    setSelectedPurpose(purpose);
  };

  const handleSubmit = () => {
    if (selectedPurpose) {
      const db = getDatabase(app);
      const userId = 'SKjObE3R7Fd4q9v6jify4Albi4C2';
      
      update(ref(db, `Users/${userId}`), {
        purpose: selectedPurpose,
        destinationInfoAvailable: true,
        needsDestinationInfo: false
      }).then(() => {
        console.log("Data saved successfully!");
        onClose();
      }).catch((error) => {
        console.error("Error saving data: ", error);
      });
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={false}>
      <View style={styles.container}>
        <Text style={styles.title}>Where are you going?</Text>
        
        {purposes.map((purpose) => (
          <TouchableOpacity
            key={purpose.id}
            style={[
              styles.option,
              selectedPurpose === purpose.id && styles.selectedOption
            ]}
            onPress={() => handlePurposeSelect(purpose.id)}
          >
            <Text style={styles.optionText}>{purpose.name}</Text>
          </TouchableOpacity>
        ))}

        <Button 
          title="Submit" 
          onPress={handleSubmit} 
          disabled={!selectedPurpose}
        />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  option: {
    padding: 15,
    marginVertical: 5,
    backgroundColor: '#f0f0f0',
    borderRadius: 5,
  },
  selectedOption: {
    backgroundColor: '#d0e0ff',
    borderWidth: 1,
    borderColor: '#4285f4',
  },
  optionText: {
    fontSize: 16,
  },
});

export default DestinationModal;