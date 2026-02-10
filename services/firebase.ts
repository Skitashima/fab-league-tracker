import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

console.log("🔥 Firebase Config Check:");
console.log("   - Project ID:", firebaseConfig.projectId ? "OK (" + firebaseConfig.projectId + ")" : "MISSING");
console.log("   - Auth Domain:", firebaseConfig.authDomain ? "OK (" + firebaseConfig.authDomain + ")" : "MISSING");
console.log("   - API Key:", firebaseConfig.apiKey ? "OK (Length: " + firebaseConfig.apiKey.length + ")" : "MISSING");

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
