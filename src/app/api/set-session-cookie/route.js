// src/app/api/set-session-cookie/route.js
import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken'; // Necesario para verificar el JWT

export async function POST(request) {
  const { idToken } = await request.json(); // Espera el JWT personalizado del cliente

  const jwtSecret = process.env.BJS_APP_MI_CAMPANA_V2; // Accede a tu clave secreta
  if (!jwtSecret) {
    console.error('API: JWT_SECRET no configurado en variables de entorno para set-session-cookie.');
    return NextResponse.json(
      { message: 'Error interno del servidor: clave secreta no configurada.' },
      { status: 500 }
    );
  }

  if (!idToken) {
    return NextResponse.json(
      { message: 'Token de autenticación no proporcionado.' },
      { status: 400 }
    );
  }

  try {
    // 1. Verificar la validez del JWT recibido del cliente
    const decoded = jwt.verify(idToken, jwtSecret);

    // 2. Calcular la duración de la cookie
    // El 'exp' del JWT está en segundos UNIX. Date.now() está en milisegundos.
    const expiresInMs = (decoded.exp * 1000) - Date.now(); // Tiempo de vida restante en milisegundos

    // 3. Crear una respuesta de éxito
    const response = NextResponse.json(
      { message: 'Sesión iniciada exitosamente.' },
      { status: 200 }
    );

    // 4. Establecer la cookie de sesión en la respuesta
    response.cookies.set('__session', idToken, {
      httpOnly: true, // ¡CRÍTICO! La cookie no es accesible por JavaScript en el navegador
      secure: process.env.NODE_ENV === 'production', // ¡CRÍTICO! Solo se envía sobre HTTPS en producción
      maxAge: expiresInMs / 1000, // Duración de la cookie en segundos (igual a la del JWT)
      path: '/', // La cookie está disponible para toda la aplicación
      sameSite: 'lax', // Protección CSRF básica
    });

    console.log('API: Cookie de sesión HttpOnly establecida para UID:', decoded.uid);
    return response;
  } catch (error) {
    console.error('API: Error al verificar JWT o establecer cookie:', error);
    return NextResponse.json(
      { message: 'Token inválido o expirado. Sesión no establecida.' },
      { status: 401 }
    );
  }
}