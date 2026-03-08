import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';
import { useNavigation } from '@react-navigation/native';

export default function ItemListScreen() {
    const [items, setItems] = useState([]);
    const navigation = useNavigation();
    const [loading, setLoading] = useState(true);

  
    useEffect(() => {
      const fetchItems = async () => {
        try {
          const auth = getAuth();
          const user = auth.currentUser;
          if (!user) return;
  
          const q = query(collection(db, 'Items'), where('userId', '==', user.uid));
          const querySnapshot = await getDocs(q);
  
          const itemList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setItems(itemList);
        } catch (error) {
          console.error('Error fetching items:', error);
        }
        setLoading(false); // Done loading whether user exists or not

      };
  
      fetchItems();
    }, []);
  
    const formatDateTime = (timestamp) => {
      const date = timestamp?.toDate();
      if (!date) return { date: '', time: '' };
      const options = { year: 'numeric', month: 'short', day: 'numeric' };
      const timeOptions = { hour: '2-digit', minute: '2-digit' };
      return {
        date: date.toLocaleDateString(undefined, options),
        time: date.toLocaleTimeString(undefined, timeOptions),
      };
    };
  
    const renderItem = ({ item }) => {
      const { date, time } = formatDateTime(item.createdAt);
  
      return (
        <TouchableOpacity
          style={styles.itemCard}
          onPress={() => navigation.navigate('ItemDetailScreen', { item })}
        >
          <Ionicons name="cube-outline" size={30} color="#00b6bc" style={{ marginBottom: 10 }} />
          <Text style={styles.itemName}>{item.title || item.name || 'No Title'}</Text>
          <View style={styles.timestampContainer}>
            <Text style={styles.itemDate}>{date}</Text>
            <Text style={styles.itemTime}>{time}</Text>
          </View>
        </TouchableOpacity>
      );
    };
  
    
    return (
      <View style={styles.container}>
        {loading ? (
          <Text style={{ textAlign: 'center', marginTop: 50, fontSize: 18, color: '#2b7c85' }}>
            Loading...
          </Text>
        ) : (
          <>
            <Text style={styles.header}>My Items</Text>
            <FlatList
              data={items}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              numColumns={2}
              columnWrapperStyle={styles.row}
              ListEmptyComponent={() => (
                <Text style={{ textAlign: 'center', marginTop: 50, color: '#888' }}>
                  No items found.
                </Text>
              )}
            />
            <TouchableOpacity
              style={styles.fab}
              onPress={() => navigation.navigate('AddItemScreen')}
            >
              <Ionicons name="add" size={30} color="#fff" />
            </TouchableOpacity>
          </>
        )}
      </View>
    );
    
  }
  

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  header: { fontSize: 24, fontWeight: 'bold', color: '#2b7c85', textAlign: 'center', marginBottom: 20 },
  row: { justifyContent: 'space-between' },
  itemCard: { 
    flex: 0.48, 
    backgroundColor: '#e6fbfe', 
    borderRadius: 12, 
    padding: 15, 
    marginBottom: 15,
    alignItems: 'center',
    elevation: 2,
  },
  itemName: { fontSize: 16, fontWeight: 'bold', color: '#2b7c85', marginBottom: 5, textAlign: 'center' },
  timestampContainer: {
    marginTop: 5,
    alignItems: 'center',
  },
  itemDate: { fontSize: 12, color: '#555' },
  itemTime: { fontSize: 12, color: '#555' },
  fab: { 
    position: 'absolute', 
    right: 20, 
    bottom: 20, 
    backgroundColor: '#00b6bc', 
    padding: 15, 
    borderRadius: 50, 
    alignItems: 'center',
    elevation: 5,
  }
});
