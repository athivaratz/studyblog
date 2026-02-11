import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence, Auth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize auth persistence function
// This function must be awaited before any auth operations to ensure persistence is configured
// It's idempotent - safe to call multiple times, will only execute once
let persistenceInitialized = false;

const initializeAuthPersistence = async (authInstance: Auth): Promise<void> => {
  if (persistenceInitialized) return;
  
  try {
    await setPersistence(authInstance, browserLocalPersistence);
    console.log("Firebase Auth persistence set to browserLocalPersistence");
    persistenceInitialized = true;
  } catch (error) {
    console.error("Failed to set auth persistence - auth will use default cookie-based persistence:", error);
    console.warn("Note: Default cookie-based persistence may not work in browsers with third-party cookie restrictions (Brave, Firefox with ETP)");
    // Mark as initialized even on failure to prevent retries
    // Auth operations will proceed with Firebase's default persistence behavior
    persistenceInitialized = true;
  }
};

// Start persistence initialization immediately when module loads in browser
// This is fire-and-forget - callers MUST await initializeAuthPersistence() before auth operations
if (typeof window !== 'undefined') {
  initializeAuthPersistence(auth);
}

// Google Provider with Thai locale
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: "select_account",
});

// Note: Classroom and Calendar scopes require Google verification
// Uncomment when ready to submit for verification:
// googleProvider.addScope("https://www.googleapis.com/auth/classroom.courses.readonly");
// googleProvider.addScope("https://www.googleapis.com/auth/classroom.coursework.me.readonly");
// googleProvider.addScope("https://www.googleapis.com/auth/calendar");

export { app, auth, db, storage, googleProvider, initializeAuthPersistence };
