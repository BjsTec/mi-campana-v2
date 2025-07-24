// src/components/landing/FeaturesSection.js
import React from 'react'

// Componente para una característica individual
const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="bg-neutral-50 p-8 rounded-lg shadow-lg text-center transform hover:scale-105 transition-transform duration-300 border border-neutral-100">
      <div className="text-primary-dark mb-4 mx-auto">
        {' '}
        {/* Cambiado a text-primary-dark para que el icono sea visible */}
        {/* Usaremos un SVG simple como placeholder para el icono.
            Puedes reemplazarlo con un icono de Heroicons o similar. */}
        <svg
          className="w-16 h-16 mx-auto"
          fill="currentColor"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          {' '}
          {/* Aseguramos fill y stroke */}
          {icon === 'team' && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M17 20h-2v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2H3m14 0h2a2 2 0 002-2v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2M7 13h10a2 2 0 002-2V9a2 2 0 00-2-2H7a2 2 0 00-2 2v2a2 2 0 002 2z"
            ></path>
          )}
          {icon === 'data' && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0m0 10v-4a2 2 0 012-2h2a2 2 0 012 2v4m0 0h3a2 2 0 002-2v-2a2 2 0 00-2-2h-3a2 2 0 00-2 2v2a2 2 0 002 2z"
            ></path>
          )}
          {icon === 'secure' && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.001 12.001 0 002 12c0 2.756 1.006 5.486 2.898 7.558L12 22l7.102-2.442A12.001 12.001 0 0022 12c0-2.756-1.006-5.486-2.898-7.558z"
            ></path>
          )}
          {icon === 'communication' && (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.105A9.785 9.785 0 0112 10a9.863 9.863 0 014.255.949L21 12z"
            ></path>
          )}
        </svg>
      </div>
      <h3 className="text-2xl font-semibold text-primary-dark mb-3">{title}</h3>
      <p className="text-neutral-600">{description}</p>
    </div>
  )
}

export default function FeaturesSection() {
  return (
    <section id="caracteristicas" className="py-20 bg-neutral-100">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-extrabold text-primary-dark text-center mb-6">
          Potencia tu Campaña con Nuestras Soluciones
        </h2>
        <p className="text-xl text-neutral-600 text-center mb-12 max-w-3xl mx-auto">
          Descubre cómo Autoridad Política te brinda las herramientas necesarias
          para una gestión electoral eficiente y exitosa.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon="team"
            title="Gestión de Equipos"
            description="Organiza y coordina a tus colaboradores, voluntarios y líderes de forma centralizada y eficaz."
          />
          <FeatureCard
            icon="data"
            title="Análisis de Datos"
            description="Toma decisiones informadas con métricas en tiempo real sobre el progreso y el impacto de tu campaña."
          />
          <FeatureCard
            icon="secure"
            title="Seguridad Robusta"
            description="Protege la información sensible de tu campaña con los más altos estándares de seguridad y privacidad."
          />
          <FeatureCard
            icon="communication"
            title="Comunicación Eficaz"
            description="Mantén a tu equipo y a tus votantes informados con herramientas de mensajería y notificaciones integradas."
          />
        </div>
      </div>
    </section>
  )
}
