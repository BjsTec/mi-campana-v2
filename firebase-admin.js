// src/lib/auth/serverAuth.js
// Archivo para inicializar el SDK de Firebase Admin en el servidor.

import * as admin from 'firebase-admin'

// Importaciones de firebase-admin/app (si usas la sintaxis modular)
// o simplemente 'firebase-admin' si usas la sintaxis de espacio de nombres.
// Asumo que tu importación de firebase-admin viene de firebase-admin.
// Si tu archivo .json se llama micampanav2-firebase-adminsdk-fbsvc-e9d4a4f70f.json
// y lo estás cargando como una variable de entorno, así se vería:

// Asegúrate de que esta variable de entorno contenga el contenido JSON completo
// de tu archivo Firebase Admin SDK Service Account Key.
// Por ejemplo, en tu .env.local:
// FIREBASE_ADMIN_SDK_KEY='{"type": "service_account", "project_id": "...", "private_key_id": "...", "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n", "client_email": "...", "client_id": "...", "auth_uri": "...", "token_uri": "...", "auth_provider_x509_cert_url": "...", "client_x509_cert_url": "...", "universe_domain": "..."}'

// ¡Importante! Firebase Admin SDK debe inicializarse solo una vez.
if (!admin.apps.length) {
  try {
    const serviceAccount = JSON.parse(process.env.FIREBASE_ADMIN_SDK_KEY)

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Si usas Realtime Database, podrías añadir:
      // databaseURL: "https://<TU_PROYECTO>.firebaseio.com",
    })
  } catch (error) {
    console.error('Error inicializando Firebase Admin SDK:', error)
    // En un entorno de producción, podrías querer manejar este error
    // de forma más robusta, por ejemplo, saliendo del proceso
    // si las credenciales son vitales para la aplicación.
  }
}

// Exporta las instancias de Auth y Firestore una vez inicializadas
export const adminAuth = admin.auth()
export const adminDb = admin.firestore()

