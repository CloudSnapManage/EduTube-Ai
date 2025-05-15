
import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
// import { getFirestore } from "firebase/firestore";
// import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCbIrhL7VAQiY5iCLvvYkU0b4P30mQKgpk",
  authDomain: "edutube-ai-6ebnb.firebaseapp.com",
  projectId: "edutube-ai-6ebnb",
  storageBucket: "edutube-ai-6ebnb.appspot.com", // Corrected from .firebasestorage.app to .appspot.com
  messagingSenderId: "803448006113",
  appId: "1:803448006113:web:b738cb3a1f2c52e3ff9ea0"
  // measurementId is optional and was not provided, so it's omitted.
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
