// app/dashboard-admin/user/[id]/page.js
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
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
  UserGroupIcon,
  UserCircleIcon,
  UserMinusIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline'

// Componente para el badge de estado
const StatusBadge = ({ status, role }) => {
  const statusColors = {
    activo: 'bg-green-100 text-green-800',
    inactivo: 'bg-red-100 text-red-800',
    public_lead: 'bg-yellow-100 text-yellow-800',
    manager: 'bg-indigo-100 text-indigo-800',
    votante: 'bg-blue-100 text-blue-800',
    anillo: 'bg-purple-100 text-purple-800',
    admin: 'bg-gray-100 text-gray-800',
  }
  const displayText = role || (status === 'public_lead' ? 'Lead' : status)
  const finalStatus =
    statusColors[role] || statusColors[status] || 'bg-gray-100 text-gray-800'

  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold capitalize ${finalStatus}`}
    >
      {displayText}
    </span>
  )
}

// Componente para la tarjeta de métricas
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

// Modal de Edición de Usuario (Administrador)
const UserEditModal = ({ isOpen, onClose, user, onSave }) => {
  const [formData, setFormData] = useState({})
  const { idToken } = useAuth()

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        cedula: user.cedula || '',
        phone: user.phone || '',
        whatsapp: user.whatsapp || '',
      })
    }
  }, [user])

  if (!isOpen || !user) {
    return null
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async () => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_UPDATE_USER_PROFILE_URL}`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ userId: user.id, updates: formData }),
        },
      )
      if (!response.ok) {
        throw new Error('Error al actualizar el usuario.')
      }
      onSave(user.id, formData)
    } catch (error) {
      console.error('Error al guardar cambios:', error)
      alert('Hubo un error al guardar los cambios.')
    }
  }

  return (
    <div className="fixed inset-0 bg-neutral-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-lg">
        <h3 className="text-xl font-bold text-neutral-800 mb-4">
          Editar Usuario: {user.name}
        </h3>
        <div className="space-y-4">
          <div className="flex flex-col">
            <label className="text-sm font-medium text-neutral-600">
              Nombre
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-neutral-300 shadow-sm"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-sm font-medium text-neutral-600">
              Cédula
            </label>
            <input
              type="text"
              name="cedula"
              value={formData.cedula}
              disabled
              className="mt-1 block w-full rounded-md border-neutral-300 bg-neutral-100 cursor-not-allowed"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-end space-x-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-neutral-300 text-neutral-700 hover:bg-neutral-100"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente principal de la página de detalle del usuario
export default function UserDetailPage() {
  const { id } = useParams()
  const { idToken } = useAuth()
  const [userProfile, setUserProfile] = useState(null)
  const [creatorProfile, setCreatorProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const GET_USER_BY_CEDULA_URL = process.env.NEXT_PUBLIC_GET_USER_BY_CEDULA_URL
  const UPDATE_USER_STATUS_URL = process.env.NEXT_PUBLIC_UPDATE_USER_STATUS_URL
  const GET_SECURE_USERS_URL = process.env.NEXT_PUBLIC_GET_SECURE_USERS_URL

  const fetchUserProfile = useCallback(async () => {
    if (!idToken || !id) {
      setLoading(false)
      setError('Cédula no proporcionada en la URL.')
      return
    }

    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${GET_USER_BY_CEDULA_URL}?cedula=${id}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })

      if (!response.ok) {
        throw new Error('No se pudo cargar el perfil del usuario.')
      }

      const text = await response.text()
      let data
      try {
        data = JSON.parse(text)
      } catch (e) {
        throw new Error(
          'Respuesta del servidor no válida. Por favor, revisa la URL del backend.',
        )
      }

      if (data.user) {
        setUserProfile(data.user)
        const registeredByUid = data.user.campaignMemberships?.[0]?.registeredBy
        if (registeredByUid) {
          // Solución temporal: traer todos los usuarios y filtrar en el frontend
          const allUsersResponse = await fetch(`${GET_SECURE_USERS_URL}`, {
            headers: { Authorization: `Bearer ${idToken}` },
          })
          if (allUsersResponse.ok) {
            const allUsersData = await allUsersResponse.json()
            const creator = allUsersData.data.find(
              (u) => u.id === registeredByUid,
            )
            if (creator) {
              setCreatorProfile(creator)
            }
          }
        }
      } else {
        setError(data.message)
      }
    } catch (err) {
      console.error('Error al obtener el perfil de usuario:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id, idToken, GET_USER_BY_CEDULA_URL, GET_SECURE_USERS_URL])

  const handleStatusChange = async (userId, newStatus) => {
    try {
      const response = await fetch(`${UPDATE_USER_STATUS_URL}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ userId, status: newStatus }),
      })
      if (!response.ok) {
        throw new Error('Error al cambiar el estado del usuario.')
      }
      fetchUserProfile()
    } catch (error) {
      console.error('Error al cambiar el estado:', error)
      setError(error.message)
    }
  }

  const handleEditClick = (userItem) => {
    setUserProfile(userItem)
    setIsEditModalOpen(true)
  }

  const handleSaveEdit = () => {
    setIsEditModalOpen(false)
    fetchUserProfile()
  }

  useEffect(() => {
    fetchUserProfile()
  }, [fetchUserProfile])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 text-neutral-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="ml-4 text-primary-600">Cargando perfil...</p>
      </div>
    )
  }

  if (error || !userProfile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-red-100 text-red-700 p-8">
        <p className="text-xl font-semibold mb-4">
          Error al cargar el perfil del usuario.
        </p>
        <p className="text-center">{error}</p>
        <Link
          href="/dashboard-admin/lista-users"
          className="mt-6 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
        >
          Volver a la lista
        </Link>
      </div>
    )
  }

  const { name, email, cedula, role, location, campaignMemberships } =
    userProfile
  const firstMembership = campaignMemberships?.[0] || {}
  const {
    campaignName,
    status,
    directVotes = 0,
    pyramidVotes = 0,
    totalPotentialVotes = 0,
    registeredAt,
  } = firstMembership
  const isUserActive = status === 'activo'

  const formattedRegisteredAt = registeredAt
    ? new Date(registeredAt).toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'N/A'

  return (
    <>
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
                    <p className="text-sm font-medium text-neutral-500">
                      Cédula
                    </p>
                    <p className="text-base font-semibold text-neutral-800">
                      {cedula || 'N/A'}
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <EnvelopeIcon className="h-5 w-5 text-neutral-500 mr-3 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-neutral-500">
                      Email
                    </p>
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
                <div className="flex items-start">
                  <CalendarIcon className="h-5 w-5 text-neutral-500 mr-3 mt-1" />
                  <div>
                    <p className="text-sm font-medium text-neutral-500">
                      Fecha de Creación
                    </p>
                    <p className="text-base font-semibold text-neutral-800">
                      {formattedRegisteredAt}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-neutral-200 space-y-4">
                <button
                  onClick={() => handleEditClick(userProfile)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors duration-200"
                >
                  <PencilIcon className="h-4 w-4 mr-2" /> Editar
                </button>
                <button
                  onClick={() =>
                    handleStatusChange(
                      userProfile.id,
                      isUserActive ? 'inactivo' : 'activo',
                    )
                  }
                  className={`w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200
                    ${isUserActive ? 'text-red-600 bg-red-50 hover:bg-red-100' : 'text-green-600 bg-green-50 hover:bg-green-100'}`}
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
            <div className="bg-white rounded-xl shadow-md p-6 border border-neutral-200">
              <h3 className="text-lg font-semibold text-neutral-800 mb-4">
                Creado por
              </h3>
              {creatorProfile ? (
                <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <div className="flex items-center">
                    <UserCircleIcon className="h-8 w-8 text-neutral-500 mr-2" />
                    <p className="text-base font-semibold text-neutral-800">
                      {creatorProfile.name}
                    </p>
                  </div>
                  <StatusBadge role={creatorProfile.role} />
                </div>
              ) : (
                <p className="text-neutral-500 text-sm">
                  No se pudo cargar la información del creador.
                </p>
              )}
            </div>
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

      <UserEditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        user={userProfile}
        onSave={handleSaveEdit}
      />
    </>
  )
}
