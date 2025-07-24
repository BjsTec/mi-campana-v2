// src/components/landing/HeroSection.js
import Link from 'next/link'

export default function HeroSection() {
  return (
    <section
      id="inicio"
      className="relative flex items-center justify-center min-h-screen bg-gradient-to-br from-primary-dark to-primary-DEFAULT text-neutral-50 p-6 md:p-8 overflow-hidden"
    >
      {/* Fondo con formas abstractas sutiles para un toque profesional */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <circle
            cx="20"
            cy="20"
            r="15"
            fill="currentColor"
            className="text-secondary-DEFAULT opacity-20 animate-pulse-slow"
          />
          <rect
            x="70"
            y="10"
            width="15"
            height="15"
            fill="currentColor"
            className="text-secondary-DEFAULT opacity-20 animate-pulse-slow delay-1000"
          />
          <polygon
            points="50,80 60,95 40,95"
            fill="currentColor"
            className="text-secondary-DEFAULT opacity-20 animate-pulse-slow delay-2000"
          />
          <path
            d="M10 50 Q 30 30, 50 50 T 90 50"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-neutral-50 opacity-10 animate-fade-in"
          />
        </svg>
      </div>

      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between z-10 py-20 md:py-0">
        {/* Contenido de Texto */}
        <div className="md:w-1/2 text-center md:text-left mb-10 md:mb-0">
          <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-neutral-50">
            Gestión Política Estratégica al Alcance de tu Mano
          </h1>
          <p className="text-xl lg:text-2xl opacity-90 mb-8 text-neutral-100">
            Optimiza tu alcance, organiza tu equipo y maximiza tu impacto con
            Autoridad Política.
          </p>
          <Link
            href="/login"
            className="bg-neutral-50 text-primary-dark px-8 py-4 rounded-full font-bold text-lg hover:bg-secondary-dark hover:text-neutral-50 transition-colors duration-300 shadow-xl visible"
          >
            Prueba Nuestro Demo
          </Link>
        </div>

        {/* Imagen de Maqueta (Simulando la Web App en un Dispositivo) */}
        <div className="md:w-1/2 flex justify-center mt-10 md:mt-0">
          <div className="relative w-full max-w-lg aspect-video bg-neutral-800 rounded-lg shadow-2xl flex items-center justify-center overflow-hidden border border-neutral-600">
            {/* Placeholder para la imagen de la web app */}
            <img
              src="https://placehold.co/600x400/1F2937/F3F4F6?text=Interfaz+Web+App"
              alt="Interfaz de la aplicación Autoridad Política"
              className="object-cover w-full h-full"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
