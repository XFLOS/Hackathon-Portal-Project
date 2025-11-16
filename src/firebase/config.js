import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyBnJg7z2gfx5oM6aEpQqDQg7tYWzC5fiyw",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "hackathon-portal-project.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "hackathon-portal-project",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "hackathon-portal-project.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "989540522359",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:989540522359:web:bf6626be0cb4cb10b8a972",
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-HNZ3GX8G62"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

export default app;
