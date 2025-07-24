// src/components/landing/PlansSection.js
'use client' // Este componente usará useState y useEffect para cargar datos

import React, { useState, useEffect } from 'react'
import Link from 'next/link'

// Componente para una tarjeta de plan individual
const PlanCard = ({ plan }) => {
  const isFree = plan.price === 0 // El plan gratuito tiene precio 0
  const isHighPrice = plan.price >= 1000000 // Umbral para "Contactar Asesor" (1,000,000 COP)

  // Determinar el texto y el href del botón
  let buttonText = 'Elegir Plan'
  let buttonHref = '/login' // Por ahora, todos van a login/registro
  let buttonClasses = 'bg-primary-DEFAULT text-neutral-50 hover:bg-primary-dark'

  if (isFree) {
    buttonText = 'Regístrate Gratis'
    buttonClasses =
      'bg-secondary-DEFAULT text-primary-dark hover:bg-secondary-dark'
  } else if (isHighPrice) {
    buttonText = 'Contactar Asesor'
    buttonHref = '/contacto' // Podríamos crear una sección de contacto o modal específico para chat
    buttonClasses =
      'bg-primary-dark text-secondary-DEFAULT hover:bg-secondary-dark hover:text-neutral-50' // Invertir colores para destacar
  }

  return (
    <div
      className={`
      bg-neutral-50 p-8 rounded-lg shadow-xl text-center flex flex-col justify-between
      transform hover:scale-105 transition-transform duration-300 border-2
      ${isFree ? 'border-secondary-DEFAULT' : 'border-neutral-100'}
    `}
    >
      <div>
        <h3 className="text-3xl font-bold text-primary-dark mb-4">
          {plan.name}
        </h3>
        <p className="text-neutral-600 mb-6 min-h-[4rem]">
          {' '}
          {/* Altura mínima para descripciones */}
          {plan.description}
        </p>
        <div className="text-5xl font-extrabold text-primary-DEFAULT mb-6">
          {isFree ? (
            'Gratis'
          ) : (
            <>
              $
              {new Intl.NumberFormat('es-CO', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(plan.price)}
              <span className="text-lg font-normal text-neutral-600">/mes</span>
            </>
          )}
        </div>
        {/* Lista de características del plan (ahora con marketingFeatures) */}
        <ul className="text-neutral-800 text-left mb-8 space-y-2">
          {plan.marketingFeatures &&
            plan.marketingFeatures.map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg
                  className="w-5 h-5 text-secondary-DEFAULT mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                {feature}
              </li>
            ))}
        </ul>
      </div>
      <Link
        href={buttonHref}
        className={`
          block w-full px-8 py-3 rounded-full font-bold text-lg transition-colors duration-300 shadow-md
          ${buttonClasses}
        `}
      >
        {buttonText}
      </Link>
    </div>
  )
}

