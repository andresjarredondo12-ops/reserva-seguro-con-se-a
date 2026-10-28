// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyASFKALnnDSJDZ-dKfxE_Q5UeoT3y8Aswk",
  authDomain: "reserva-segura.firebaseapp.com",
  projectId: "reserva-segura",
  storageBucket: "reserva-segura.firebasestorage.app",
  messagingSenderId: "682725811628",
  appId: "1:682725811628:web:1f388f9c83a27a96858609",
  measurementId: "G-890L1EDQFT"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export { collection, addDoc, getDocs, query, where, signInWithEmailAndPassword, signOut, onAuthStateChanged };