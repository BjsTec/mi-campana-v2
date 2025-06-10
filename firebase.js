// src/lib/firebaseClient.js
// Este archivo inicializa el SDK de Firebase Cliente para el frontend.
// Asegúrate de que tus variables de entorno NEXT_PUBLIC_FIREBASE_...
// estén configuradas en .env.local y en Vercel.

import { initializeApp, getApp } from 'firebase/app' // getApp ya no es estrictamente necesario aquí si pasamos 'app' directamente
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Si vas a usar Realtime Database, descomenta las siguientes líneas:
// import { getDatabase } from 'firebase/database';
// export const database = getDatabase(app);

// Si vas a usar Analytics, descomenta las siguientes líneas:
// import { getAnalytics } from 'firebase/analytics';
// const analytics = getAnalytics(app);

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Para Google Analytics, si lo usas
}

// Inicializa la aplicación de Firebase.
// Asegúrate de que solo se inicialice una vez para evitar errores.
let app
try {
  app = getApp() // Intenta obtener la aplicación ya inicializada
} catch (e) {
  app = initializeApp(firebaseConfig) // Si no hay, inicialízala
}

// Inicializa los servicios de Firebase a partir de la instancia 'app'.
export const auth = getAuth(app)
export const db = getFirestore(app)

// La lógica para obtener el ID Token de un usuario autenticado
// NO debe ir aquí directamente en el ámbito global del archivo.
// Debe ir dentro de un componente React (por ejemplo, usando un useEffect)
// o en una función que se ejecute después de que el usuario inicie sesión.
// Ejemplo:
/*
import { useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth'; // Importar de firebase/auth

// Dentro de un componente React (Client Component):
function MyComponent() {
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        user.getIdToken().then(idToken => {
          console.log('ID Token:', idToken);
          // Aquí puedes enviar el idToken a tu API Route si es necesario
        });
      } else {
        console.log('Ningún usuario está autenticado.');
      }
    });
    return () => unsubscribe(); // Limpieza al desmontar el componente
  }, []);
  // ... resto del componente
}
*/

// Si necesitas exportar otros servicios (como analytics o storage), hazlo aquí.
// export { db, analytics }; // Ejemplo si exportas analytics
// export const storage = getStorage(app); // Ejemplo si usas Cloud Storage
