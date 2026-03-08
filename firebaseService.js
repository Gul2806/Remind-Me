import { firebase } from './firebaseConfig';

// Store user data in Firestore after successful registration
const saveUserDataToFirestore = async (uid, email) => {
  try {
    await firebase.firestore().collection('users').doc(uid).set({
      email: email,
      createdAt: new Date(),
    });
  } catch (err) {
    console.log('Error saving user data to Firestore:', err);
  }
};

export { saveUserDataToFirestore };
