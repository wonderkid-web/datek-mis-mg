import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHmCh9j-ZC63FzJv5Itz-0xKzC8_wOVJk",
  authDomain: "datek-holding.firebaseapp.com",
  projectId: "datek-holding",
  storageBucket: "datek-holding.firebasestorage.app",
  messagingSenderId: "899390739157",
  appId: "1:899390739157:web:9286d1818026c933d6c85c",
  measurementId: "G-MLEWJVP1KT",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { app, db };
