import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged,
  type Auth,
  type User,
} from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

function isFirebaseConfigured(): boolean {
  return Boolean(
    firebaseConfig.apiKey &&
      firebaseConfig.authDomain &&
      firebaseConfig.projectId &&
      firebaseConfig.appId,
  );
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;

function initAuth(firebaseApp: FirebaseApp): Auth {
  try {
    if (typeof getReactNativePersistence !== 'function') {
      throw new Error(
        'getReactNativePersistence is unavailable. Ensure metro.config.js disables package exports for Firebase Auth.',
      );
    }

    return initializeAuth(firebaseApp, {
      persistence: getReactNativePersistence(AsyncStorage),
    });
  } catch (error) {
    // initializeAuth throws if Auth was already initialized (e.g. Fast Refresh).
    // Any other failure falls back to getAuth(), which is memory-only on RN.
    const message = error instanceof Error ? error.message : String(error);
    if (message.includes('already been initialized')) {
      return getAuth(firebaseApp);
    }

    console.warn(
      '[firebase] Auth persistence init failed; sessions may not survive app restarts.',
      error,
    );
    return getAuth(firebaseApp);
  }
}

if (isFirebaseConfigured()) {
  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
  auth = initAuth(app);
  db = getFirestore(app);
} else {
  console.warn(
    '[firebase] Missing EXPO_PUBLIC_FIREBASE_* env vars. Copy .env.example to .env and add your Firebase web config.',
  );
}

export const firebaseApp = app;
export const firebaseAuth = auth;
export const firestore = db;
export const isFirebaseReady = isFirebaseConfigured();

/** Waits for Firebase to restore the session from AsyncStorage before returning. */
export function waitForAuthUser(): Promise<User | null> {
  if (!auth) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      unsubscribe();
      resolve(user);
    });
  });
}
