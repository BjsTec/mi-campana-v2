// src/components/admin/campaigns/CampaignDetailHeader.js
import React from 'react'
import Link from 'next/link'
import { ChevronLeftIcon, PencilIcon } from '@heroicons/react/24/outline'
import {
  CurrencyDollarIcon,
  GlobeAmericasIcon,
  MapPinIcon,
  PhoneIcon,
  EnvelopeIcon,
  LinkIcon,
  UserIcon,
  CheckCircleIcon,
  UserGroupIcon,
} from '@heroicons/react/24/solid'
import StatCard from '@/components/ui/StatCard'

const StatusBadge = ({ status }) => {
  const statusColors = {
    activo: 'bg-green-100 text-green-800',
    inactivo: 'bg-red-100 text-red-800',
    archivado: 'bg-gray-100 text-gray-800',
  }
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {status}
    </span>
  )
}

const CampaignDetailHeader = ({
  campaign,
  onToggleStatus,
  onEditCampaign,
  loading,
}) => {
  const {
    campaignName,
    candidateProfile,
    status,
    planName,
    planPrice,
    media,
    contactInfo,
    location,
    totalConfirmedVotes,
    totalPotentialVotes,
  } = campaign

  const candidateInfo = candidateProfile || {}

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <Link
          href="/dashboard-admin/campaigns"
          className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeftIcon className="h-5 w-5 mr-1" />
          Volver a Campañas
        </Link>
        <StatusBadge status={status} />
      </div>

      <div
        className="relative mb-6 rounded-lg overflow-hidden bg-gray-100"
        style={{ height: '200px' }}
      >
        {media?.bannerUrl ? (
          <img
            src={media.bannerUrl}
            alt="Banner de la campaña"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-2xl">
            Banner no disponible
          </div>
        )}
        <div className="absolute -bottom-10 left-6 z-10">
          {' '}
          {/* Añadimos z-10 para asegurar que el logo esté sobre el banner */}
          {media?.logoUrl ? (
            <img
              src={media.logoUrl}
              alt="Logo de la campaña"
              className="h-20 w-20 object-contain rounded-full border-4 border-white shadow-lg"
            />
          ) : (
            <div className="h-20 w-20 rounded-full border-4 border-white bg-gray-300 flex items-center justify-center shadow-lg">
              <span className="text-sm font-bold text-gray-600">Logo</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between pt-12 pb-6 border-b border-gray-200">
        <div>
          <h1 className="text-4xl font-bold text-neutral-800">
            {campaignName}
          </h1>
          {/* El eslogan estático ha sido eliminado */}
        </div>
        <div className="flex flex-wrap gap-4 mt-4 md:mt-0">
          <button
            onClick={onToggleStatus}
            disabled={loading}
            className={`px-6 py-2 rounded-md font-semibold text-white transition-colors duration-200 disabled:opacity-50 ${
              status === 'activo'
                ? 'bg-red-600 hover:bg-red-700'
                : 'bg-green-600 hover:bg-green-700'
            }`}
          >
            {status === 'activo' ? 'Desactivar Campaña' : 'Activar Campaña'}
          </button>
          <Link
            href={`/dashboard-admin/campaigns/${campaign.id}/edit`}
            className="px-6 py-2 rounded-md font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200 flex items-center"
          >
            <PencilIcon className="h-5 w-5 mr-2" />
            Editar Campaña
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 mb-6">
        <StatCard
          title="Votos Confirmados"
          value={totalConfirmedVotes}
          color="green"
          icon={<CheckCircleIcon />}
        />
        <StatCard
          title="Votos Potenciales"
          value={totalPotentialVotes}
          color="blue"
          icon={<UserGroupIcon />}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-6">
        <div className="bg-neutral-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-neutral-800 mb-4">
            Detalles de la Campaña
          </h3>
          <ul className="space-y-3 text-sm text-neutral-700">
            <li>
              <span className="font-semibold flex items-center">
                <GlobeAmericasIcon className="h-5 w-5 mr-2" />
                Tipo:
              </span>{' '}
              {campaign.type}
            </li>
            <li>
              <span className="font-semibold flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Alcance:
              </span>{' '}
              {campaign.scope || 'N/A'}
            </li>
            <li>
              <span className="font-semibold flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Estado de Pago:
              </span>{' '}
              {campaign.paymentStatus}
            </li>
            <li>
              <span className="font-semibold flex items-center">
                <PencilIcon className="h-5 w-5 mr-2" />
                Plan:
              </span>{' '}
              {planName}
            </li>
            <li>
              <span className="font-semibold flex items-center">
                <CurrencyDollarIcon className="h-5 w-5 mr-2" />
                Precio del Plan:
              </span>{' '}
              ${planPrice?.toLocaleString('es-CO') || 'N/A'}
            </li>
            <li>
              <span className="font-semibold flex items-center">
                <LinkIcon className="h-5 w-5 mr-2" />
                Sitio Web:
              </span>{' '}
              <a
                href={contactInfo?.web}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline"
              >
                {contactInfo?.web || 'N/A'}
              </a>
            </li>
          </ul>
        </div>
        <div className="bg-neutral-50 rounded-xl p-6">
          <h3 className="text-xl font-bold text-neutral-800 mb-4">
            Datos del Candidato
          </h3>
          <ul className="space-y-3 text-sm text-neutral-700">
            <li>
              <span className="font-semibold flex items-center">
                <UserIcon className="h-5 w-5 mr-2" />
                Nombre:
              </span>{' '}
              {candidateInfo.name}
            </li>
            <li>
              <span className="font-semibold flex items-center">
                <EnvelopeIcon className="h-5 w-5 mr-2" />
                Email:
              </span>{' '}
              {candidateInfo.email}
            </li>
            <li>
              <span className="font-semibold flex items-center">
                <PhoneIcon className="h-5 w-5 mr-2" />
                Teléfono:
              </span>{' '}
              {candidateInfo.phone || 'N/A'}
            </li>
            <li>
              <span className="font-semibold flex items-center">
                <MapPinIcon className="h-5 w-5 mr-2" />
                Ubicación:
              </span>{' '}
              {candidateInfo.location?.city}, {candidateInfo.location?.state}
            </li>
            <li>
              <span className="font-semibold flex items-center">
                <PencilIcon className="h-5 w-5 mr-2" />
                Rol:
              </span>{' '}
              {candidateInfo.role}
            </li>
          </ul>
          <div className="mt-6">
            <Link
              href={`/dashboard-admin/users/${candidateInfo.id}`}
              className="px-6 py-2 rounded-md font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
            >
              Ver Detalles del Candidato
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignDetailHeader
