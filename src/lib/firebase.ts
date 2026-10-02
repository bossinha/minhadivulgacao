import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { initializeFirestore, getFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

let firestoreInstance;
try {
  firestoreInstance = initializeFirestore(
    app,
    {
      experimentalForceLongPolling: true,
      experimentalAutoDetectLongPolling: true,
    },
    (firebaseConfig as any).firestoreDatabaseId || "(default)"
  );
} catch (e) {
  try {
    firestoreInstance = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || "(default)");
  } catch (err) {
    firestoreInstance = getFirestore(app);
  }
}

export const db = firestoreInstance;
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
