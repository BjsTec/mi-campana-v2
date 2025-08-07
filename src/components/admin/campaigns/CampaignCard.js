// src/components/admin/campaigns/CampaignCard.js
import React from 'react'
import Link from 'next/link'
import { CampaignIcon, EditIcon } from '@/components/ui/IconComponents'

const StatusBadge = ({ status }) => {
  const statusColors = {
    activo: 'bg-green-100 text-green-800',
    inactivo: 'bg-red-100 text-red-800',
    archivado: 'bg-gray-100 text-gray-800',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status}
    </span>
  )
}

const CampaignCard = ({ campaign, onToggleStatus, loading }) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-105 transition duration-300 ease-in-out border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center w-full min-w-0">
          {' '}
          {/* Añado w-full y min-w-0 para que el flexbox maneje el espacio correctamente */}
          {campaign.logoUrl ? (
            <img
              src={campaign.logoUrl}
              alt={`Logo de ${campaign.campaignName}`}
              className="h-12 w-12 object-contain rounded-full border border-gray-200 mr-4 flex-shrink-0"
              onError={(e) => {
                e.target.onerror = null
                e.target.src = `https://placehold.co/48x48/E5E7EB/4B5563?text=Logo`
              }}
            />
          ) : (
            <div className="h-12 w-12 rounded-full border border-gray-200 bg-gray-100 flex items-center justify-center mr-4 flex-shrink-0">
              <CampaignIcon className="h-6 w-6 text-gray-500" />
            </div>
          )}
          <h2 className="text-xl font-semibold text-gray-900 leading-tight truncate">
            {campaign.campaignName}
          </h2>
        </div>
        <StatusBadge status={campaign.status} />
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        {/* Añado la clase 'truncate' a los párrafos para corregir el desbordamiento */}
        <p className="truncate">
          <span className="font-medium">Candidato:</span>{' '}
          {campaign.candidateName}
        </p>
        <p className="truncate">
          <span className="font-medium">Tipo:</span> {campaign.type}
        </p>
        <p className="truncate">
          <span className="font-medium">Plan:</span>{' '}
          {campaign.planName || 'Básico'}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-auto">
        <Link
          href={`/dashboard-admin/campaigns/${campaign.id}`}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Ver Detalles
          <EditIcon className="ml-2 h-4 w-4" />
        </Link>
        <button
          onClick={() => onToggleStatus(campaign.id, campaign.status)}
          disabled={loading}
          className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white whitespace-nowrap ${
            campaign.status === 'activo'
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200`}
        >
          {campaign.status === 'activo' ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  )
}

export default CampaignCard
