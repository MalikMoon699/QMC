import { getAnalytics } from "firebase/analytics";
import { initializeApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getMessaging, getToken } from "firebase/messaging";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);
const messaging = getMessaging(app);

export const generateToken = async () => {
  const permission = await Notification.requestPermission();
  if (permission === "granted") {
    const token = await getToken(messaging, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
    });
    console.log("Token:", token);
    await setDoc(doc(db, "user_tokens", auth.currentUser.uid), {
      token: token,
      email: auth.currentUser.email,
      createdAt: new Date(),
    });
    return token;
  }
};

export { app, auth, db, storage, provider, messaging };
