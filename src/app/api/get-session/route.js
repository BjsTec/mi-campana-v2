// src/app/api/get-session/route.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'

// --- CORRECCIÓN ---
// Forzar el renderizado dinámico para esta ruta.
// Esto asegura que las cookies se lean en cada solicitud y resuelve el error de la consola.
export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    // 1. Obtener la cookie de la solicitud
    const sessionCookie = cookies().get('__session')?.value

    if (!sessionCookie) {
      // Si no hay cookie, no hay sesión
      return NextResponse.json({ user: null }, { status: 401 })
    }

    // 2. Obtener la clave secreta
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

    // 3. Verificar el token de la cookie
    const decodedToken = verify(sessionCookie, jwtSecret, {
      algorithms: ['HS256'],
    })

    // Si el token es válido, devuelve los datos del usuario
    return NextResponse.json({ user: decodedToken }, { status: 200 })
  } catch (error) {
    // Si el token es inválido o expirado, no hay sesión
    console.error('API (get-session): Token de sesión inválido.', error.message)
    // Es importante devolver una respuesta de error consistente
    return NextResponse.json(
      { user: null, error: 'Token inválido o expirado.' },
      { status: 401 },
    )
  }
}
