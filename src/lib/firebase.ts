
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

// IMPORTANT: Replace these with your actual Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY", // Replace with your Firebase project's API Key
  authDomain: "YOUR_AUTH_DOMAIN", // Replace with your Firebase project's Auth Domain
  projectId: "YOUR_PROJECT_ID", // Replace with your Firebase project's Project ID
  storageBucket: "YOUR_STORAGE_BUCKET", // Replace with your Firebase project's Storage Bucket
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID", // Replace with your Firebase project's Messaging Sender ID
  appId: "YOUR_APP_ID", // Replace with your Firebase project's App ID
  measurementId: "YOUR_MEASUREMENT_ID" // Optional: Replace with your Firebase project's Measurement ID
};

// Initialize Firebase
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

const auth = getAuth(app);
// const db = getFirestore(app);
// const storage = getStorage(app);

export { app, auth /*, db, storage */ };
