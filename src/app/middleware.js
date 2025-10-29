// src/middleware.js (o src/proxy.js)
import { updateSession } from '@/lib/supabase/middleware'
import { NextResponse } from 'next/server'

export async function middleware(request) {
  // Actualiza la sesión (maneja cookies)
  const response = await updateSession(request)

  // Lógica de protección de rutas (Ejemplo básico)
  const supabase = createServerClient(/* ... tu config middleware ... */); // Necesitas crear el cliente aquí también
  const { data: { user } } = await supabase.auth.getUser()

  // Si el usuario no está autenticado y trata de acceder a rutas privadas
  if (!user && request.nextUrl.pathname.startsWith('/dashboard-')) {
    const url = request.nextUrl.clone()
    url.pathname = '/login' // Redirigir a login
    return NextResponse.redirect(url)
  }

  // Si el usuario está autenticado y trata de acceder a login/registro
  if (user && (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/registro-publico')) {
     const url = request.nextUrl.clone()
     url.pathname = '/dashboard-redirect' // Redirigir al dashboard adecuado
     return NextResponse.redirect(url)
  }

  // Añadir aquí lógica más granular basada en roles si es necesario

  return response // Continuar con la respuesta (puede tener cookies actualizadas)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}