import { applicationDefault, cert, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";
import dotenv from "dotenv";
dotenv.config();

// Credentials, in order of preference:
// - FIREBASE_SERVICE_ACCOUNT: the service account key JSON pasted into one env var (easiest on Render)
// - GOOGLE_APPLICATION_CREDENTIALS: a path to the key file
const credential = () => {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        return cert(JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT));
    }
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
        return applicationDefault();
    }
    return null;
};

let auth = null;
let db = null;

try {
    const cred = credential();
    if (cred) {
        const app = initializeApp({ credential: cred });
        auth = getAuth(app);
        db = getFirestore(app);
    } else {
        console.warn("Firebase Admin isn't configured (set FIREBASE_SERVICE_ACCOUNT). Career reports are disabled.");
    }
} catch (error) {
    console.error("Couldn't start Firebase Admin:", error.message);
}

export { auth, db };
