// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // ← הוספת ייבוא

const firebaseConfig = {
  apiKey: "AIzaSyAce2Nd9FThPIMbZuCr0XXzll6HT8o_LTs",
  authDomain: "hayatfashion-afd84.firebaseapp.com",
  projectId: "hayatfashion-afd84",
  storageBucket: "hayatfashion-afd84.appspot.com",
  messagingSenderId: "393880167726",
  appId: "1:393880167726:web:18eba688f1229bab8906bf",
  measurementId: "G-1HPK13RQQ1"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // ← הוספת ייצוא
