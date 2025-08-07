// src/components/admin/campaigns/CampaignSuccessStep.js
import React from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/outline'

const CampaignSuccessStep = ({
  campaignName,
  candidateName,
  candidateCedula,
  candidatePassword,
  candidateWhatsappLink,
  onReset,
}) => {
  return (
    <div className="text-center p-6 bg-white rounded-lg">
      <CheckCircleIcon className="mx-auto h-16 w-16 text-green-500" />
      <h3 className="mt-4 text-xl font-semibold text-gray-900">
        ¡Campaña "{campaignName}" Creada con Éxito!
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        La campaña ha sido configurada y el perfil del candidato principal ha sido creado.
      </p>

      <div className="mt-6 border-t border-gray-200 pt-6 text-left">
        <h4 className="text-lg font-medium text-gray-900">Detalles de Acceso del Candidato</h4>
        <dl className="mt-2 text-sm text-gray-700">
          <div className="bg-gray-50 px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Candidato:</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{candidateName}</dd>
          </div>
          <div className="bg-white px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Cédula:</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{candidateCedula}</dd>
          </div>
          <div className="bg-gray-50 px-4 py-2 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
            <dt className="text-sm font-medium text-gray-500">Contraseña Inicial:</dt>
            <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 font-mono">{candidatePassword}</dd>
          </div>
        </dl>
      </div>

      <div className="mt-8 flex flex-col items-center space-y-4">
        <p className="text-sm text-gray-500">
          Ahora, notifica al candidato para que pueda acceder a la plataforma.
        </p>
        <div className="flex space-x-4">
          {/* Botón para notificar al candidato */}
          {candidateWhatsappLink && (
            <a
              href={candidateWhatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.04 2.11c-5.59 0-10.13 4.54-10.13 10.13 0 1.94.55 3.82 1.61 5.48L2.09 22l4.89-1.28c1.65.9 3.53 1.4 5.46 1.4 5.59 0 10.13-4.54 10.13-10.13S17.63 2.11 12.04 2.11zm3.76 13.91s-.11-.06-.29-.14c-.18-.08-.94-.46-1.08-.51-.14-.05-.24-.07-.34.08-.1.15-.39.51-.48.61-.1.1-.19.11-.35.07s-.76-.28-1.46-.9c-.54-.46-1.07-1.02-1.2-.23-.13.78-.01.73-.01.83s.09.21.14.28c.05.07.05.15.02.24s-.18.23-.39.46c-.21.23-.42.27-.64.27-.2 0-.41-.08-.61-.25-.2-.17-.76-.92-1.06-1.34-.3-.42-.26-.35-.37-.59-.11-.24-.02-.27-.15-.27h-.31c-.13 0-.34.05-.51.26s-.66.65-.66 1.59c0 .94.67 1.84.77 1.96.1.13 1.34 2.06 3.25 2.87 2.09.91 2.5 1.1 2.99 1.1.49 0 1.25-.19 1.63-.49.38-.3.51-.7.61-.83.1-.14.21-.19.34-.23.13-.04.41-.16.8-.23.4-.07 1.05-.33 1.2-.42s.25-.15.29-.25c.04-.1.04-.19-.08-.29z" />
              </svg>
              Notificar al Candidato
            </a>
          )}
          {/* Botón para crear otra campaña */}
          <button
            onClick={onReset}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Crear Otra Campaña
          </button>
        </div>
      </div>
    </div>
  )
}

export default CampaignSuccessStep