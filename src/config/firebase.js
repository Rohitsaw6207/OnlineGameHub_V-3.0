// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyA5IJqvECTF45acy0-1e62YPzIjld9Rt5Y",
  authDomain: "onlinegamehub-3a29a.firebaseapp.com",
  projectId: "onlinegamehub-3a29a",
  storageBucket: "onlinegamehub-3a29a.firebasestorage.app",
  messagingSenderId: "1071700496362",
  appId: "1:1071700496362:web:be2db10a6809884433ec93",
  measurementId: "G-SXQSXJ99ZF"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage, analytics };
export default app;