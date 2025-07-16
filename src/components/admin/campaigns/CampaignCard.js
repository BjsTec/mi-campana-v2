'use client'

import React from 'react'
import Link from 'next/link'

// Iconos y colores
const CampaignIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    {' '}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514M15 11l-1 1"
    />{' '}
  </svg>
)
const CheckCircleIcon = ({ isActive }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-red-500'}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
)

const pastelColors = [
  'bg-primary-50',
  'bg-secondary-50',
  'bg-neutral-50',
  'bg-blue-50',
  'bg-green-50',
  'bg-yellow-50',
  'bg-pink-50',
  'bg-purple-50',
]

const CampaignCard = ({ campaign, index, loading, onToggleStatus }) => {
  return (
    <div
      key={campaign.id}
      className={`${pastelColors[index % pastelColors.length]} rounded-xl shadow-lg p-4 sm:p-6 transform hover:scale-105 transition duration-300 ease-in-out border border-neutral-200 flex items-center`}
    >
      {/* Columna Izquierda: Logo e Ícono de Estado */}
      <div className="flex-shrink-0 flex flex-col items-center mr-4">
        {/* CORRECCIÓN PRINCIPAL AQUÍ: Acceso seguro a logoUrl */}
        {campaign.media?.logoUrl ? (
          <img
            src={campaign.media.logoUrl} // Uso correcto de la propiedad anidada
            alt={`Logo de ${campaign.campaignName}`}
            className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-full border-2 border-neutral-200"
            onError={(e) => {
              e.target.onerror = null
              e.target.src = `https://placehold.co/80x80/E5E7EB/4B5563?text=Logo`
            }}
          />
        ) : (
          <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-neutral-200 bg-neutral-200 flex items-center justify-center">
            <CampaignIcon className="h-8 w-8 text-neutral-500" />
          </div>
        )}
        <span className="mt-2 text-xs font-semibold uppercase">
          <CheckCircleIcon isActive={campaign.status === 'activo'} />
        </span>
      </div>

      {/* Columna Derecha: Contenido y Acciones */}
      <div className="flex-1 min-w-0">
        <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-1 leading-tight truncate">
          {campaign.campaignName}
        </h2>
        <div className="space-y-1 text-sm text-neutral-700 mb-3">
          <p className="truncate">
            <span className="font-medium">Candidato:</span>{' '}
            {campaign.candidateName || 'N/A'}
          </p>
          <p className="truncate">
            <span className="font-medium">Tipo:</span> {campaign.type || 'N/A'}
          </p>
          {/* Nuevo campo: Tipo de Plan de Campaña (Asumiendo que viene del backend) */}
          <p className="truncate">
            <span className="font-medium">Plan:</span>{' '}
            {campaign.planName || 'Básico'}
          </p>
          <p className="truncate">
            <span className="font-medium">Estado:</span>{' '}
            {campaign.status || 'N/A'}
          </p>
        </div>

        {/* Botones en una sola fila */}
        <div className="flex items-center gap-2">
          {/* CORRECCIÓN AQUÍ: Estilo del botón "Ver Detalles" para que sea siempre visible */}
          <Link
            href={`/dashboard-admin/campaigns/${campaign.id}`}
            className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md shadow-sm
                       border border-blue-600 text-blue-600 /* Default: borde azul (visible), texto azul (visible) */
                       hover:bg-blue-600 hover:text-white /* Hover: fondo azul, texto blanco */
                       focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 whitespace-nowrap
                       transition-colors duration-200"
          >
            Ver Detalles
            <EditIcon className="ml-2" />
          </Link>
          <button
            onClick={() => onToggleStatus(campaign.id, campaign.status)}
            disabled={loading}
            className={`px-2 py-1.5 text-xs font-medium rounded-md shadow-sm text-white ${
              campaign.status === 'activo'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              campaign.status === 'activo'
                ? 'focus:ring-red-500'
                : 'focus:ring-green-500'
            } disabled:opacity-50`}
          >
            {campaign.status === 'activo' ? 'Desactivar' : 'Activar'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default CampaignCard
