'use client' // <-- ESENCIAL: Este layout usa hooks, por eso es un componente de cliente

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation' // Para redirección, ej. después del logout
import { useAuth } from '@/context/AuthContext' // Para acceder al usuario y la función de logout

export default function ExternalClientDashboardLayout({ children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false) // Estado para controlar el menú hamburguesa
  const router = useRouter()
  const { user, logout } = useAuth() // Obtiene el usuario autenticado y la función de logout

  // Hook para redirigir si el usuario no está autenticado
  // Se ejecuta cuando 'user' o 'router' cambian
  useEffect(() => {
    if (!user) {
      router.push('/login') // Redirige al login si no hay usuario autenticado
    }
  }, [user, router])

  // Muestra un estado de carga mientras el usuario se verifica o redirige
  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-700">Cargando perfil...</p>
        {/* Podrías usar aquí tu componente Lottie de carga si lo deseas */}
      </div>
    )
  }

  // Función para cerrar sesión
  const handleLogout = async () => {
    await logout() // Llama a la función de logout del contexto (que ya incluye Firebase signOut y limpieza de localStorage)
    router.push('/login') // Redirige al usuario a la página de login después de cerrar sesión
  }

  return (
    // Contenedor principal del layout: ocupa toda la altura y es una columna flexible
    <div className="min-h-screen flex flex-col bg-gray-50">
      {' '}
      {/* Fondo general de la página más claro */}
      {/* --- INICIO: TOP NAVBAR (Barra superior para todos los roles) --- */}
      <header className="bg-white shadow-md py-4 px-6 flex justify-between items-center z-20">
        <div className="flex items-center">
          {/* Botón hamburguesa para móviles (se oculta en pantallas medianas/grandes) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden mr-4 p-2 rounded-md bg-primary text-white focus:outline-none focus:ring-2 focus:ring-primary-light"
            aria-label="Toggle menu"
          >
            {/* Iconos SVG para hamburguesa y 'X' */}
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
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
          {/* Título de la aplicación */}
          <h1 className="text-2xl font-bold text-primary-dark">La Campaña</h1>
        </div>

        {/* Saludo al usuario y botón de cerrar sesión para desktop */}
        <div className="flex items-center space-x-4">
          <span className="text-lg text-neutral-600">
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
      {/* --- FIN: TOP NAVBAR --- */}
      {/* Contenedor flexible para el Sidebar y el Contenido Principal */}
      <div className="flex flex-grow">
        {/* --- INICIO: BARRA LATERAL (SIDEBAR) --- */}
        <aside
          className={`fixed top-0 left-0 h-full w-56 bg-primary-dark text-white p-6 flex flex-col transition-transform duration-300 ease-in-out z-30
            ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} md:relative md:translate-x-0 md:flex md:flex-col md:shadow-md`}
        >
          {/* Título y Botón de cerrar para el menú en mobile (se ocultan en desktop) */}
          <div className="flex items-center justify-between md:hidden mb-6">
            <h2 className="text-xl font-bold text-white">La Campaña</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-md hover:bg-primary focus:outline-none focus:ring-2 focus:ring-primary-light"
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

          {/* Información del usuario en el sidebar (visible en todos los tamaños) */}
          <div className="mb-8 text-center">
            <p className="text-xl font-bold">{user.name}</p>
            <p className="text-primary-light text-sm capitalize">{user.role}</p>
          </div>

          {/* Navegación principal del Sidebar */}
          <nav className="flex flex-col gap-2.5 flex-grow">
            {/* --- OPCIONES DE MENÚ BASADAS EN EL ROL (ADMIN) --- */}
            {user.role === 'admin' && (
              <>
                <a
                  href="/dashboard-admin/nueva-campana"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
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
                      d="M12 4v16m8-8H4"
                    ></path>
                  </svg>
                  Nueva Campaña
                </a>
                <a
                  href="/dashboard-admin/lista-campanas"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
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
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    ></path>
                  </svg>
                  Lista de Campañas
                </a>
                <a
                  href="/dashboard-admin/clientes-potenciales"
                  className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
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
                      d="M17 20h2a2 2 0 002-2V7a2 2 0 00-2-2h-2v3m-2 10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h2v3m-2 10h2a2 2 0 002-2V7a2 2 0 00-2-2h-2v3m-2 10a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h2v3"
                    ></path>
                  </svg>
                  Clientes Potenciales
                </a>
              </>
            )}

            {/* --- ENLACES GENERALES DEL DASHBOARD (TODOS LOS ROLES) --- */}
            <a
              href="/dashboard-internal"
              className="flex items-center px-3 py-2 rounded-md text-neutral-100 hover:bg-primary hover:text-white font-medium"
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
                  d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0 0l7-7 7 7M19 10v10a1 1 0 01-1 1H8a1 1 0 01-1-1v-4m0 0L3 4m0 0l-2 2m2-2m4 0l4 4"
                ></path>
              </svg>
              Mi Panel Cliente
            </a>
          </nav>

          {/* Botón de Cerrar Sesión en Sidebar (solo para móviles) */}
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

        {/* --- INICIO: CONTENIDO PRINCIPAL --- */}
        {/* El flex-grow y la ausencia de md:ml- aquí permite que el main ocupe el espacio restante naturalmente. */}
        <main className="flex-grow p-8 bg-white rounded-lg shadow-lg relative z-10 md:rounded-tl-none md:rounded-bl-none">
          {children}
        </main>
        {/* --- FIN: CONTENIDO PRINCIPAL --- */}
      </div>
    </div>
  )
}