export default function PlansSection() {
  const [allPricingPlans, setAllPricingPlans] = useState([]) // Almacena todos los planes
  const [filteredPlans, setFilteredPlans] = useState([]) // Planes mostrados
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedScope, setSelectedScope] = useState('featured') // 'featured' por defecto, ahora usamos 'scope'

  useEffect(() => {
    const fetchPricingPlans = async () => {
      try {
        setLoading(true)
        // Asegúrate de que esta URL sea correcta para tu función desplegada
        const response = await fetch(
          'https://us-central1-micampanav2.cloudfunctions.net/getPublicPricingPlans',
        )

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()

        const processedData = data.map((plan) => ({
          ...plan,
          price:
            typeof plan.price === 'string'
              ? parseFloat(plan.price)
              : plan.price,
        }))

        // Añadir 'scope' basado en 'typeId' y 'marketingFeatures'
        const processedDataWithScopeAndFeatures = processedData.map((plan) => {
          let scope = ''
          switch (plan.typeId) {
            case 'presidencia':
            case 'senado':
              scope = 'nacional'
              break
            case 'gobernacin_':
            case 'asamblea':
            case 'cmara': // Asumiendo camara es más regional/departamental
              scope = 'departamental'
              break
            case 'alcalda':
            case 'concejo':
            case 'edil_':
              scope = 'municipal'
              break
            case 'equipo_de_trabajo':
              scope = 'general' // Para el plan gratuito, no tiene un scope geográfico directo
              break
            default:
              scope = 'otro' // Fallback
          }

          let marketingFeatures = []
          if (plan.price === 0) {
            marketingFeatures = [
              'Gestión básica de equipo',
              'Acceso a herramientas esenciales',
              'Soporte comunitario',
              'Dashboard de seguimiento simple',
              'Ideal para equipos pequeños',
            ]
          } else if (plan.price >= 1000000) {
            // Nivel de precio alto
            marketingFeatures = [
              'Asesoría estratégica personalizada',
              'Análisis de datos avanzado y predictivo',
              'Gestión de grandes equipos y redes de apoyo',
              'Soporte VIP 24/7 y gestor de cuenta',
              'Integraciones personalizadas y API',
              'Reportes ejecutivos detallados',
            ]
          } else {
            // Planes de rango medio
            marketingFeatures = [
              'Gestión de equipo avanzada',
              'Acceso completo a funciones premium',
              'Soporte prioritario por email y chat',
              'Reportes de campaña y métricas clave',
              'Módulos de comunicación integrados',
              'Capacitación para el equipo',
            ]
          }
          return { ...plan, scope, marketingFeatures }
        })

        setAllPricingPlans(processedDataWithScopeAndFeatures)

        // Inicialmente, mostrar solo los planes destacados
        const initialFeaturedPlans = processedDataWithScopeAndFeatures
          .filter(
            (plan) =>
              plan.price === 0 || // El plan gratuito
              (plan.scope === 'municipal' &&
                plan.name.includes('Alcaldía para el Futuro')) || // Un plan de alcaldía de ejemplo
              (plan.scope === 'nacional' &&
                plan.name.includes('Ruta Senatorial Élite')), // Un plan de senado de ejemplo
          )
          .sort((a, b) => a.price - b.price) // Ordenar por precio para una mejor presentación

        setFilteredPlans(initialFeaturedPlans)
      } catch (err) {
        console.error('Error fetching pricing plans:', err)
        setError('No se pudieron cargar los planes de precios.')
      } finally {
        setLoading(false)
      }
    }

    fetchPricingPlans()
  }, [])

  // Efecto para filtrar planes cuando cambia el scope seleccionado
  useEffect(() => {
    let plansToShow = []
    if (selectedScope === 'featured') {
      // Re-filtrar planes destacados si allPricingPlans cambia (ej. después de la carga inicial)
      plansToShow = allPricingPlans
        .filter(
          (plan) =>
            plan.price === 0 ||
            (plan.scope === 'municipal' &&
              plan.name.includes('Alcaldía para el Futuro')) ||
            (plan.scope === 'nacional' &&
              plan.name.includes('Ruta Senatorial Élite')),
        )
        .sort((a, b) => a.price - b.price)
    } else if (selectedScope === 'all') {
      // Si decidimos reintroducir 'all'
      plansToShow = allPricingPlans
    } else {
      plansToShow = allPricingPlans.filter(
        (plan) => plan.scope === selectedScope,
      )
    }
    setFilteredPlans(plansToShow)
  }, [selectedScope, allPricingPlans])

  // Obtener scopes únicos para las pestañas
  const uniqueScopes = [
    'featured',
    ...new Set(allPricingPlans.map((plan) => plan.scope)),
  ]
  // Filtrar 'otro' y 'general' si no queremos que aparezcan como pestañas separadas
  const displayScopes = uniqueScopes.filter(
    (s) => s !== 'otro' && s !== 'general',
  )
  // Ordenar las pestañas para una mejor presentación
  const orderedScopes = [
    'featured',
    'nacional',
    'departamental',
    'municipal',
  ].filter((s) => displayScopes.includes(s))
  // Añadir cualquier otro scope único que no esté en la lista ordenada
  displayScopes.forEach((s) => {
    if (!orderedScopes.includes(s)) {
      orderedScopes.push(s)
    }
  })

  // Función para formatear el nombre del scope para la UI
  const formatScopeName = (scopeId) => {
    if (scopeId === 'featured') return 'Planes Destacados'
    if (scopeId === 'nacional') return 'Nivel Nacional'
    if (scopeId === 'departamental') return 'Nivel Departamental'
    if (scopeId === 'municipal') return 'Nivel Local'
    if (scopeId === 'general') return 'Equipo de Trabajo (Gratis)' // Si queremos una pestaña solo para este
    return scopeId
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase())
  }

  return (
    <section id="planes" className="py-20 bg-neutral-100">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-extrabold text-primary-dark text-center mb-6">
          Encuentra el Plan Perfecto para tu Objetivo Político
        </h2>
        <p className="text-xl text-neutral-600 text-center mb-12 max-w-3xl mx-auto">
          Ofrecemos planes flexibles adaptados a las necesidades de cada
          campaña, desde equipos pequeños hasta grandes movimientos.
        </p>

        {/* Navegación por Pestañas de Scopes */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {orderedScopes.map((scope) => (
            <button
              key={scope}
              onClick={() => setSelectedScope(scope)}
              className={`
                px-6 py-2 rounded-full font-semibold text-lg transition-colors duration-300
                ${
                  selectedScope === scope
                    ? 'bg-primary-dark text-secondary-DEFAULT shadow-md' // Fondo azul oscuro, texto amarillo/dorado
                    : 'bg-neutral-200 text-neutral-800 hover:bg-neutral-300'
                }
              `}
            >
              {formatScopeName(scope)}
            </button>
          ))}
        </div>

        {loading && (
          <p className="text-center text-primary-dark text-lg">
            Cargando planes...
          </p>
        )}
        {error && <p className="text-center text-error text-lg">{error}</p>}

        {!loading && !error && filteredPlans.length === 0 && (
          <p className="text-center text-neutral-600 text-lg">
            No hay planes de precios disponibles para esta categoría.
          </p>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {!loading &&
            !error &&
            filteredPlans.map((plan) => <PlanCard key={plan.id} plan={plan} />)}
        </div>
      </div>
    </section>
  )
}
