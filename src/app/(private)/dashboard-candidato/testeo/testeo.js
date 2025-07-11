// src/app/(private)/dashboard-admin/temp-page/page.js
'use client' // Indica que este componente es un Client Component en Next.js

import React from 'react'

// Componente de página temporal
export default function TempPage() {
  return (
    <div className="min-h-screen bg-neutral-100 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
        <h1 className="text-4xl font-bold text-primary-dark mb-4">
          Página Temporal
        </h1>
        <p className="text-lg text-neutral-600 mb-6">
          Este es un marcador de posición para una página en desarrollo. ¡Pronto
          habrá más contenido aquí!
        </p>
        <div className="space-y-4">
          <button
            onClick={() => alert('¡Botón principal clickeado!')} // Usar alert solo para ejemplo temporal, reemplazar con modal real
            className="w-full py-3 px-6 bg-primary-DEFAULT text-white font-semibold rounded-lg shadow-md hover:bg-primary-light transition duration-300 ease-in-out"
          >
            Ir a la Página Principal
          </button>
          <button
            onClick={() => alert('¡Botón secundario clickeado!')} // Usar alert solo para ejemplo temporal, reemplazar con modal real
            className="w-full py-3 px-6 bg-secondary-DEFAULT text-white font-semibold rounded-lg shadow-md hover:bg-secondary-light transition duration-300 ease-in-out"
          >
            Más Información
          </button>
        </div>
      </div>
    </div>
  )
}
