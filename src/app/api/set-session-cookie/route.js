// src/app/api/set-session-cookie/route.js
import { verify } from 'jsonwebtoken'
import { NextResponse } from 'next/server'

export async function POST(request) {
  const { idToken } = await request.json() // Espera el JWT personalizado del cliente

  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    console.error(
      'API: La clave secreta JWT_SECRET no está configurada en .env.local',
    )
    return NextResponse.json(
      { message: 'Error interno del servidor: clave secreta no configurada.' },
      { status: 500 },
    )
  }

  if (!idToken) {
    return NextResponse.json(
      { message: 'Token de autenticación no proporcionado.' },
      { status: 400 },
    )
  }

  try {
    const decoded = verify(idToken, jwtSecret, { algorithms: ['HS256'] })

    const expiresInMs = decoded.exp * 1000 - Date.now()

    const response = NextResponse.json(
      {
        message: 'Sesión iniciada exitosamente.',
        idToken: idToken, // ¡CORRECCIÓN CLAVE! Devolver el idToken al frontend
        user: decoded, // Opcional: devolver el usuario decodificado si el frontend lo necesita aquí
      },
      { status: 200 },
    )

    // Establecer la cookie de sesión en la respuesta
    response.cookies.set('__session', idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: expiresInMs > 0 ? Math.floor(expiresInMs / 1000) : 0, // Duración en segundos
      path: '/',
      sameSite: 'lax',
    })

    console.log(
      'API: Cookie de sesión HttpOnly establecida para UID:',
      decoded.uid,
    )
    return response
  } catch (error) {
    console.error(
      'API: Error al verificar JWT o establecer cookie:',
      error.message,
    )
    return NextResponse.json(
      { message: 'Token inválido o expirado. Sesión no establecida.' },
      { status: 401 },
    )
  }
}
