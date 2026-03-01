import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

let app: any;
try {
    if (getApps().length > 0) {
        app = getApp();
    } else if (firebaseConfig.apiKey) {
        app = initializeApp(firebaseConfig);
    } else {
        console.warn("Firebase API Key missing. Firebase not initialized.");
        app = undefined;
    }
} catch (e) {
    console.error("Firebase initialization error:", e);
    app = undefined;
}

export const db = app ? getFirestore(app) : null as any;
export const auth = app ? getAuth(app) : null as any;

// Analytics initialization (Client-side only)
export const analytics = (typeof window !== "undefined" && app)
    ? isSupported().then(yes => yes ? getAnalytics(app) : null)
    : null;
