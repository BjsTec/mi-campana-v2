// src/app/middleware.js
import { verify } from 'jsonwebtoken' // Import 'verify' directamente
import { NextResponse } from 'next/server'

// Las rutas que NO requieren autenticación (públicas)
const PUBLIC_FILE = /\.(.*)$/ // Archivos estáticos
const PUBLIC_ROUTES = [
  '/', // Tu home comercial
  '/login', // Página de login
  '/forgot-password', // Página de olvido de contraseña
  '/registro-publico', // ¡AÑADIDO! Formulario de registro público de leads (Votantes de Opinión)
  '/auto-registro-qr', // ¡AÑADIDO! Formulario de auto-registro vía QR
  '/planes', // ¡AÑADIDO! Página de planes y precios
  '/contacto', // ¡AÑADIDO! Página de contacto
  '/dashboard-test', // ¡AÑADIDO! Permite que esta página sea cargada después del login exitoso.

  // Aquí puedes añadir cualquier otra ruta pública de tu frontend que no requiera login.
]

// Middleware se ejecuta para cada solicitud que coincida con el matcher
export async function middleware(request) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // 1. Manejar rutas públicas y archivos estáticos:
  // Si la ruta es pública, un archivo estático, o un archivo interno de Next.js, permite el acceso.
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith('/_next')
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
  // JWT_SECRET debe estar configurado como variable de entorno en Vercel para el despliegue.
  const jwtSecret = process.env.JWT_SECRET

  if (!jwtSecret) {
    console.error(
      'Middleware: La clave secreta JWT_SECRET no está configurada en las variables de entorno de Vercel.',
    )
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  try {
    // Verificar el token JWT usando el secreto.
    // El 'verify' de jsonwebtoken funciona directamente con la cadena del secreto.
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
// Este matcher excluye:
// - Rutas que comienzan con /api (tus API Routes de Next.js, que manejan su propia autenticación)
// - Archivos estáticos internos de Next.js
// - Imágenes de Next.js
// - favicon.ico y archivos .png (ya cubiertos por PUBLIC_FILE, pero explícito para más seguridad)
// Debería ejecutarse para todas las demás rutas que no están en PUBLIC_ROUTES.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
