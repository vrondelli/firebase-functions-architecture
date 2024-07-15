import * as admin from 'firebase-admin';
import functions from 'firebase-functions-test';

const projectId = 'firebase-functions-arquitecture';
const firebaseConfig = {
  projectId,
};

process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';

admin.initializeApp();
const testEnv = functions(firebaseConfig);

const db = admin.firestore();

const checkFirestoreConnection = async () => {
  try {
    const testDocRef = db.collection('test').doc('connectionTest');
    await testDocRef.set({ testField: 'testValue' });
    const doc = await testDocRef.get();
    if (doc.exists && doc.data()?.testField === 'testValue') {
      console.log('Firestore is connected successfully.');
    } else {
      console.error('Failed to verify Firestore connection.');
      process.exit(1); // Exit with failure
    }
    await testDocRef.delete(); // Clean up test document
  } catch (error) {
    console.error('Error connecting to Firestore:', error);
    process.exit(1); // Exit with failure
  }
};

export const testSetup = async () => {
  await checkFirestoreConnection();
  return true;
}


export { admin, db, testEnv };