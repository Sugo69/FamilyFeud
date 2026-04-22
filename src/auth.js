// Shared Kindred auth core — used by index.html and admin.html.
// Pages keep their own page-specific flows (teacher request wizard, admin tabs)
// but the Firebase stack boot + role classification live here so a role change
// is a one-file edit.

import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js';
import {
    getAuth,
    GoogleAuthProvider,
    signInWithPopup,
    signOut as firebaseSignOut,
} from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js';
import { getFirestore } from 'https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js';

// Flip this to an unused string (e.g. '__admin_disabled_for_testing__') to
// test the teacher flow on the single admin Gmail account.
export const ADMIN_EMAIL = 'lewiswf@gmail.com';

export const APP_ID = 'exodus-feud-final-v10';
export const SESSION_KEY = 'kindred_classroom_id';
export const SESSION_NAME_KEY = 'kindred_classroom_name';

export function firebaseConfigFromEnv() {
    return {
        apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
        authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
        projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
        storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
        appId: import.meta.env.VITE_FIREBASE_APP_ID,
    };
}

export function createFirebaseStack(config = firebaseConfigFromEnv()) {
    const app = initializeApp(config);
    const auth = getAuth(app);
    const db = getFirestore(app);
    const provider = new GoogleAuthProvider();
    return { app, auth, db, provider };
}

// `adminEmail` is overridable per-page so the caller can flip to a sentinel
// value (e.g. '__admin_disabled_for_testing__') during teacher-flow testing
// without affecting the admin portal.
export function isAdmin(user, adminEmail = ADMIN_EMAIL) {
    return !!user?.email && user.email === adminEmail;
}

export async function signInWithGoogle(auth, provider) {
    return signInWithPopup(auth, provider);
}

export function signOut(auth) {
    return firebaseSignOut(auth);
}
