// src/components/landing/Footer.js
import React from 'react'
import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-neutral-50 py-12">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Columna 1: Logo y Descripción */}
        <div className="text-center md:text-left">
          <Link
            href="/"
            className="text-3xl font-bold text-neutral-50 hover:text-secondary-DEFAULT transition-colors duration-200"
          >
            Autoridad Política
          </Link>
          <p className="mt-4 text-neutral-300 text-sm leading-relaxed">
            La plataforma líder para la gestión estratégica de campañas
            políticas. Optimiza tu alcance, organiza tu equipo y maximiza tu
            impacto.
          </p>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div className="text-center md:text-left">
          <h3 className="text-xl font-semibold mb-4 text-neutral-50">
            Enlaces Rápidos
          </h3>
          <ul className="space-y-2 text-neutral-300 text-sm">
            <li>
              <Link
                href="#inicio"
                className="hover:text-secondary-DEFAULT transition-colors duration-200"
              >
                Inicio
              </Link>
            </li>
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
                Planes y Precios
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
            <li>
              <Link
                href="/politica-privacidad"
                className="hover:text-secondary-DEFAULT transition-colors duration-200"
              >
                Política de Privacidad
              </Link>
            </li>
            <li>
              <Link
                href="/terminos-servicio"
                className="hover:text-secondary-DEFAULT transition-colors duration-200"
              >
                Términos de Servicio
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Contacto y Redes Sociales */}
        <div className="text-center md:text-left">
          <h3 className="text-xl font-semibold mb-4 text-neutral-50">
            Contáctanos
          </h3>
          <p className="text-neutral-300 text-sm mb-4">
            Email:{' '}
            <a
              href="mailto:info@autoridadpolitica.com"
              className="hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              info@autoridadpolitica.com
            </a>
          </p>
          <p className="text-neutral-300 text-sm mb-6">
            Teléfono:{' '}
            <a
              href="tel:+573001234567"
              className="hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              +57 300 123 4567
            </a>{' '}
            (Ejemplo)
          </p>

          {/* Redes Sociales (Iconos Placeholder) */}
          <div className="flex justify-center md:justify-start space-x-4">
            <a
              href="https://facebook.com/autoridadpolitica"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-50 hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3 8h-1.5c-.828 0-1.5.672-1.5 1.5V12h3l-.5 3h-2.5v7h-3v-7h-2v-3h2v-2c0-1.657 1.343-3 3-3h3V8z" />
              </svg>
            </a>
            <a
              href="https://twitter.com/autoridadpolitic"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-50 hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.5 6.5c-.5.2-1 .3-1.5.3.6-.4 1-.9 1.2-1.5-.5.3-1.1.5-1.7.6-.5-.5-1.2-.8-1.9-.8-1.5 0-2.7 1.2-2.7 2.7 0 .2 0 .4.1.6-2.2-.1-4.2-1.2-5.5-3-.2.4-.3.9-.3 1.4 0 .9.5 1.7 1.2 2.2-.4 0-.9-.1-1.2-.3v.1c0 1.3.9 2.3 2.1 2.6-.2.1-.5.1-.7.1-.2 0-.4 0-.6-.1.3 1.1 1.3 1.9 2.4 1.9-1 .8-2.2 1.3-3.6 1.3-.2 0-.4 0-.7 0C6.5 18.2 8 18.7 9.5 18.7c10.2 0 15.7-8.5 15.7-15.7 0-.2 0-.5-.1-.7.7-.5 1.2-1.1 1.6-1.8z" />
              </svg>
            </a>
            <a
              href="https://instagram.com/autoridadpolitica"
              target="_blank"
              rel="noopener noreferrer"
              className="text-neutral-50 hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.16c3.15 0 3.53.012 4.77.072 1.2.06 1.83.25 2.22.408.4.168.66.36.9.6.24.24.432.5.6.9.168.4.348 1.02.408 2.22.06 1.24.072 1.62.072 4.77s-.012 3.53-.072 4.77c-.06 1.2-.25 1.83-.408 2.22-.168.4-.36.66-.6.9-.24.24-.5.432-.9.6-.4.168-1.02.348-2.22.408-1.24.06-1.62.072-4.77.072s-3.53-.012-4.77-.072c-1.2-.06-1.83-.25-2.22-.408-.4-.168-.66-.36-.9-.6-.24-.24-.5-.432-.9-.6-.168-.4-.348-1.02-.408-2.22-.06-1.24-.072-1.62-.072-4.77s.012-3.53.072-4.77c.06-1.2.25-1.83.408-2.22.168-.4.36-.66.6-.9.24-.24.5-.432.9-.6.4-.168 1.02-.348 2.22-.408C8.47 2.172 8.85 2.16 12 2.16zm0 3.6c-3.46 0-6.26 2.8-6.26 6.26s2.8 6.26 6.26 6.26 6.26-2.8 6.26-6.26-2.8-6.26-6.26-6.26zm0 2.1c2.3 0 4.16 1.86 4.16 4.16s-1.86 4.16-4.16 4.16-4.16-1.86-4.16-4.16 1.86-4.16 4.16-4.16zm5.25-5.25c.57 0 1.03.46 1.03 1.03s-.46 1.03-1.03 1.03-1.03-.46-1.03-1.03.46-1.03 1.03-1.03z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-neutral-400 text-sm">
        &copy; {new Date().getFullYear()} Autoridad Política. Todos los derechos
        reservados.
      </div>
    </footer>
  )
}
