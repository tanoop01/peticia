import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, browserLocalPersistence, setPersistence } from 'firebase/auth';
import { getStorage, FirebaseStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
let app: FirebaseApp;
let auth: Auth;
let storage: FirebaseStorage;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
    
    // App Check disabled temporarily - not required for SMS in development
    // Will enable for production with proper reCAPTCHA Enterprise setup
    // if (process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY) {
    //   try {
    //     initializeAppCheck(app, {
    //       provider: new ReCaptchaV3Provider(process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY),
    //       isTokenAutoRefreshEnabled: true
    //     });
    //     console.log('[App Check] Initialized successfully');
    //   } catch (error) {
    //     console.error('[App Check] Initialization failed:', error);
    //   }
    // }
  } else {
    app = getApps()[0];
  }
  
  auth = getAuth(app);
  
  // Set auth persistence to LOCAL (survives page refreshes and browser restarts)
  setPersistence(auth, browserLocalPersistence).catch((error) => {
    console.error('Auth persistence error:', error);
  });
  
  storage = getStorage(app);
}

export { app, auth, storage };
