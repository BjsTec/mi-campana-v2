// src/components/landing/PromoBonusSection.js
'use client' // Este componente usará useState y useEffect para cargar datos

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useScrollAnimation } from '../../hooks/useScrollAnimation' // Importar el hook de animación

export default function PromoBonusSection() {
  const [promoBonus, setPromoBonus] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Hook para animaciones al hacer scroll
  const [sectionRef, isSectionVisible] = useScrollAnimation(0.1) // 10% de la sección visible

  useEffect(() => {
    const fetchPromoBonus = async () => {
      try {
        setLoading(true)
        // Asegúrate de que esta URL sea correcta para tu función desplegada
        const response = await fetch(
          'https://us-central1-micampanav2.cloudfunctions.net/getActivePromoBonus',
        )

        if (!response.ok) {
          const errorData = await response
            .json()
            .catch(() => ({ message: 'Error desconocido' }))
          if (
            response.status === 404 ||
            response.status === 204 ||
            (errorData && !errorData.isActive)
          ) {
            setPromoBonus(null) // No hay bono activo
          } else {
            throw new Error(
              `HTTP error! status: ${response.status}, message: ${errorData.message || 'Error al obtener bono'}`,
            )
          }
        } else {
          const data = await response.json()
          if (data && data.isActive) {
            setPromoBonus(data)
          } else {
            setPromoBonus(null) // No hay bono activo o la estructura es inesperada
          }
        }
      } catch (err) {
        console.error('Error fetching promo bonus:', err)
        setError('No se pudo cargar el bono promocional.')
      } finally {
        setLoading(false)
      }
    }

    fetchPromoBonus()
  }, [])

  if (loading) {
    return (
      <section id="promo-bonus" className="py-16 bg-neutral-100 text-center">
        <p className="text-primary-dark text-lg">
          Verificando bonos promocionales...
        </p>
      </section>
    )
  }

  if (error) {
    return (
      <section id="promo-bonus" className="py-16 bg-neutral-100 text-center">
        <p className="text-error text-lg">Error: {error}</p>
      </section>
    )
  }

  // Si hay un bono activo, lo renderizamos con un diseño moderno
  if (promoBonus && promoBonus.isActive) {
    return (
      <section
        id="promo-bonus"
        ref={sectionRef} // Asignar la referencia al elemento
        className="relative py-20 bg-primary-dark text-white text-center overflow-hidden" // Fondo oscuro, texto principal BLANCO PURO
      >
        {/* Capa de fondo con patrón geométrico sutil para dinamismo */}
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
              className="text-white opacity-10 animate-fade-in"
            />{' '}
            {/* También blanco puro */}
          </svg>
        </div>

        <div className="container mx-auto px-6 max-w-4xl z-10 relative">
          {/* Contenedor del bono con diseño de tarjeta flotante y animaciones */}
          <div
            className={`
            bg-white text-primary-dark p-8 md:p-12 rounded-xl shadow-2xl border-2 border-primary-dark 
            transform hover:scale-105 transition-transform duration-500 ease-in-out 
            ${isSectionVisible ? 'animate-fade-in-up' : 'opacity-0 translate-y-8'} {/* Animación de entrada */}
          `}
          >
            {/* Icono de regalo o estrella grande y animado */}
            <div className="mb-6">
              <svg
                className={`w-24 h-24 mx-auto text-primary-dark ${isSectionVisible ? 'animate-spin-slow' : ''}`}
                fill="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {' '}
                {/* Icono azul oscuro */}
                <path d="M12 2L9.19 8.63 2 9.24l5.46 4.73L5.82 21 12 17.27 18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2z" />
              </svg>
            </div>

            <h2
              className={`text-4xl lg:text-5xl font-extrabold mb-4 leading-tight text-primary-dark ${isSectionVisible ? 'animate-fade-in-up delay-200' : 'opacity-0 translate-y-8'}`}
            >
              ¡Oferta Exclusiva:{' '}
              {promoBonus.name ||
                `Descuento del ${promoBonus.discountPercentage}%`}
              !
            </h2>
            <p
              className={`text-xl lg:text-2xl mb-8 text-neutral-800 opacity-90 ${isSectionVisible ? 'animate-fade-in-up delay-400' : 'opacity-0 translate-y-8'}`}
            >
              {' '}
              {/* Texto gris oscuro */}
              {promoBonus.description ||
                `Aprovecha esta oportunidad única. Válido hasta el ${promoBonus.endDate}.`}
            </p>
            <Link
              href={promoBonus.ctaLink || '/login'}
              className={`bg-primary-dark text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-primary-DEFAULT transition-all duration-300 shadow-xl transform hover:scale-105 ${isSectionVisible ? 'animate-fade-in-up delay-600' : 'opacity-0 translate-y-8'}`}
            >
              {promoBonus.ctaText || 'Canjear Bono Ahora que epsras'}
            </Link>
          </div>
        </div>
      </section>
    )
  }

  // Si no hay bono activo, mostramos un CTA para los planes con un diseño moderno
  return (
    <section
      id="promo-bonus"
      ref={sectionRef} // Asignar la referencia al elemento
      className="relative py-20 bg-primary-dark text-white text-center overflow-hidden" // Fondo oscuro, texto principal BLANCO PURO
    >
      {/* Fondo con formas abstractas sutiles para un toque moderno */}
      <div className="absolute inset-0 z-0 opacity-10">
        <svg
          className="w-full h-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="xMidYMid slice"
          fill="none"
        >
          <circle
            cx="80"
            cy="80"
            r="15"
            fill="currentColor"
            className="text-secondary-DEFAULT opacity-20 animate-pulse-slow"
          />
          <rect
            x="10"
            y="70"
            width="15"
            height="15"
            fill="currentColor"
            className="text-secondary-DEFAULT opacity-20 animate-pulse-slow delay-1000"
          />
          <polygon
            points="20,20 30,5 10,5"
            fill="currentColor"
            className="text-secondary-DEFAULT opacity-20 animate-pulse-slow delay-2000"
          />
          <path
            d="M90 50 Q 70 70, 50 50 T 10 50"
            stroke="currentColor"
            strokeWidth="0.5"
            className="text-white opacity-10 animate-fade-in"
          />{' '}
          {/* También blanco puro */}
        </svg>
      </div>

      <div className="container mx-auto px-6 max-w-4xl z-10 relative">
        {/* Icono de inspiración o flecha */}
        <div className="mb-6">
          <svg
            className={`w-20 h-20 mx-auto text-white ${isSectionVisible ? 'animate-bounce-subtle' : ''}`}
            fill="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {' '}
            {/* Icono blanco */}
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 15l-5-5h10l-5 5z" />{' '}
            {/* Icono de flecha hacia abajo */}
          </svg>
        </div>

        <h2
          className={`text-4xl lg:text-5xl font-extrabold mb-4 leading-tight ${isSectionVisible ? 'animate-fade-in-up delay-200' : 'opacity-0 translate-y-8'}`}
        >
          ¿Listo para Impulsar tu Campaña?
        </h2>
        <p
          className={`text-xl lg:text-2xl mb-8 opacity-90 text-white ${isSectionVisible ? 'animate-fade-in-up delay-400' : 'opacity-0 translate-y-8'}`}
        >
          {' '}
          {/* Texto blanco */}
          Descubre nuestros planes diseñados para cada nivel de ambición
          política y lleva tu estrategia al siguiente nivel.
        </p>
        <Link
          href="#planes"
          className={`bg-white text-primary-dark px-10 py-4 rounded-full font-bold text-lg hover:bg-neutral-200 transition-all duration-300 shadow-xl transform hover:scale-105 ${isSectionVisible ? 'animate-fade-in-up delay-600' : 'opacity-0 translate-y-8'}`}
        >
          Explora Nuestros Planes
        </Link>
      </div>
    </section>
  )
}
