import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCbIrhL7VAQiY5iCLvvYkU0b4P30mQKgpk",
  authDomain: "edutube-ai-6ebnb.firebaseapp.com",
  projectId: "edutube-ai-6ebnb",
  storageBucket: "edutube-ai-6ebnb.firebasestorage.app",
  messagingSenderId: "803448006113",
  appId: "1:803448006113:web:b738cb3a1f2c52e3ff9ea0",
  measurementId: "G-LP4W0G516J"
};


const app = initializeApp(firebaseConfig);

let analytics;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}
// This file is intentionally left blank as it is being deleted.
// The build system will remove it.
