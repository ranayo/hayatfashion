// src/firebase/config.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

// ⚙️ הגדרות Firebase
const firebaseConfig = {
  apiKey: "AIzaSyAce2Nd9FThPIMbZuCr0XXzll6HT8o_LTs",
  authDomain: "hayatfashion-afd84.firebaseapp.com",
  projectId: "hayatfashion-afd84",
  storageBucket: "hayatfashion-afd84.appspot.com", // ✅ תיקון כאן
  messagingSenderId: "393880167726",
  appId: "1:393880167726:web:18eba688f1229bab8906bf",
  measurementId: "G-1HPK13RQQ1",
};

// ✅ יצירת אינסטנס יחיד של האפליקציה
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// ✅ יצוא מופעים אחידים
export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export default app;
