import { getFirestore, updateDoc, doc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { db } from '../firebaseConfig';

const updateDeviceId = async (userId, newDeviceId) => {
  try {
    const userRef = doc(db, 'users', userId); // Reference to the user's document
    await updateDoc(userRef, {
      deviceId: newDeviceId, // Update the deviceId field
    });
    console.log("Device ID updated successfully");
  } catch (error) {
    console.error("Error updating device ID:", error);
  }
};

// Example usage
const auth = getAuth();
const user = auth.currentUser;
if (user) {
  updateDeviceId(user.uid, 'new-device-id'); // Replace 'new-device-id' with the actual ID
}
