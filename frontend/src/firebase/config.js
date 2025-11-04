// Firebase client initialization.
// Provide the config via environment variables in your .env (REACT_APP_...)
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  ...(process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
    ? { measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID }
    : {}),
};

let app;
try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
  }
} catch (err) {
  console.warn('Firebase init failed:', err.message);
}

export const auth = app ? getAuth(app) : {
  currentUser: null,
  onAuthStateChanged: () => () => {},
};

export const firebaseEnabled = Boolean(app);
// Expose a quick runtime check for developers
try {
  if (typeof window !== 'undefined') {
    window.__HP_FIREBASE_ENABLED = firebaseEnabled;
    if (process.env.NODE_ENV === 'development') {
      // eslint-disable-next-line no-console
      console.info('[Auth] Firebase mode:', firebaseEnabled ? 'enabled' : 'disabled');
    }
  }
} catch (_) {}
export default app;

