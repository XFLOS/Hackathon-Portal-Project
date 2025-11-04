import {
  createUserWithEmailAndPassword,
  updateProfile,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
  getIdToken,
  onAuthStateChanged
} from 'firebase/auth';
import { auth, firebaseEnabled } from '../firebase/config';

// Create a Firebase user and set display name
export async function signupWithFirebase(name, email, password) {
  if (!firebaseEnabled) throw new Error('Firebase not configured');
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  return {
    id: userCredential.user.uid,
    email: userCredential.user.email,
    name: userCredential.user.displayName || name,
  };
}

// Sign in with Firebase
export async function loginWithFirebase(email, password) {
  if (!firebaseEnabled) throw new Error('Firebase not configured');
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return {
    id: cred.user.uid,
    email: cred.user.email,
    name: cred.user.displayName || cred.user.email,
  };
}

// NOTE: Google sign-in removed. Previously there was a loginWithGoogle helper here.

export async function signoutFirebase() {
  if (!firebaseEnabled) return;
  await fbSignOut(auth);
}

export async function getFirebaseIdToken() {
  if (!firebaseEnabled || !auth.currentUser) return null;
  return await getIdToken(auth.currentUser);
}

// Small helper to subscribe to auth changes
export function onAuthChange(cb) {
  if (!firebaseEnabled) return () => {};
  return onAuthStateChanged(auth, cb);
}
