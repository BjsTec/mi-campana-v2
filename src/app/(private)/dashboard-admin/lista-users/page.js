// app/(private)/dashboard-admin/users-list/page.js
'use client'

import React, { useState, useEffect, useMemo, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'
import {
  IdentificationIcon,
  BuildingOfficeIcon,
  UserIcon,
} from '@heroicons/react/24/outline'
import SearchInput from '@/components/ui/SearchInput'
import StatCard from '@/components/ui/StatCard'

// Componente para el badge de estado, estilizado como el de la página de campañas
const StatusBadge = ({ status }) => {
  const statusColors = {
    activo: 'bg-green-100 text-green-800',
    inactivo: 'bg-red-100 text-red-800',
    public_lead: 'bg-yellow-100 text-yellow-800',
  }
  const displayText = status === 'public_lead' ? 'Lead' : status
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}
    >
      {displayText}
    </span>
  )
}

const UserCard = ({ userItem, onStatusChange }) => {
  const firstMembership = userItem.campaignMemberships?.[0] || {}
  const userStatus = firstMembership.status || 'inactivo'
  const campaignName = firstMembership.campaignName || 'Sin campaña'

  const handleStatusChange = () => {
    // Se invoca la función del padre para cambiar el estado
    onStatusChange(userItem.id, userStatus === 'activo' ? 'inactivo' : 'activo')
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-6 transform hover:scale-105 transition duration-300 ease-in-out border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center w-full min-w-0">
          <div className="bg-gray-100 rounded-full h-10 w-10 flex items-center justify-center mr-3">
            <UserIcon className="h-6 w-6 text-gray-500" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 leading-tight truncate">
            {userItem.name || 'Nombre no disponible'}
          </h2>
        </div>
        <StatusBadge status={userStatus} />
      </div>
      <div className="space-y-2 text-sm text-neutral-700">
        <p className="flex items-center">
          <IdentificationIcon className="h-4 w-4 text-neutral-500 mr-2" />
          <span className="font-medium">Cédula:</span>{' '}
          {userItem.cedula || 'N/A'}
        </p>
        <p className="flex items-center">
          <BuildingOfficeIcon className="h-4 w-4 text-neutral-500 mr-2" />
          <span className="font-medium">Campaña:</span> {campaignName}
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-neutral-200 flex justify-between">
        <Link
          href={`/dashboard-admin/user/${userItem.cedula}`}
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
        >
          Ver Perfil
        </Link>
        <button
          onClick={handleStatusChange}
          className={`inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-white whitespace-nowrap ${
            userStatus === 'activo'
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
              : 'bg-green-600 hover:bg-green-700 focus:ring-green-500'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors duration-200`}
        >
          {userStatus === 'activo' ? 'Desactivar' : 'Activar'}
        </button>
      </div>
    </div>
  )
}

export default function UserListPage() {
  const { user, isLoading: authLoading, idToken } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('todos') // Nuevo estado para el filtro de estado

  const GET_SECURE_USERS_URL = process.env.NEXT_PUBLIC_GET_SECURE_USERS_URL
  const UPDATE_USER_STATUS_URL = process.env.NEXT_PUBLIC_UPDATE_USER_STATUS_URL

  const fetchUsers = useCallback(async () => {
    if (!idToken) {
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`${GET_SECURE_USERS_URL}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      })
      if (!response.ok) {
        if (response.status === 403) {
          throw new Error(
            'Acceso denegado. Solo administradores pueden ver esta página.',
          )
        }
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al cargar los usuarios.')
      }
      const data = await response.json()
      setUsers(data.data || [])
    } catch (err) {
      console.error('Error al obtener usuarios:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [idToken, GET_SECURE_USERS_URL])

  const handleStatusChange = useCallback(
    async (userId, newStatus) => {
      try {
        const response = await fetch(`${UPDATE_USER_STATUS_URL}/${userId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify({ status: newStatus }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message || 'Error al cambiar el estado del usuario.',
          )
        }

        // Vuelve a cargar la lista de usuarios para reflejar el cambio
        await fetchUsers()
      } catch (err) {
        console.error('Error al actualizar el estado del usuario:', err)
        setError(err.message)
      }
    },
    [idToken, UPDATE_USER_STATUS_URL, fetchUsers],
  )

  useEffect(() => {
    if (!authLoading && user && user.role === 'admin') {
      fetchUsers()
    } else if (!authLoading && (!user || user.role !== 'admin')) {
      setLoading(false)
      setError('Acceso denegado. Solo administradores pueden ver esta página.')
    }
  }, [authLoading, user, fetchUsers])

  const filteredUsers = useMemo(() => {
    return users.filter((userItem) => {
      // Filtrar por término de búsqueda
      const name = userItem.name?.toLowerCase() || ''
      const cedula = userItem.cedula?.toLowerCase() || ''
      const phone = userItem.phone?.toLowerCase() || ''
      const lowerCaseSearchTerm = searchTerm.toLowerCase()

      const matchesSearch =
        name.includes(lowerCaseSearchTerm) ||
        cedula.includes(lowerCaseSearchTerm) ||
        phone.includes(lowerCaseSearchTerm)

      // Filtrar por estado
      const userStatus = userItem.campaignMemberships?.[0]?.status || 'inactivo'
      const matchesStatus =
        statusFilter === 'todos' || userStatus === statusFilter

      return matchesSearch && matchesStatus
    })
  }, [users, searchTerm, statusFilter])

  // Nuevas métricas para el resumen
  const totalUsers = users.length
  const activeUsers = users.filter(
    (u) => (u.campaignMemberships?.[0]?.status || 'inactivo') === 'activo',
  ).length
  const inactiveUsers = totalUsers - activeUsers

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 text-neutral-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="ml-4 text-primary-600">Cargando usuarios...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-700">
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-neutral-50 min-h-screen">
      <h1 className="text-xl sm:text-3xl font-bold text-neutral-800 mb-4 sm:mb-6">
        Gestión de Usuarios Registrados
      </h1>
      <p className="text-neutral-600 mb-6">
        Aquí puedes ver un listado de todos los usuarios de la plataforma.
      </p>

      {/* Sección de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard title="Total de Usuarios" value={totalUsers} />
        <StatCard title="Usiarios Activas" value={activeUsers} color="green" />
        <StatCard
          title="Usuarios Inactivos"
          value={inactiveUsers}
          color="red"
        />
      </div>

      <div className="bg-white p-4 rounded-xl shadow-md mb-8">
        <div className="flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1">
            <SearchInput
              placeholder="Buscar por nombre, cédula o teléfono..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          {/* Nuevo filtro de estado */}
          <div className="w-full sm:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-neutral-900"
            >
              <option value="todos">Todos los Estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="public_lead">Leads</option>
            </select>
          </div>
        </div>
      </div>
      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-neutral-600">
          <p>No se encontraron usuarios con los criterios de búsqueda.</p>
        </div>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map((userItem) => (
          <UserCard
            key={userItem.id}
            userItem={userItem}
            onStatusChange={handleStatusChange}
          />
        ))}
      </div>
    </div>
  )
}
