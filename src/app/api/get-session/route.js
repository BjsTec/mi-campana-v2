// src/app/api/get-session/route.js
import { verify } from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sessionCookie = cookies().get('__session')?.value

    if (!sessionCookie) {
      // Si no hay cookie, no hay sesión
      return NextResponse.json({ user: null, idToken: null }, { status: 401 }) // ¡CORRECCIÓN! Añadir idToken: null
    }

    const jwtSecret = process.env.JWT_SECRET
    if (!jwtSecret) {
      console.error(
        'API (get-session): La clave secreta JWT_SECRET no está configurada.',
      )
      return NextResponse.json(
        { message: 'Error de configuración del servidor.' },
        { status: 500 },
      )
    }

    const decodedToken = verify(sessionCookie, jwtSecret, {
      algorithms: ['HS256'],
    })

    // Si el token es válido, devuelve los datos del usuario Y el token mismo
    return NextResponse.json(
      {
        user: decodedToken,
        idToken: sessionCookie, // ¡CORRECCIÓN CLAVE! Devolver el sessionCookie como idToken
      },
      { status: 200 },
    )
  } catch (error) {
    // Si el token es inválido o expirado, no hay sesión
    console.error('API (get-session): Token de sesión inválido.', error.message)
    // Es importante devolver una respuesta de error consistente
    return NextResponse.json(
      { user: null, idToken: null, error: 'Token inválido o expirado.' }, // ¡CORRECCIÓN! Añadir idToken: null
      { status: 401 },
    )
  }
}
