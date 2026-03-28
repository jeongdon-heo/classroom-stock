import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyASkxuTEF9EUxhe75YkVvhnIjS0l_Xx3iI",
  authDomain: "classroom-stock.firebaseapp.com",
  projectId: "classroom-stock",
  storageBucket: "classroom-stock.firebasestorage.app",
  messagingSenderId: "496766285687",
  appId: "1:496766285687:web:3aeef5d03573aa75f11372",
  measurementId: "G-HJZ6PKSRC2"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
