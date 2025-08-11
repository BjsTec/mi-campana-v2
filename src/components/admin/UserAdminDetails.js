// components/admin/UserAdminDetails.js
import React from 'react'
import Link from 'next/link'
import {
  IdentificationIcon,
  BuildingOfficeIcon,
  EnvelopeIcon,
  MapPinIcon,
  ChartPieIcon,
  UsersIcon,
  ArrowPathIcon,
  PencilIcon,
  LockClosedIcon,
  LockOpenIcon,
} from '@heroicons/react/24/outline'
import StatusBadge from './StatusBadge'

const MetricCard = ({ title, value, icon, color }) => {
  const iconBg = {
    green: 'bg-green-100 text-green-600',
    blue: 'bg-blue-100 text-blue-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  }
  return (
    <div className="bg-white p-5 rounded-xl shadow-md border border-neutral-200 flex flex-col items-center text-center transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
      <div
        className={`p-3 rounded-full ${iconBg[color] || 'bg-gray-100 text-gray-600'}`}
      >
        {icon}
      </div>
      <p className="text-xl font-extrabold text-neutral-900 mt-3">{value}</p>
      <p className="text-sm font-medium text-neutral-500 mt-1">{title}</p>
    </div>
  )
}

const UserAdminDetails = ({ userProfile, onStatusChange, onEditClick }) => {
  const { name, email, cedula, role, location, campaignMemberships } =
    userProfile

  const firstMembership = campaignMemberships?.[0] || {}
  const {
    campaignName,
    status,
    directVotes = 0,
    pyramidVotes = 0,
    totalPotentialVotes = 0,
  } = firstMembership

  const isUserActive = status === 'activo'

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-neutral-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl sm:text-3xl font-bold text-neutral-800">
          Perfil de {name || 'Usuario'}
        </h1>
        <Link
          href="/dashboard-admin/lista-users"
          className="inline-flex items-center text-sm font-medium text-neutral-600 hover:text-primary-600 transition-colors"
        >
          <ArrowPathIcon className="h-4 w-4 mr-1" />
          Volver a la lista
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-md p-6 border border-neutral-200">
            <div className="flex flex-col items-center text-center">
              <h2 className="text-2xl font-bold text-neutral-900">{name}</h2>
              <div className="flex items-center space-x-2 mt-2">
                <StatusBadge status={status} />
                <StatusBadge role={role} />
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200 space-y-4">
              <div className="flex items-start">
                <IdentificationIcon className="h-5 w-5 text-neutral-500 mr-3 mt-1" />
                <div>
                  <p className="text-sm font-medium text-neutral-500">Cédula</p>
                  <p className="text-base font-semibold text-neutral-800">
                    {cedula || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <EnvelopeIcon className="h-5 w-5 text-neutral-500 mr-3 mt-1" />
                <div>
                  <p className="text-sm font-medium text-neutral-500">Email</p>
                  <p className="text-base font-semibold text-neutral-800">
                    {email || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <BuildingOfficeIcon className="h-5 w-5 text-neutral-500 mr-3 mt-1" />
                <div>
                  <p className="text-sm font-medium text-neutral-500">
                    Campaña
                  </p>
                  <p className="text-base font-semibold text-neutral-800">
                    {campaignName || 'N/A'}
                  </p>
                </div>
              </div>
              <div className="flex items-start">
                <MapPinIcon className="h-5 w-5 text-neutral-500 mr-3 mt-1" />
                <div>
                  <p className="text-sm font-medium text-neutral-500">
                    Ubicación
                  </p>
                  <p className="text-base font-semibold text-neutral-800">
                    {location?.address || location?.city || 'N/A'}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-neutral-200 space-y-4">
              <button
                onClick={() => onEditClick(userProfile)}
                className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
              >
                <PencilIcon className="h-4 w-4 mr-2" /> Editar
              </button>
              <button
                onClick={() =>
                  onStatusChange(
                    userProfile.id,
                    isUserActive ? 'inactivo' : 'activo',
                  )
                }
                className={`w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
                  ${
                    isUserActive
                      ? 'text-red-600 bg-red-50 hover:bg-red-100'
                      : 'text-green-600 bg-green-50 hover:bg-green-100'
                  }`}
              >
                {isUserActive ? (
                  <LockClosedIcon className="h-4 w-4 mr-2" />
                ) : (
                  <LockOpenIcon className="h-4 w-4 mr-2" />
                )}
                {isUserActive ? 'Bloquear Usuario' : 'Activar Usuario'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Métricas de Campaña (Monitoreo)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <MetricCard
                title="Votos Directos"
                value={directVotes}
                icon={<ChartPieIcon className="h-6 w-6" />}
                color="green"
              />
              <MetricCard
                title="Votos de la Pirámide"
                value={pyramidVotes}
                icon={<UsersIcon className="h-6 w-6" />}
                color="blue"
              />
              <MetricCard
                title="Votos Potenciales"
                value={totalPotentialVotes}
                icon={<ChartPieIcon className="h-6 w-6" />}
                color="yellow"
              />
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-neutral-800 mb-4">
              Información de Pirámide (Monitor)
            </h3>
            <div className="bg-white p-6 rounded-xl shadow-md border border-neutral-200">
              <p className="text-neutral-500">
                Aquí iría la visualización de la pirámide de este usuario.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UserAdminDetails
