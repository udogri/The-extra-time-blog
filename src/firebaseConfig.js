// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getAuth } from 'firebase/auth';
import { getFirestore, increment } from 'firebase/firestore';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBnBfr8wIirMVT-oN4CMbWC2GMf9-Zw3dM",
  authDomain: "xtra-time-blog.firebaseapp.com",
  projectId: "xtra-time-blog",
  storageBucket: "xtra-time-blog.firebasestorage.app",
  messagingSenderId: "273768847616",
  appId: "1:273768847616:web:b6287395d5b522b89bfbe5"};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app); // Initialize Firebase Authentication
const db = getFirestore(app);


export { app, auth, db, increment }; 