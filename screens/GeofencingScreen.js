import React, { useState, useEffect } from "react";
import { View, Text, TextInput, Button, Alert,TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker"; // Import Picker
import MapView, { Marker, Circle } from "react-native-maps";
import { getDatabase, ref, set } from "firebase/database";
import { doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { db } from "../firebaseConfig"; // Ensure Firebase is initialized
import { push ,get} from "firebase/database";


const GeofencingScreen = () => {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [radius, setRadius] = useState(100);
  const [mapType, setMapType] = useState("standard");
  const [region, setRegion] = useState({
    latitude: 32.2964, // Khushab, Pakistan
    longitude: 72.3528,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const [patientId, setPatientId] = useState("");

  useEffect(() => {
    const fetchLinkedPatient = async () => {
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
          setPatientId(userData.patientID || "");
        } else {
          console.error("User document not found.");
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      }
    };

    fetchLinkedPatient();
  }, []);

  const handleMapPress = (e) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    setLatitude(latitude);
    setLongitude(longitude);
    setRegion({ latitude, longitude, latitudeDelta: 0.01, longitudeDelta: 0.01 });
  };



  const saveGeofence = async () => {
    if (!latitude || !longitude || !radius || !patientId) {
      Alert.alert("Error", "Please select a location, set a radius, and ensure a linked patient is available.");
      return;
    }
  
    try {
      const db = getDatabase();
      const geofenceRef = ref(db, `Geofences/${patientId}`);
  
      // Fetch existing zones to determine next zone number
      const snapshot = await get(geofenceRef);
      const existingZones = snapshot.exists() ? Object.keys(snapshot.val()) : [];
      
      // Determine next available zone (Zone1, Zone2, Zone3, ...)
      const nextZoneNumber = existingZones.length + 1;
      const newZoneRef = ref(db, `Geofences/${patientId}/Zone${nextZoneNumber}`);
  
      // Round latitude and longitude before saving
      const roundedLatitude = parseFloat(latitude.toFixed(5));
      const roundedLongitude = parseFloat(longitude.toFixed(5));
  
      await set(newZoneRef, { 
        latitude: roundedLatitude, 
        longitude: roundedLongitude, 
        radius 
      });
  
      Alert.alert("Success", `Safe zone ${nextZoneNumber} saved successfully for the linked patient!`);
    } catch (error) {
      console.error("Error saving geofence:", error);
      Alert.alert("Error", "Failed to save geofence.");
    }
  };


  return (
    <View style={{ flex: 1 }}>
      <Picker
        selectedValue={mapType}
        style={{ height: 50, width: "100%" }}
        onValueChange={(itemValue) => setMapType(itemValue)}
      >
        <Picker.Item label="Standard" value="standard" />
        <Picker.Item label="Satellite" value="satellite" />
        <Picker.Item label="Hybrid" value="hybrid" />
        <Picker.Item label="Terrain" value="terrain" />
      </Picker>
      <MapView 
        style={{ flex: 1 }}
        onPress={handleMapPress}
        region={region}
        mapType={mapType}
      >
        {latitude && longitude && (
          <>
            <Marker coordinate={{ latitude, longitude }} />
            <Circle
              center={{ latitude, longitude }}
              radius={radius}
              strokeColor="rgba(0, 0, 255, 0.5)"
              fillColor="rgba(0, 0, 255, 0.2)"
            />
          </>
        )}
      </MapView>
      <View style={{ padding: 16, backgroundColor: '#F5F5F5', borderRadius: 12, margin: 10, elevation: 2 }}>
  <Text style={{ fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 6 }}>Radius (meters):</Text>
  <TextInput
    style={{
      borderWidth: 1,
      borderColor: '#ccc',
      backgroundColor: '#fff',
      padding: 10,
      borderRadius: 8,
      fontSize: 16,
      marginBottom: 12,
    }}
    keyboardType="numeric"
    value={radius.toString()}
    onChangeText={(text) => setRadius(Number(text))}
    placeholder="Enter radius"
    placeholderTextColor="#888"
  />
  <TouchableOpacity
    style={{
      backgroundColor: '#00b6bc',
      padding: 12,
      borderRadius: 8,
      alignItems: 'center',
    }}
    onPress={saveGeofence}
  >
    <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>Save Geofence</Text>
  </TouchableOpacity>
</View>

    </View>
  );
};

export default GeofencingScreen;