// src/lib/auth/serverAuth.js
// Funciones de utilidad para la verificación de autenticación en el lado del servidor.

import { headers } from 'next/headers'

import { adminAuth, adminDb } from '../../../firebase-admin' // ¡Aquí importamos adminAuth!

/**
 * Verifica el token de autorización (Bearer token) de una solicitud HTTP.
 * Si el token es válido, decodifica el token y recupera información del usuario
 * desde Firebase Authentication y Firestore (para el rol del usuario).
 *
 * @param {Request} request El objeto Request de Next.js.
 * @returns {Promise<{uid?: string, email?: string, role?: string, error?: string}>}
 * Retorna un objeto con las propiedades `uid`, `email` y `role` del usuario si la verificación es exitosa.
 * En caso de fallo, retorna un objeto con una propiedad `error` que describe el problema.
 */
export async function verifyServerAuth(request) {
  const headersList = headers()
  const authorization = headersList.get('Authorization')

  if (!authorization || !authorization.startsWith('Bearer ')) {
    return {
      error:
        'No autorizado: Token de autorización no proporcionado o formato inválido.',
    }
  }

  const idToken = authorization.split('Bearer ')[1]

  try {
    const decodedToken = await adminAuth.verifyIdToken(idToken) // Aquí se usa adminAuth

    const userDocRef = adminDb.collection('users').doc(decodedToken.uid)
    const userDoc = await userDocRef.get()

    let role = 'default'

    if (userDoc.exists) {
      const userData = userDoc.data()
      if (userData && userData.role) {
        role = userData.role
      }
    } else {
      console.warn(
        `Documento de usuario con UID ${decodedToken.uid} no encontrado en Firestore durante la verificación de auth.`,
      )
    }

    return { uid: decodedToken.uid, email: decodedToken.email, role }
  } catch (error) {
    console.error(
      'Error al verificar el token de autenticación del servidor:',
      error,
    )
    let errorMessage = 'No autorizado: Token inválido o expirado.'
    if (error.code === 'auth/id-token-expired') {
      errorMessage =
        'No autorizado: Su sesión ha expirado. Por favor, inicie sesión de nuevo.'
    } else if (error.code === 'auth/invalid-id-token') {
      errorMessage = 'No autorizado: Token de sesión inválido.'
    }
    return { error: errorMessage }
  }
}
