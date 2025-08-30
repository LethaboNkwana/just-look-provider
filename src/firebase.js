// src/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDPEwabPMe6T4CrzJE4Ox0dMwDPQ4U5atA",
  authDomain: "just-loook.firebaseapp.com",
  projectId: "just-loook",
  storageBucket: "just-loook.firebasestorage.app",
  messagingSenderId: "889560922507",
  appId: "1:889560922507:web:7ad50bc15d4018545fd78e",
  measurementId: "G-E900D6ZGKM"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { app, auth, db, storage };