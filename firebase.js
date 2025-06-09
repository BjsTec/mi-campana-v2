// firebase.js
     import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Añadido el measurementId
// };

const firebaseConfig = {
  apiKey: "AIzaSyCwKc5HVl2alh2EGkqIfprAKKN-0xO8Xa0",
  authDomain: "micampanav2.firebaseapp.com",
  projectId: "micampanav2",
  storageBucket: "micampanav2.firebasestorage.app",
  messagingSenderId: "421768919648",
  appId: "1:421768919648:web:ea837d9fea5bcdf2e86105",
  measurementId: "G-64QBM4HCBS" // Opcional, si usas Analytics
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Si vas a usar Analytics, también lo inicializas aquí
// import { getAnalytics } from "firebase/analytics";
// const analytics = getAnalytics(app);

import { getAuth } from 'firebase/auth';
import { getApp } from 'firebase/app';


const auth = getAuth(getApp()); // Asegúrate de que tu app de Firebase esté inicializada

if (auth.currentUser) {
  auth.currentUser.getIdToken().then(idToken => {
    console.log('Tu Firebase ID Token (válido por ~1 hora):');
    console.log(idToken);
  }).catch(error => {
    console.error('Error al obtener el ID Token:', error);
  });
} else {
  console.log('Ningún usuario está autenticado. Por favor, inicia sesión primero.');
}

export { db };
// export { db, analytics }; // Si decides exportar analytics