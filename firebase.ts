// Firebase initialization for Deno using npm:firebase v12
// Reads config from environment variables and exports Auth + Firestore clients.

import { initializeApp, getApps } from "firebase/app";
import {
    initializeAuth,
    inMemoryPersistence,
    signInAnonymously,
    connectAuthEmulator,
    type Auth,
} from "firebase/auth";
import {
    getFirestore,
    connectFirestoreEmulator,
    type Firestore,
} from "firebase/firestore";

// Contract:
// - Requires env vars: FIREBASE_API_KEY, FIREBASE_AUTH_DOMAIN, FIREBASE_PROJECT_ID
//   Optional: FIREBASE_STORAGE_BUCKET, FIREBASE_MESSAGING_SENDER_ID, FIREBASE_APP_ID
// - Optional emulator flags: USE_FIREBASE_EMULATOR=("true"|"1"), FIRESTORE_EMULATOR_HOST, AUTH_EMULATOR_HOST
// - Exported objects: app, auth, db, ensureAnonAuth()

function getEnv(name: string, required = true): string | undefined {
    const v = Deno.env.get(name);
    if (!v && required) {
        throw new Error(`Missing required env var: ${name}`);
    }
    return v;
}

const firebaseConfig = {
    apiKey: getEnv("FIREBASE_API_KEY")!,
    authDomain: getEnv("FIREBASE_AUTH_DOMAIN")!,
    projectId: getEnv("FIREBASE_PROJECT_ID")!,
    storageBucket: getEnv("FIREBASE_STORAGE_BUCKET", false),
    messagingSenderId: getEnv("FIREBASE_MESSAGING_SENDER_ID", false),
    appId: getEnv("FIREBASE_APP_ID", false),
};

export const app = getApps().length ? getApps()[0]! : initializeApp(firebaseConfig);

// Use in-memory auth persistence since Deno has no browser storage
export const auth: Auth = initializeAuth(app, { persistence: inMemoryPersistence });
export const db: Firestore = getFirestore(app);

// Optional emulator wiring
const useEmu = ["true", "1"].includes((Deno.env.get("USE_FIREBASE_EMULATOR") || "").toLowerCase());
if (useEmu) {
    const fsHost = Deno.env.get("FIRESTORE_EMULATOR_HOST") || "localhost:8080";
    const [fsHostName, fsPortStr] = fsHost.split(":");
    const fsPort = Number(fsPortStr || "8080");
    connectFirestoreEmulator(db, fsHostName, fsPort);

    const authHost = Deno.env.get("AUTH_EMULATOR_HOST") || "localhost:9099";
    const authUrl = /^https?:\/\//.test(authHost) ? authHost : `http://${authHost}`;
    connectAuthEmulator(auth, authUrl);
}

export async function ensureAnonAuth() {
    // No-op if already signed in; otherwise sign in anonymously for demo convenience
    if (!auth.currentUser) {
        await signInAnonymously(auth);
    }
}
