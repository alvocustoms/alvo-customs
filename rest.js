// ALVO Customs — Firebase connection (existing project preserved)
import { initializeApp, getApps, getApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import {
  getAuth, GoogleAuthProvider, RecaptchaVerifier, signInWithPopup,
  signInWithPhoneNumber, onAuthStateChanged, signOut
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
import {
  getFirestore, collection, doc, getDoc, getDocs, addDoc, setDoc,
  updateDoc, deleteDoc, query, where, orderBy, serverTimestamp, limit
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import {
  getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject
} from "https://www.gstatic.com/firebasejs/10.14.1/firebase-storage.js";

export const firebaseConfig = {
  apiKey: "AIzaSyCKBprdUJsrvbvCHoD-EjyZihsenZaJ3LI",
  authDomain: "alvocustoms-c4952.firebaseapp.com",
  projectId: "alvocustoms-c4952",
  storageBucket: "alvocustoms-c4952.firebasestorage.app",
  messagingSenderId: "717785800659",
  appId: "1:717785800659:web:86c2445cbce63a24275926",
  measurementId: "G-H1RW1SZ7K5"
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export {
  RecaptchaVerifier, signInWithPopup, signInWithPhoneNumber, onAuthStateChanged, signOut,
  collection, doc, getDoc, getDocs, addDoc, setDoc, updateDoc, deleteDoc,
  query, where, orderBy, serverTimestamp, limit,
  ref, uploadBytesResumable, getDownloadURL, deleteObject
};
