// src/lib/firebase.ts
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyCuXAD_GfstTthc-pDEkG6B_sjNiTsj728",
  authDomain: "timer-89c3e.firebaseapp.com",
  databaseURL: "https://timer-89c3e-default-rtdb.firebaseio.com",
  projectId: "timer-89c3e",
  storageBucket: "timer-89c3e.firebasestorage.app",
  messagingSenderId: "637035686923",
  appId: "1:637035686923:web:f11c6ab6eb82ade20a2b0e",
  measurementId: "G-G4WJV4W3XW"
};

// Initialize Firebase 
// The 'export' here is critical to fix your Vercel build error
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Initialize Firestore and export it for use in your dashboard
export const db = getFirestore(app);

// Initialize Analytics (Check for window to avoid SSR errors in Next.js)
export const analytics = typeof window !== "undefined" ? getAnalytics(app) : null;