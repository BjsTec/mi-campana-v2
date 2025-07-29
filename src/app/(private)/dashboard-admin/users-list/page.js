'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link'

// Iconos de Heroicons (ejemplos, puedes usar los que prefieras)
import {
  UserCircleIcon,
  PhoneIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline'

// Colores pastel para las tarjetas (puedes ajustar según tu Tailwind config)
const pastelColors = [
  'bg-blue-50',
  'bg-green-50',
  'bg-yellow-50',
  'bg-pink-50',
  'bg-purple-50',
  'bg-indigo-50',
  'bg-red-50',
  'bg-teal-50',
]

export default function UserListPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('') // Estado para el buscador

  // Datos simulados de usuarios
  useEffect(() => {
    if (!authLoading && user && user.role === 'admin') {
      // Simular una carga de datos
      setTimeout(() => {
        const simulatedUsers = [
          {
            id: 'user1',
            name: 'Juan Pérez',
            cedula: '1012345678',
            phone: '3001234567',
            campaignType: 'Alcaldía',
            campaignName: 'Campaña por el Futuro',
          },
          {
            id: 'user2',
            name: 'María García',
            cedula: '1029876543',
            phone: '3109876543',
            campaignType: 'Concejo',
            campaignName: 'Renovación Ciudadana',
          },
          {
            id: 'user3',
            name: 'Carlos López',
            cedula: '1035792468',
            phone: '3205551234',
            campaignType: 'Gobernación',
            campaignName: 'Unidos por la Región',
          },
          {
            id: 'user4',
            name: 'Ana Rodríguez',
            cedula: '1046801357',
            phone: '3157890123',
            campaignType: 'Alcaldía',
            campaignName: 'Progreso para Todos',
          },
          {
            id: 'user5',
            name: 'Pedro Gómez',
            cedula: '1057913579',
            phone: '3012345678',
            campaignType: 'Asamblea',
            campaignName: 'Voz del Pueblo',
          },
          {
            id: 'user6',
            name: 'Laura Fernández',
            cedula: '1068024680',
            phone: '3023456789',
            campaignType: 'Concejo',
            campaignName: 'Crecimiento Sostenible',
          },
          {
            id: 'user7',
            name: 'Diego Ramírez',
            cedula: '1079135791',
            phone: '3034567890',
            campaignType: 'Alcaldía',
            campaignName: 'Ciudadanía Activa',
          },
          {
            id: 'user8',
            name: 'Sofía Díaz',
            cedula: '1080246802',
            phone: '3045678901',
            campaignType: 'Gobernación',
            campaignName: 'Futuro Brillante',
          },
        ]
        setUsers(simulatedUsers)
        setLoading(false)
      }, 1000) // Simular un retraso de 1 segundo
    } else if (!authLoading && (!user || user.role !== 'admin')) {
      setLoading(false)
      setError('Acceso denegado. Solo administradores pueden ver esta página.')
    }
  }, [authLoading, user])

  // Filtrar usuarios según el término de búsqueda
  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.cedula.includes(searchTerm) ||
      user.phone.includes(searchTerm) ||
      user.campaignName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

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
        Aquí puedes ver un listado de todos los usuarios registrados en las
        campañas.
      </p>

      {/* Buscador (futura implementación) */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-8">
        <label htmlFor="search-user" className="sr-only">
          Buscar usuario
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-neutral-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            name="search-user"
            id="search-user"
            className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-900"
            placeholder="Buscar por nombre, cédula, teléfono o campaña..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {filteredUsers.length === 0 && (
        <div className="text-center py-8 text-neutral-600">
          <p>No se encontraron usuarios con los criterios de búsqueda.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredUsers.map((userItem, index) => (
          <div
            key={userItem.id}
            className={`${pastelColors[index % pastelColors.length]} rounded-xl shadow-lg p-4 sm:p-6 transform hover:scale-105 transition duration-300 ease-in-out border border-neutral-200 flex flex-col`}
          >
            <div className="flex items-center mb-3">
              <UserCircleIcon className="h-8 w-8 text-primary-600 mr-3" />
              <h2 className="text-lg font-semibold text-neutral-900 truncate">
                {userItem.name}
              </h2>
            </div>
            <div className="space-y-2 text-sm text-neutral-700 flex-grow">
              <p className="flex items-center">
                <BuildingOfficeIcon className="h-4 w-4 text-neutral-500 mr-2" />
                <span className="font-medium">Campaña:</span>{' '}
                {userItem.campaignName} ({userItem.campaignType})
              </p>
              <p className="flex items-center">
                <IdentificationIcon className="h-4 w-4 text-neutral-500 mr-2" />
                <span className="font-medium">Cédula:</span> {userItem.cedula}
              </p>
              <p className="flex items-center">
                <PhoneIcon className="h-4 w-4 text-neutral-500 mr-2" />
                <span className="font-medium">Teléfono:</span> {userItem.phone}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-neutral-200">
              <Link
                href={`/dashboard-admin/users/${userItem.id}`} // Ruta de detalle de usuario
                className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md shadow-sm
                           border border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white
                           focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500
                           transition-colors duration-200"
              >
                Ver más detalle
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
