// src/app/middleware.js
import { NextResponse } from 'next/server'
import jwt from 'jsonwebtoken' // Necesitarás instalar esta librería también en la raíz de tu proyecto Next.js

// Las rutas que NO requieren autenticación (públicas)
const PUBLIC_FILE = /\.(.*)$/ // Archivos estáticos
const PUBLIC_ROUTES = [
  '/', // Tu home comercial
  '/login', // Página de login
  '/forgot-password', // Página de olvido de contraseña
  // Añade aquí cualquier otra ruta pública que tengas o vayas a tener (ej. '/about', '/contact')
]

// Middleware se ejecuta para cada solicitud que coincida con el matcher
export async function middleware(request) {
  const { pathname } = request.nextUrl // Obtiene la ruta actual de la solicitud
  const response = NextResponse.next() // Prepara una respuesta por defecto

  // 1. Manejar rutas públicas y archivos estáticos:
  // Si la ruta es pública o un archivo estático, simplemente permite el acceso
  if (
    PUBLIC_ROUTES.includes(pathname) ||
    PUBLIC_FILE.test(pathname) ||
    pathname.startsWith('/_next') // Archivos internos de Next.js
  ) {
    return response
  }

  // 2. Obtener el token de sesión desde las cookies de la solicitud
  // Importante: El middleware SOLO puede leer cookies, no localStorage.
  // Más adelante, ajustaremos el login para que guarde el JWT en una cookie.
  const sessionCookie = request.cookies.get('__session')?.value

  // 3. Verificar la existencia del token
  if (!sessionCookie) {
    // Si no hay cookie de sesión, redirige al usuario a la página de login
    console.log(
      'Middleware: No se encontró cookie de sesión. Redirigiendo a /login',
    )
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 4. Verificar la validez del token JWT (usando la clave secreta)
  const jwtSecret = process.env.BJS_APP_MI_CAMPANA_V2 // Accede a tu clave secreta
  if (!jwtSecret) {
    console.error(
      'Middleware: La clave secreta JWT no está configurada. Protege tus rutas.',
    )
    // En un entorno de producción, esto debería redirigir a una página de error o login
    return NextResponse.next() // Permitir temporalmente para depuración si la clave falta
  }

  try {
    // Verifica el token. Si no es válido o está expirado, lanzará un error.
    jwt.verify(sessionCookie, jwtSecret)
    console.log('Middleware: Token JWT válido. Permitiendo acceso.')
    // Si el token es válido, permite que la solicitud continúe
    return response
  } catch (error) {
    console.error('Middleware: Token JWT inválido o expirado:', error.message)
    // Si el token no es válido o está expirado, limpia la cookie y redirige a /login
    const loginUrl = new URL('/login', request.url)
    const redirectResponse = NextResponse.redirect(loginUrl)
    redirectResponse.cookies.delete('__session') // Limpia la cookie inválida
    return redirectResponse
  }
}

// Configuración del matcher: Define para qué rutas se ejecutará el middleware.
// Aquí, se ejecutará para todas las rutas EXCEPTUANDO las públicas y los archivos estáticos.
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$).*)'],
}
