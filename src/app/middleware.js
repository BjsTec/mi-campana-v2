// src/middleware.js
import { verify } from 'jsonwebtoken' // Import 'verify' directamente
import { NextResponse } from 'next/server'

// Las rutas que NO requieren autenticación (públicas)
const PUBLIC_FILE = /\.(.*)$/ // Archivos estáticos
const PUBLIC_ROUTES = [
  '/', // Tu home comercial
  '/login', // Página de login
  '/forgot-password', // Página de olvido de contraseña
]

// Middleware se ejecuta para cada solicitud que coincida con el matcher
export async function middleware(request) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // 1. Manejar rutas públicas y archivos estáticos:
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith('/_next') // Archivos internos de Next.js
  ) {
    return response
  }

  // 2. Verificar la cookie de sesión para rutas protegidas
  const sessionCookie = request.cookies.get('__session')?.value

  if (!sessionCookie) {
    console.log(
      'Middleware: No se encontró cookie de sesión. Redirigiendo a /login',
    )
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 3. Acceder a la clave secreta y verificar el token
  // --- CORRECCIÓN 1: Usar el nombre correcto de la variable de entorno ---
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    console.error(
      'Middleware: La clave secreta JWT_SECRET no está configurada en .env.local',
    )
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // --- CORRECCIÓN 2: Verificar el token usando el secreto como texto simple ---
    // No es necesario convertirlo a un Buffer.
    verify(sessionCookie, jwtSecret, { algorithms: ['HS256'] })

    console.log('Middleware: Token JWT válido. Permitiendo acceso a:', pathname)
    return response // Permite el acceso a la ruta solicitada
  } catch (error) {
    console.error('Middleware: Token JWT inválido o expirado:', error.message)
    const loginUrl = new URL('/login', request.url)
    const redirectResponse = NextResponse.redirect(loginUrl)
    redirectResponse.cookies.delete('__session') // Limpia la cookie inválida
    return redirectResponse
  }
}

// Configuración del matcher: Define para qué rutas se ejecutará el middleware.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
