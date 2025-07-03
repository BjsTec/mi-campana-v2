'use client' // <-- ESENCIAL: Este layout usa hooks, por eso es un componente de cliente

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation' // Para redirección, ej. después del logout
import { useAuth } from '@/context/AuthContext' // Para acceder al usuario y la función de logout
import Link from 'next/link' // Usar Link para navegación interna

export default function ExternalClientDashboardLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false) // Estado para controlar el menú hamburguesa
  const router = useRouter()
  const pathname = usePathname() // Hook para obtener la ruta actual

  // --- INICIO DE LA CORRECCIÓN ---
  // Obtenemos el usuario, la función de logout y el nuevo estado de 'loading' del contexto
  const { user, logout, loading } = useAuth()

  // Hook para redirigir si el usuario no está autenticado
  useEffect(() => {
    // Solo tomamos una decisión CUANDO la carga inicial ha terminado
    if (!loading && !user) {
      router.push('/login') // Redirige al login si no hay usuario autenticado
    }
  }, [user, loading, router])

  // Cierra el menú hamburguesa cada vez que la ruta cambia
  useEffect(() => {
    if (isMenuOpen) {
      setIsMenuOpen(false)
    }
  }, [pathname])

  // Muestra un estado de carga MIENTRAS el AuthContext verifica la sesión.
  // Esto evita la redirección prematura.
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-700">Verificando sesión...</p>
        {/* Aquí podrías usar tu componente Lottie de carga */}
      </div>
    )
  }

  // Si la carga terminó y AÚN no hay usuario, el useEffect se encargará de redirigir.
  // Este es un estado intermedio para evitar mostrar el dashboard por un instante.
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-700">Redirigiendo al login...</p>
      </div>
    )
  }
  // --- FIN DE LA CORRECCIÓN ---

  // Función para cerrar sesión
  const handleLogout = async () => {
    await logout()
    // La redirección ya está manejada dentro de la función logout del contexto
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center z-20">
        <div className="flex items-center">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden mr-4 p-2 rounded-md bg-primary text-white focus:outline-none focus:ring-2 focus:ring-primary-light"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              )}
            </svg>
          </button>
          <h1 className="text-2xl font-bold text-primary-dark">La Campaña</h1>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hidden sm:inline text-lg text-neutral-600">
            Hola,{' '}
            <span className="font-semibold">{user.name || user.email}!</span>
          </span>
          <button
            onClick={handleLogout}
            className="hidden md:flex items-center px-4 py-2 text-sm font-medium text-error bg-red-100 rounded-md hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-error"
          >
            <svg
              className="w-4 h-4 mr-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            Cerrar Sesión
          </button>
        </div>
      </header>
      <div className="flex flex-grow">
        <aside
          className={`fixed top-0 left-0 h-full w-64 bg-primary-dark text-white p-6 flex flex-col transition-transform duration-300 ease-in-out z-30
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex md:flex-col md:shadow-lg`}
        >
          <div className="flex items-center justify-between md:hidden mb-6">
            <h2 className="text-xl font-bold text-white">Menú</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-md hover:bg-primary"
              aria-label="Cerrar menú"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                ></path>
              </svg>
            </button>
          </div>
          <div className="mb-8 text-center">
            <p className="text-xl font-bold">{user.name}</p>
            <p className="text-primary-light text-sm capitalize">
              {user.role === 'admin' ? 'Web Master' : user.role}
            </p>
          </div>
          <nav className="flex flex-col gap-2.5 flex-grow overflow-y-auto">
            {/* --- OPCIONES DE MENÚ BASADAS EN EL ROL (ADMIN) --- */}
            {user.role === 'admin' && (
              <>
                <Link
                  href="/dashboard-admin/nueva-campana"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
                >
                  Nueva Campaña
                </Link>
                <Link
                  href="/dashboard-admin/lista-campanas"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
                >
                  Lista de Campañas
                </Link>
              </>
            )}
            {/* --- OPCIONES DE MENÚ BASADAS EN EL ROL (CANDIDATO) --- */}
            {user.role === 'candidato' && (
              <>
                <Link
                  href="/dashboard-candidato"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
                >
                  Mi Panel
                </Link>
                <Link
                  href="/dashboard-candidato/editar-campana"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
                >
                  Gestionar Campaña
                </Link>
                <Link
                  href="/dashboard-candidato/voto-opinion"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
                >
                  voto opinon
                </Link>
                <Link
                  href="/dashboard-candidato/galeria"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
                >
                  Galeria
                </Link>
              </>
            )}
            {/* ... Agrega más enlaces según sea necesario */}
          </nav>
          <button
            onClick={handleLogout}
            className="md:hidden mt-auto flex items-center px-3 py-2 rounded-md text-red-300 hover:bg-error hover:text-white font-medium w-full"
          >
            <svg
              className="w-5 h-5 mr-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              ></path>
            </svg>
            Cerrar Sesión
          </button>
        </aside>
        <main className="flex-grow p-4 sm:p-6 md:p-8">{children}</main>
      </div>
    </div>
  )
}
