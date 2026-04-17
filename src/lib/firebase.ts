import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc, setDoc, onSnapshot, updateDoc, collection, getDocs } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const googleProvider = new GoogleAuthProvider();

// Simple Test Connection
(async () => {
    try {
        await getDoc(doc(db, 'test', 'connection'));
    } catch (e) {
        console.warn("Firestore connection check", e);
    }
})();
