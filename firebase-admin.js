// firebase-admin.js
// Configuración del SDK de Firebase Admin.
// ¡Este archivo DEBE usarse SOLO en el lado del servidor (API Routes de Next.js)!
// NUNCA expongas tus credenciales de servicio de Firebase Admin al cliente.

import { initializeApp, getApps, getApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth'; // Importa getAuth para Firebase Admin Auth

let adminApp;
if (!getApps().length) {
  adminApp = initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, '\n'), // Importante: Asegúrate de que las nuevas líneas sean correctas
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    })
  });
} else {
  adminApp = getApp();
}

const adminDb = getFirestore(adminApp);
const adminAuth = getAuth(adminApp); // Inicializa y exporta adminAuth también

export { adminDb, adminAuth }; // Asegúrate de exportar ambos
