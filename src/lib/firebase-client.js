// src/lib/firebase-client.js
import { initializeApp, getApps, getApp } from 'firebase/app'
import { getAuth } from 'firebase/auth' // Para Firebase Authentication
import { getFirestore } from 'firebase/firestore' // Para Firestore

// Tu configuración de Firebase desde tus variables de entorno NEXT_PUBLIC_
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Opcional, si usas Analytics
}

// Inicializa Firebase si no ha sido inicializado ya
// Esto previene errores de "Firebase App already exists" en Next.js
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()

// Exporta los servicios que usarás
const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }
