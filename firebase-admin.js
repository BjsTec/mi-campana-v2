// firebase-admin.js (o el nombre de tu archivo de inicialización del Admin SDK)
// Este archivo inicializa el SDK de Firebase Admin en el servidor.
// Asegúrate de que este archivo esté en la ruta correcta para tus imports.

import * as admin from 'firebase-admin'

// ¡Importante! El SDK de Firebase Admin debe inicializarse solo una vez.
if (!admin.apps.length) {
  try {
    // === VERIFICACIÓN DE VARIABLES DE ENTORNO INDIVIDUALES ===
    // Asegúrate de que estas tres variables estén configuradas en Vercel
    // para los scopes de 'Production' y 'Preview'.
    if (
      !process.env.FIREBASE_ADMIN_PROJECT_ID ||
      !process.env.FIREBASE_ADMIN_PRIVATE_KEY ||
      !process.env.FIREBASE_ADMIN_CLIENT_EMAIL
    ) {
      throw new Error(
        'Faltan variables de entorno para Firebase Admin SDK. ' +
          'Asegúrate de configurar FIREBASE_ADMIN_PROJECT_ID, FIREBASE_ADMIN_PRIVATE_KEY y FIREBASE_ADMIN_CLIENT_EMAIL ' +
          'en Vercel para los entornos de Production y Preview.',
      )
    }

    // === INICIALIZACIÓN CON VARIABLES INDIVIDUALES ===
    // Construimos el objeto serviceAccount con las variables de entorno individuales.
    // CRÍTICO: Reemplazamos '\\n' por '\n' en la clave privada, ya que las variables de entorno
    // a menudo escapan los saltos de línea al ser configuradas.
    const serviceAccount = {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    }

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      // Opcional: Si usas Realtime Database y tienes una URL específica
      // databaseURL: "https://<TU_PROYECTO>.firebaseio.com",
    })
  } catch (error) {
    console.error('Error inicializando Firebase Admin SDK:', error)
    // Mensaje adicional para depuración:
    console.error(
      'Asegúrate de que las variables de entorno estén bien configuradas en Vercel ' +
        'y que el contenido de FIREBASE_ADMIN_PRIVATE_KEY sea el correcto y válido.',
    )
    // Dependiendo de la severidad, en producción podrías querer
    // que la aplicación falle rápidamente si no puede inicializar el Admin SDK.
  }
}

// Exporta las instancias de Auth y Firestore una vez inicializadas
export const adminAuth = admin.auth()
export const adminDb = admin.firestore()
