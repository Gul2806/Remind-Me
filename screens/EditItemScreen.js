// screens/EditItemScreen.tsx

import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { db } from '../firebaseConfig';
import { collection, doc, updateDoc, deleteDoc, onSnapshot } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';

export default function EditItemScreen() {
  const [items, setItems] = useState([]);
  const [editingItemId, setEditingItemId] = useState(null);
  const [editedTitle, setEditedTitle] = useState('');
  const [editedDescription, setEditedDescription] = useState('');

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'Items'), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setItems(data);
    });

    return () => unsubscribe();
  }, []);

  const startEditing = (item) => {
    setEditingItemId(item.id);
    setEditedTitle(item.title);
    setEditedDescription(item.description);
  };

  const cancelEditing = () => {
    setEditingItemId(null);
    setEditedTitle('');
    setEditedDescription('');
  };

  const saveChanges = async (id) => {
    try {
      await updateDoc(doc(db, 'Items', id), {
        title: editedTitle,
        description: editedDescription,
        updatedAt: new Date(),
      });
      cancelEditing();
      Alert.alert('Updated', 'Item updated successfully');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to update item');
    }
  };

  const deleteItem = async (id) => {
    Alert.alert('Delete', 'Are you sure you want to delete this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteDoc(doc(db, 'Items', id));
            Alert.alert('Deleted', 'Item has been deleted');
          } catch (error) {
            console.error(error);
            Alert.alert('Error', 'Failed to delete item');
          }
        },
      },
    ]);
  };

  const renderItem = ({ item }) => {
    const isEditing = editingItemId === item.id;

    return (
      <View style={styles.itemContainer}>
        {isEditing ? (
          <>
            <TextInput
              value={editedTitle}
              onChangeText={setEditedTitle}
              style={styles.input}
              placeholder="Title"
            />
            <TextInput
              value={editedDescription}
              onChangeText={setEditedDescription}
              style={[styles.input, { height: 60 }]}
              placeholder="Description"
              multiline
            />
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => saveChanges(item.id)} style={styles.iconButton}>
                <Ionicons name="checkmark-circle-outline" size={24} color="#2b7c85" />
              </TouchableOpacity>
              <TouchableOpacity onPress={cancelEditing} style={styles.iconButton}>
                <Ionicons name="close-circle-outline" size={24} color="#aaa" />
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
            <View style={styles.buttonRow}>
              <TouchableOpacity onPress={() => startEditing(item)} style={styles.iconButton}>
                <Ionicons name="create-outline" size={24} color="#5bc0de" />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => deleteItem(item.id)} style={styles.iconButton}>
                <Ionicons name="trash-outline" size={24} color="#d9534f" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Edit Items</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 30 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 20 },
  header: { fontSize: 24, fontWeight: 'bold', color: '#2b7c85', marginBottom: 20 },
  itemContainer: {
    backgroundColor: '#f2f2f2',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
  },
  title: { fontSize: 16, fontWeight: '600', color: '#333' },
  description: { marginTop: 4, fontSize: 14, color: '#666' },
  buttonRow: { flexDirection: 'row', marginTop: 10 },
  iconButton: { marginRight: 15 },
  input: {
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 8,
    borderColor: '#ccc',
    borderWidth: 1,
    marginBottom: 8,
  },
});
