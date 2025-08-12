'use client'

import React, { useState, useEffect } from 'react'
import { useLeadsData } from '@/hooks/useLeadsData'
import {
  ClipboardIcon,
  ShareIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline'

export default function LeadsPage() {
  const { leads, shareableLink, generateLink, isLoading, error } =
    useLeadsData()
  const [copied, setCopied] = useState(false)

  const handleCopyLink = () => {
    if (shareableLink) {
      navigator.clipboard.writeText(shareableLink).then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      })
    }
  }

  if (isLoading) {
    return (
      <div className="bg-gray-100 min-h-screen p-4 flex items-center justify-center">
        <p className="text-xl text-gray-600">
          Cargando clientes potenciales...
        </p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-100 min-h-screen p-4 flex items-center justify-center">
        <p className="text-xl text-red-700">Error: {error}</p>
      </div>
    )
  }

  return (
    <main className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3 mb-2 flex items-center">
          <GlobeAltIcon className="h-9 w-9 text-blue-600 mr-2" />
          Votos de Opinión (Leads)
        </h1>
        <p className="text-md text-gray-600 mb-8">
          Contactos recibidos a través de formularios compartidos en redes
          sociales.
        </p>

        <div className="mb-8 p-6 bg-blue-50 rounded-lg shadow-inner border border-blue-200">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-blue-800">
              Comparte tu Formulario de Registro
            </h3>
            <button
              onClick={generateLink}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              <ShareIcon className="h-5 w-5 mr-2" />
              Generar Link
            </button>
          </div>
          {shareableLink && (
            <div className="relative mt-4 flex items-center">
              <input
                type="text"
                readOnly
                value={shareableLink}
                className="w-full px-3 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <button
                onClick={handleCopyLink}
                className="absolute right-0 top-0 h-full px-3 text-gray-500 hover:text-gray-900"
              >
                <ClipboardIcon className="h-5 w-5" />
                {copied ? (
                  <span className="ml-2 text-xs text-green-600">Copiado!</span>
                ) : null}
              </button>
            </div>
          )}
        </div>

        {leads.length === 0 ? (
          <p className="text-center text-gray-600 text-lg">
            No hay clientes potenciales registrados. ¡Comparte tu link para
            empezar!
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map((cliente) => (
              <div
                key={cliente.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
              >
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {cliente.name}
                  </h3>
                  <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                    {new Date(cliente.createdAt).toLocaleDateString('es-CO')}
                  </span>
                </div>
                <div className="p-4 flex-grow">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong className="font-medium text-gray-800">
                      Email:
                    </strong>{' '}
                    {cliente.email}
                  </p>
                  <p className="text-sm text-gray-700 mb-4">
                    <strong className="font-medium text-gray-800">
                      Teléfono:
                    </strong>{' '}
                    {cliente.phone}
                  </p>
                  <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 h-full">
                    <p className="text-sm font-medium text-gray-800">
                      Mensaje:
                    </p>
                    <p className="text-sm text-gray-600 italic mt-1">
                      {cliente.message}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
