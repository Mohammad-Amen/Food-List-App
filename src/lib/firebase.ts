import AsyncStorage from '@react-native-async-storage/async-storage';
import { getApp, getApps, initializeApp } from 'firebase/app';
import * as firebaseAuth from 'firebase/auth';
import { type Auth, getAuth, initializeAuth, type Persistence } from 'firebase/auth';
import { type Firestore, getFirestore } from 'firebase/firestore';

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// On React Native, Metro resolves firebase/auth to the react-native build, which
// exports getReactNativePersistence; the package's typings just don't declare it.
const getReactNativePersistence = (firebaseAuth as any).getReactNativePersistence as (
  storage: typeof AsyncStorage,
) => Persistence;

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

let auth: Auth | null = null;
let db: Firestore | null = null;

if (isFirebaseConfigured) {
  const firstInit = getApps().length === 0;
  const app = firstInit ? initializeApp(config) : getApp();
  // initializeAuth may only run once; fast refresh re-evaluates this module.
  auth = firstInit
    ? initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) })
    : getAuth(app);
  db = getFirestore(app);
}

export function getDb(): Firestore {
  if (!db) throw new Error('Firebase is not configured');
  return db;
}

export function getAuthInstance(): Auth {
  if (!auth) throw new Error('Firebase is not configured');
  return auth;
}
