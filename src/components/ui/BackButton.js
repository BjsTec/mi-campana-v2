// components/BackButton.js
'use client' // Directiva esencial para un componente de cliente en Next.js App Router

import React from 'react'

/**
 * Componente de botón "Regresar" con una flecha hacia la izquierda.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {function} props.onClick - Función a ejecutar cuando se hace clic en el botón.
 * @param {string} [props.className=""] - Clases adicionales de Tailwind CSS para personalizar el botón.
 */
export default function BackButton({ onClick, className = '' }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`
        flex items-center justify-center
        py-2 px-4 rounded-md shadow-sm
        text-base font-semibold text-primary
        bg-white border border-primary
        hover:bg-primary hover:text-white hover:shadow-md
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
        transition-all duration-300 ease-in-out
        ${className}
      `}
    >
      {/* Icono de flecha hacia la izquierda (SVG en línea) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={2.5}
        stroke="currentColor"
        className="w-5 h-5 mr-2"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
        />
      </svg>
      Regresar
    </button>
  )
}
