// src/components/landing/AppShowcaseSection.js
import React from 'react'
import Link from 'next/link'

export default function AppShowcaseSection() {
  return (
    <section id="app-movil" className="py-20 bg-primary-dark text-neutral-50">
      {' '}
      {/* Cambiado a bg-primary-dark (color sólido) */}
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between">
        {/* Contenido de Texto */}
        <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
          <h2 className="text-4xl font-extrabold leading-tight mb-6">
            Autoridad Política Móvil: Tu Campaña Siempre Contigo
          </h2>
          <p className="text-xl opacity-90 mb-8">
            Accede a todas las herramientas de gestión de tu campaña desde la
            palma de tu mano. Organiza, coordina y mantente informado en
            cualquier momento y lugar.
          </p>
          <div className="flex justify-center md:justify-start space-x-4">
            {/* Botón App Store */}
            <Link
              href="#"
              className="bg-neutral-50 text-primary-dark px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:bg-neutral-100 transition-colors duration-300 shadow-lg"
            >
              {/* Icono de Apple App Store */}
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M12 0C8.686 0 6.002 2.686 6.002 6c0 1.25.39 2.41 1.05 3.36C5.55 10.5 4.05 11.5 2.85 13.1c-1.2 1.6-.9 3.5-.15 4.8.75 1.3 2.1 2.2 3.8 2.2 1.5 0 2.8-.75 3.75-1.95.9 1.05 2.1 1.95 3.75 1.95 1.7 0 3.05-.9 3.8-2.2.75-1.3 1.05-3.2-.15-4.8-1.2-1.6-2.7-2.6-4.2-3.74-.66-.95-1.05-2.11-1.05-3.36C17.998 2.686 15.314 0 12 0zM12 2.25c.828 0 1.5.672 1.5 1.5s-.672 1.5-1.5 1.5-1.5-.672-1.5-1.5.672-1.5 1.5-1.5z" />
              </svg>
              <span>Disponible en App Store</span>
            </Link>
            {/* Botón Google Play */}
            <Link
              href="#"
              className="bg-neutral-50 text-primary-dark px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 hover:bg-neutral-100 transition-colors duration-300 shadow-lg"
            >
              {/* Icono de Google Play Store */}
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M2.5 10.5L11 15l8.5-4.5L11 1V10.5zm0 3L11 18l8.5-4.5L11 23V13.5z" />
              </svg>
              <span>Consíguelo en Google Play</span>
            </Link>
          </div>
        </div>

        {/* Maquetas de la App Móvil */}
        <div className="md:w-1/2 flex justify-center mt-10 md:mt-0 relative">
          {/* Aquí puedes colocar imágenes de mockups de tu app móvil */}
          {/* Por ahora, usaremos placeholders o divs con colores */}
          <img
            src="https://placehold.co/250x500/102540/F2B90F?text=App+Screen+1"
            alt="Pantalla de la aplicación móvil 1"
            className="w-1/2 max-w-xs rounded-lg shadow-2xl transform rotate-6 -translate-x-4 z-10"
          />
          <img
            src="https://placehold.co/250x500/F2B90F/102540?text=App+Screen+2"
            alt="Pantalla de la aplicación móvil 2"
            className="w-1/2 max-w-xs rounded-lg shadow-2xl transform -rotate-6 translate-x-4 -ml-16 z-20"
          />
        </div>
      </div>
    </section>
  )
}
