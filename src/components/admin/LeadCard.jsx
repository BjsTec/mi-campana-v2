// src/components/admin/LeadCard.jsx
'use client'

import React, { useMemo } from 'react'
import { useRouter } from 'next/navigation'

export default function LeadCard({ lead }) {
  const router = useRouter()

  const handleViewDetails = () => {
    router.push(`/dashboard-admin/potenciales/${lead.id}`)
  }

  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    const date = timestamp._seconds ? new Date(timestamp._seconds * 1000) : new Date(timestamp)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const statusColors = useMemo(() => {
    switch (lead.status) {
      case 'nuevo':
        return 'text-secondary-DEFAULT'
      case 'contactado':
        return 'text-primary-DEFAULT'
      case 'en_seguimiento':
        return 'text-blue-500'
      case 'convertido':
        return 'text-success'
      case 'descartado':
        return 'text-error'
      default:
        return 'text-neutral-600'
    }
  }, [lead.status])

  return (
    <div className="bg-neutral-50 p-4 rounded-lg shadow-md border border-neutral-200 flex flex-col justify-between transform hover:scale-[1.02] transition-transform duration-200 ease-in-out">
      <div>
        <h3 className="text-lg font-semibold text-primary-dark mb-1 truncate">
          {lead.name}
        </h3>
        <p className="text-neutral-800 text-xs mb-0.5 truncate">Email: {lead.email}</p>
        <p className="text-neutral-800 text-xs mb-0.5">Teléfono: {lead.phone || 'N/A'}</p>
        <p className="text-neutral-800 text-xs mb-0.5 truncate">Interesado en: {lead.interestedIn || 'N/A'}</p>
        <p className="text-neutral-800 text-xs mb-0.5 truncate">Fuente: {lead.source || 'N/A'}</p>
        <p className="text-neutral-800 text-xs mb-1">
          Estado:
          <span className={`font-bold ml-1 ${statusColors}`}>
            {lead.status ? lead.status.replace(/_/g, ' ').toUpperCase() : 'N/A'}
          </span>
        </p>
        <p className="text-neutral-600 text-xs mt-1">Recibido: {formatTimestamp(lead.timestamp)}</p>
      </div>
      <div className="mt-3">
        <button
          onClick={handleViewDetails}
          className="bg-secondary-DEFAULT text-primary-dark px-3 py-1.5 rounded-full text-xs font-semibold hover:bg-secondary-dark transition-colors duration-200 w-full"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  )
}