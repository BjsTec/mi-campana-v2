// src/components/landing/AppShowcaseSection.js
import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Apple, Smartphone } from 'lucide-react' // Íconos de Lucide React

export default function AppShowcaseSection() {
  return (
    <section
      id="app-movil"
      className="relative py-24 overflow-hidden bg-primary-dark"
    >
      <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center justify-between">
        {/* Contenido de Texto */}
        <div className="md:w-1/2 text-center md:text-left text-neutral-50 mb-12 md:mb-0">
          <h2 className="text-5xl font-extrabold leading-tight mb-6 animate-fade-in-up">
            Autoridad Política Móvil: Tu Campaña Siempre Contigo
          </h2>
          <p className="text-xl opacity-90 mb-10 animate-fade-in-up delay-200">
            Accede a todas las herramientas de gestión de tu campaña desde la
            palma de tu mano. Organiza, coordina y mantente informado en
            cualquier momento y lugar.
          </p>

          <div className="flex justify-center md:justify-start space-x-4 animate-fade-in-up delay-400">
            {/* Botón App Store */}
            <Link
              href="#"
              className="bg-neutral-50 text-primary-dark px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-transform duration-300 transform hover:scale-105 shadow-lg"
            >
              <Apple className="w-6 h-6" />
              <span>Disponible en App Store</span>
            </Link>

            {/* Botón Google Play */}
            <Link
              href="#"
              className="bg-neutral-50 text-primary-dark px-6 py-3 rounded-lg font-semibold flex items-center space-x-2 transition-transform duration-300 transform hover:scale-105 shadow-lg"
            >
              <Smartphone className="w-6 h-6" />
              <span>Consíguelo en Google Play</span>
            </Link>
          </div>
        </div>

        {/* Maquetas de la App Móvil */}
        <div className="md:w-1/2 flex justify-center mt-12 md:mt-0 relative">
          <div className="relative w-[300px] h-[600px] perspective-[1000px] transform-gpu">
            {/* Mockup 1 - con animación de rotación 3D */}
            <div className="absolute inset-0 w-full h-full transform-style preserve-3d animate-rotate-y z-20 transition-transform duration-500 hover:rotate-y-0">
              <Image
                src="/assets/mockup-app-1.webp"
                alt="Pantalla de la aplicación móvil 1"
                layout="fill"
                objectFit="contain"
                className="shadow-2xl rounded-3xl"
              />
            </div>

            {/* Mockup 2 - con animación de rotación 3D */}
            <div className="absolute inset-0 w-full h-full transform-style preserve-3d animate-rotate-y-reverse z-10 transition-transform duration-500 hover:rotate-y-0 translate-x-[50px] md:translate-x-[75px]">
              <Image
                src="/assets/mockup-app-2.webp"
                alt="Pantalla de la aplicación móvil 2"
                layout="fill"
                objectFit="contain"
                className="shadow-2xl rounded-3xl"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Elemento de fondo animado */}
      <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary-dark via-primary-900 to-secondary-900 animate-pulse-bg"></div>
    </section>
  )
}
