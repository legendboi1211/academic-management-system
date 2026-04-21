'use client';

import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Your web app's Firebase configuration
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
const app = initializeApp(firebaseConfig);

// Export db for use in components
export const db = getFirestore(app);