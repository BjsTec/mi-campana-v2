// src/app/api/auth/login/route.js
// Endpoint para manejar el login de usuarios.

import { NextResponse } from 'next/server'

import { adminAuth, adminDb } from '../../../../../firebase-admin'

/**
 * Maneja las solicitudes POST para el login de usuarios.
 * Recibe un 'idToken' generado por el SDK de Firebase Cliente.
 * Este token es verificado por el SDK de Firebase Admin en el servidor.
 * Si el token es válido, se obtiene la información del usuario (incluido el rol de Firestore).
 *
 * @param {Request} request El objeto Request de Next.js.
 * @returns {Promise<NextResponse>} Una respuesta JSON indicando el éxito o fracaso del login.
 */
export async function POST(request) {
  try {
    const { idToken } = await request.json()

    if (!idToken) {
      return NextResponse.json(
        { message: 'ID Token es requerido.' },
        { status: 400 },
      )
    }

    const decodedToken = await adminAuth.verifyIdToken(idToken)

    const userDocRef = adminDb.collection('users').doc(decodedToken.uid)
    const userDoc = await userDocRef.get()

    let userData = {}
    let userRole = 'default'

    if (userDoc.exists) {
      userData = userDoc.data()
      userRole = userData.role || 'default'
    } else {
      console.warn(
        `Documento de usuario con UID ${decodedToken.uid} no encontrado en Firestore durante el login. Creando documento base.`,
      )
      const defaultUserData = {
        id: decodedToken.uid,
        email: decodedToken.email,
        nombre: decodedToken.name || 'Usuario sin nombre',
        role: userRole,
        status: 'active',
        created_at: new Date().toISOString(),
      }
      await userDocRef.set(defaultUserData)
      userData = defaultUserData
    }

    const responseUser = {
      uid: decodedToken.uid,
      email: decodedToken.email,
      role: userRole,
      nombre: userData.nombre,
    }

    return NextResponse.json(
      { message: 'Login exitoso.', user: responseUser },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error en el login:', error)

    let errorMessage = 'Login fallido. Por favor, intente de nuevo.'
    if (error.code === 'auth/id-token-expired') {
      errorMessage = 'Su sesión ha expirado. Por favor, inicie sesión de nuevo.'
    } else if (error.code === 'auth/invalid-id-token') {
      errorMessage = 'Token de autenticación inválido.'
    } else if (error.code === 'auth/argument-error') {
      errorMessage = 'Token de autenticación faltante o inválido.'
    }

    return NextResponse.json(
      { message: errorMessage, error: error.message },
      { status: 401 },
    )
  }
}
