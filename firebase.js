// Verify these values in Firebase Console > Project settings before launch.
export const firebaseConfig = {
  apiKey: "AIzaSyCKBprdUJsrvbvCHoD-EjyZihsenZaJ3LI",
  authDomain: "alvocustoms-c4952.firebaseapp.com",
  projectId: "alvocustoms-c4952",
  storageBucket: "alvocustoms-c4952.firebasestorage.app",
  messagingSenderId: "717785800659",
  appId: "1:717785800659:web:86c2445cbce63a24275926"
};
export const OWNER_EMAIL = "alvo.customs@gmail.com";
// Replace with ALVO WhatsApp number: India country code + 10 digits, digits only.
export const WHATSAPP_NUMBER = "91XXXXXXXXXX";
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.14.1/firebase-auth.js";
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
