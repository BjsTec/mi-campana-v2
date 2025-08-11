// src/components/admin/campaigns/MemberCard.js
import React from 'react'
import Link from 'next/link'

// Componente para el badge de rol con colores
const RoleBadge = ({ role }) => {
  const roleColors = {
    candidato: 'bg-indigo-100 text-indigo-800',
    manager: 'bg-blue-100 text-blue-800',
    anillo: 'bg-purple-100 text-purple-800',
    votante: 'bg-green-100 text-green-800',
  }
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${roleColors[role] || 'bg-gray-100 text-gray-800'}`}
    >
      {role}
    </span>
  )
}

// Componente para el badge de estado
const StatusBadge = ({ status }) => {
  const statusColors = {
    activo: 'bg-green-100 text-green-800',
    inactivo: 'bg-red-100 text-red-800',
    public_lead: 'bg-yellow-100 text-yellow-800',
  }
  const displayStatus = status === 'public_lead' ? 'Lead' : status

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {displayStatus}
    </span>
  )
}

// Nuevo componente para mostrar la cantidad de votos
const VoteCount = ({ count }) => {
  // Aseguramos que el count sea un número, por si no viene definido
  const votes = Number(count) || 0
  return (
    <div className="flex items-center text-sm text-neutral-600">
      <span className="font-semibold">{votes}</span>
      <span className="ml-1">votos</span>
    </div>
  )
}

const MemberCard = ({ member }) => {
  // Usamos el uid del miembro para el enlace,
  // y un valor por defecto para el nombre en caso de que no exista
  const memberUid = member.uid
  const memberName = member.nombre || member.name || 'Nombre no disponible'
  // Obtenemos el status y los votos del objeto de membresía
  const membership = member.campaignMemberships?.[0] || {}
  const memberStatus = membership.status || 'inactivo'
  const memberVotes = membership.totalConfirmedVotes || 0

  return (
    <div className="bg-white rounded-xl shadow-md p-5 flex flex-col justify-between h-48 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
      <div className="flex justify-between items-start mb-2">
        <RoleBadge role={member.role} />
        <StatusBadge status={memberStatus} />
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="text-xl font-bold text-gray-900 truncate mb-1">
          {memberName}
        </h3>
        <VoteCount count={memberVotes} />
      </div>
      <div className="mt-4">
        <Link
          href={`/dashboard-admin/users/${memberUid}`}
          className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Ver Perfil
        </Link>
      </div>
    </div>
  )
}

export default MemberCard
