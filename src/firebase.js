import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAcSppZ3AkzQ2Bx_hbRMg8vnuCpfI0jRv0",
  authDomain: "soporte-sonoro.firebaseapp.com",
  projectId: "soporte-sonoro",
  storageBucket: "soporte-sonoro.firebasestorage.app",
  messagingSenderId: "216365097936",
  appId: "1:216365097936:web:0faa7610770e0dff598fd5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
