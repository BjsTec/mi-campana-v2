// src/components/landing/Header.js
// Este es un Client Component ya que usa Link de Next.js y podría necesitar estado para un menú móvil.
'use client'

import Link from 'next/link'
import { useState } from 'react' // Importar useState para el menú móvil

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="absolute top-0 left-0 right-0 z-50 p-6 md:p-8">
      <nav className="container mx-auto flex justify-between items-center">
        {/* Logotipo */}
        <div className="text-2xl font-bold text-neutral-50">
          {' '}
          {/* Mantenemos blanco para el logo */}
          <Link href="/">Autoridad Política</Link>
        </div>

        {/* Navegación para escritorio */}
        <ul className="hidden md:flex space-x-8 text-neutral-50">
          {' '}
          {/* Cambiado a blanco para máxima visibilidad */}
          <li>
            <Link
              href="#inicio"
              className="hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              Inicio
            </Link>
          </li>{' '}
          {/* Hover a amarillo/dorado */}
          <li>
            <Link
              href="#caracteristicas"
              className="hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              Características
            </Link>
          </li>
          <li>
            <Link
              href="#planes"
              className="hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              Planes
            </Link>
          </li>
          <li>
            <Link
              href="#app-movil"
              className="hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              App Móvil
            </Link>
          </li>
          <li>
            <Link
              href="#contacto"
              className="hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              Contacto
            </Link>
          </li>
        </ul>

        {/* Botón de Acción */}
        <div className="hidden md:block">
          {' '}
          {/* Solo visible en escritorio */}
          <Link
            href="/login"
            className="bg-secondary-DEFAULT text-neutral-50 px-6 py-2 rounded-full font-semibold hover:bg-secondary-light transition-colors duration-200 shadow-lg" // Cambiado a blanco para el texto del botón
          >
            Registrarse / Acceder
          </Link>
        </div>

        {/* Menú hamburguesa para móviles */}
        <div className="md:hidden">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="text-neutral-50 focus:outline-none"
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d={
                  isMobileMenuOpen
                    ? 'M6 18L18 6M6 6l12 12'
                    : 'M4 6h16M4 12h16M4 18h16'
                }
              ></path>
            </svg>
          </button>
        </div>
      </nav>

      {/* Menú móvil desplegable */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-primary-dark p-6 mt-4 rounded-lg shadow-xl">
          <ul className="flex flex-col space-y-4 text-neutral-50">
            <li>
              <Link
                href="#inicio"
                className="block py-2 hover:text-secondary-DEFAULT transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                href="#caracteristicas"
                className="block py-2 hover:text-secondary-DEFAULT transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Características
              </Link>
            </li>
            <li>
              <Link
                href="#planes"
                className="block py-2 hover:text-secondary-DEFAULT transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Planes
              </Link>
            </li>
            <li>
              <Link
                href="#app-movil"
                className="block py-2 hover:text-secondary-DEFAULT transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                App Móvil
              </Link>
            </li>
            <li>
              <Link
                href="#contacto"
                className="block py-2 hover:text-secondary-DEFAULT transition-colors duration-200"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contacto
              </Link>
            </li>
            <li>
              <Link
                href="/login"
                className="block w-full text-center bg-secondary-DEFAULT text-neutral-50 px-6 py-2 rounded-full font-semibold hover:bg-secondary-light transition-colors duration-200 shadow-lg mt-4" // Cambiado a blanco para el texto del botón
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Registrarse / Acceder
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  )
}
