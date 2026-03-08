import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, ActivityIndicator, Image } from "react-native";

import MapView, { Marker, Circle, PROVIDER_GOOGLE } from "react-native-maps";

import { getDatabase, ref, onValue } from "firebase/database";
import { Picker } from "@react-native-picker/picker"; // Import Picker

const LocationTrackingScreen = () => {
  const [location, setLocation] = useState(null);
  const [mapType, setMapType] = useState("standard"); // Default map type

  const [safeZones, setSafeZones] = useState([]);

  useEffect(() => {
    const db = getDatabase();
  
    // Fetch location
    const locationRef = ref(db, "LocationTracking/ESP8266-Device1");
    const unsubscribeLocation = onValue(locationRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLocation({
          latitude: parseFloat(data.latitude),
          longitude: parseFloat(data.longitude),
        });
      }
    });
  
    // Fetch geofences (safe zones)
    const geofenceRef = ref(db, `Geofences/SKjObE3R7Fd4q9v6jify4Albi4C2`); // Replace with actual patient ID
    onValue(geofenceRef, (snapshot) => {
      const zonesData = snapshot.val();
      if (zonesData) {
        const zonesArray = Object.values(zonesData).map((zone) => ({
          latitude: parseFloat(zone.latitude),
          longitude: parseFloat(zone.longitude),
          radius: parseFloat(zone.radius),
        }));
        setSafeZones(zonesArray);
      }
    });
  
    return () => {
      unsubscribeLocation();
    };
  }, []);
  

  if (!location) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Fetching Location...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        mapType={mapType} // Map type changes dynamically
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.005,
          longitudeDelta: 0.005,
        }}
      >
        <Marker coordinate={location}>
          <Image source={require("../assets/location.gif")} style={styles.markerIcon} />
        </Marker>
        {safeZones.map((zone, index) => (
  <Circle
    key={index}
    center={{ latitude: zone.latitude, longitude: zone.longitude }}
    radius={zone.radius}
    strokeColor="rgba(0, 200, 0, 0.7)"
    fillColor="rgba(0, 200, 0, 0.2)"
  />
))}

      </MapView>

      {/* Map Type Picker */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={mapType}
          onValueChange={(itemValue) => setMapType(itemValue)}
          style={styles.picker}
        >
          <Picker.Item label="Standard Map" value="standard" />
          <Picker.Item label="Hybrid Map" value="hybrid" />
          <Picker.Item label="Satellite Map" value="satellite" />
          <Picker.Item label="Terrain Map" value="terrain" />
        </Picker>
      </View>

      {/* Location Info Card */}
      <View style={styles.infoCard}>
        <Text style={styles.cardText}>📍 Latitude: {location.latitude.toFixed(6)}</Text>
        <Text style={styles.cardText}>📍 Longitude: {location.longitude.toFixed(6)}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    width: "100%",
    height: "100%",
  },
  markerIcon: {
    width: 40,
    height: 40,
    resizeMode: "contain",
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#333",
  },
  pickerContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    right: 10,
    backgroundColor: "white",
    borderRadius: 10,
    padding: 5,
    elevation: 3, // Shadow for Android
    shadowColor: "#000", // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
  },
  picker: {
    height: 40,
    color: "black",
  },
  infoCard: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.7)",
    padding: 15,
    borderRadius: 10,
  },
  cardText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
});

export default LocationTrackingScreen;
