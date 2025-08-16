// src/firebase/config.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "hayatfashion.firebaseapp.com",
  projectId: "hayatfashion-afd84",
  storageBucket: "hayatfashion-afd84.appspot.com",
  messagingSenderId: "YOUR_MSG_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
