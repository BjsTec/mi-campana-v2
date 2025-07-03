// src/app/api/logout/route.js
import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  try {
    // Para borrar una cookie, la establecemos con una fecha de expiración en el pasado.
    cookies().set('__session', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(0), // Fecha en el pasado para borrarla
      path: '/',
      sameSite: 'lax',
    })

    return NextResponse.json(
      { message: 'Sesión cerrada exitosamente.' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor.' },
      { status: 500 },
    )
  }
}
