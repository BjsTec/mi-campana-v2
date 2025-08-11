import React from 'react'
import {
  UsersIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  ChatBubbleLeftRightIcon,
} from '@heroicons/react/24/outline'
import Image from 'next/image'

// Componente para una característica individual
const FeatureCard = ({ icon: Icon, title, description }) => {
  return (
    <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-neutral-200">
      <div className="bg-primary-dark text-white mb-6 mx-auto flex justify-center items-center h-16 w-16 rounded-full">
        {Icon && <Icon className="w-10 h-10" />}
      </div>
      <h3 className="text-2xl font-bold text-neutral-800 mb-3 text-center">
        {title}
      </h3>
      <p className="text-neutral-600 text-center">{description}</p>
    </div>
  )
}

export default function FeaturesSection() {
  return (
    <section id="caracteristicas" className="py-20 bg-neutral-50">
      <div className="container mx-auto px-6 max-w-7xl">
        <h2 className="text-5xl font-extrabold text-center text-neutral-900 mb-6 leading-tight">
          Potencia tu Campaña con Nuestras Soluciones
        </h2>
        <p className="text-xl text-center text-neutral-600 mb-12 max-w-4xl mx-auto">
          Descubre cómo Autoridad Política te brinda las herramientas necesarias
          para una gestión electoral eficiente y exitosa.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <FeatureCard
            icon={UsersIcon}
            title="Gestión de Equipos"
            description="Organiza y coordina a tus colaboradores, voluntarios y líderes de forma centralizada y eficaz."
          />
          <FeatureCard
            icon={ChartBarIcon}
            title="Análisis de Datos"
            description="Toma decisiones informadas con métricas en tiempo real sobre el progreso y el impacto de tu campaña."
          />
          <FeatureCard
            icon={ShieldCheckIcon}
            title="Seguridad Robusta"
            description="Protege la información sensible de tu campaña con los más altos estándares de seguridad y privacidad."
          />
          <FeatureCard
            icon={ChatBubbleLeftRightIcon}
            title="Comunicación Eficaz"
            description="Mantén a tu equipo y a tus votantes informados con herramientas de mensajería y notificaciones integradas."
          />
        </div>
      </div>
    </section>
  )
}
