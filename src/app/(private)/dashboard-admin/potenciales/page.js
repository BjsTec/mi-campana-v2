// src/app/(private)/dashboard-admin/potenciales/page.js
'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../../../context/AuthContext' // ¡Ruta corregida!
import { useRouter } from 'next/navigation' // Para la navegación programática

// Componente para una tarjeta individual de Lead
const LeadCard = ({ lead }) => {
  const router = useRouter()

  const handleViewDetails = () => {
    router.push(`/dashboard-admin/potenciales/${lead.id}`)
  }

  // Función para formatear la fecha
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'N/A'
    // Firebase Timestamps pueden ser objetos { _seconds, _nanoseconds }
    const date = timestamp._seconds
      ? new Date(timestamp._seconds * 1000)
      : new Date(timestamp)
    return date.toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200 flex flex-col justify-between transform hover:scale-[1.02] transition-transform duration-200 ease-in-out">
      <div>
        <h3 className="text-xl font-semibold text-primary-dark mb-2">
          {lead.name}
        </h3>
        <p className="text-neutral-600 text-sm mb-1">Email: {lead.email}</p>
        <p className="text-neutral-600 text-sm mb-1">
          Teléfono: {lead.phone || 'N/A'}
        </p>
        <p className="text-neutral-600 text-sm mb-1">
          Interesado en: {lead.interestedIn || 'N/A'}
        </p>
        <p className="text-neutral-600 text-sm mb-1">
          Fuente: {lead.source || 'N/A'}
        </p>
        <p className="text-neutral-600 text-sm mb-2">
          Estado:
          <span
            className={`font-bold ml-1 
            ${lead.status === 'nuevo' ? 'text-secondary-DEFAULT' : ''}
            ${lead.status === 'contactado' ? 'text-primary-DEFAULT' : ''}
            ${lead.status === 'en_seguimiento' ? 'text-blue-500' : ''}
            ${lead.status === 'convertido' ? 'text-success' : ''}
            ${lead.status === 'descartado' ? 'text-error' : ''}
          `}
          >
            {lead.status ? lead.status.replace(/_/g, ' ').toUpperCase() : 'N/A'}
          </span>
        </p>
        <p className="text-neutral-500 text-xs">
          Recibido: {formatTimestamp(lead.timestamp)}
        </p>
      </div>
      <div className="mt-4">
        <button
          onClick={handleViewDetails}
          className="bg-primary-DEFAULT text-neutral-50 px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary-dark transition-colors duration-200 w-full"
        >
          Ver Detalles
        </button>
      </div>
    </div>
  )
}

export default function LeadsListPage() {
  const { idToken, authLoading } = useAuth() // Obtener idToken del contexto de autenticación
  const [allLeads, setAllLeads] = useState([])
  const [uncontactedLeads, setUncontactedLeads] = useState([])
  const [contactedLeads, setContactedLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('uncontacted') // 'uncontacted' o 'contacted'

  useEffect(() => {
    const fetchLeads = async () => {
      if (authLoading || !idToken) {
        // Esperar a que la autenticación esté lista y haya un token
        // y si authLoading se completa y NO hay idToken, significa que el usuario no está logeado.
        if (!authLoading && !idToken) {
          setError(
            'No autenticado. Por favor, inicia sesión para ver los clientes potenciales.',
          )
          setLoading(false)
        }
        return
      }
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(
          'https://us-central1-micampanav2.cloudfunctions.net/getLeads',
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${idToken}`,
              'Content-Type': 'application/json',
            },
          },
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message || 'Error al obtener los clientes potenciales.',
          )
        }

        const data = await response.json()
        const sortedData = data.sort((a, b) => {
          // Ordenar por timestamp: los más antiguos primero
          const timestampA =
            a.timestamp && a.timestamp._seconds ? a.timestamp._seconds : 0
          const timestampB =
            b.timestamp && b.timestamp._seconds ? b.timestamp._seconds : 0
          return timestampA - timestampB
        })

        setAllLeads(sortedData)

        // Filtrar para las dos listas
        setUncontactedLeads(
          sortedData.filter((lead) => lead.status === 'nuevo'),
        )
        setContactedLeads(sortedData.filter((lead) => lead.status !== 'nuevo'))
      } catch (err) {
        console.error('Error fetching leads:', err)
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchLeads()
  }, [idToken, authLoading]) // Se ejecuta cuando idToken o authLoading cambian

  // Filtrar leads para la UI según el término de búsqueda
  const filterLeads = (leads) => {
    if (!searchTerm) {
      return leads
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return leads.filter(
      (lead) =>
        lead.name.toLowerCase().includes(lowerCaseSearchTerm) ||
        lead.email.toLowerCase().includes(lowerCaseSearchTerm) ||
        (lead.phone &&
          lead.phone.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (lead.interestedIn &&
          lead.interestedIn.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (lead.source &&
          lead.source.toLowerCase().includes(lowerCaseSearchTerm)) || // Añadido filtro por fuente
        (lead.status &&
          lead.status.toLowerCase().includes(lowerCaseSearchTerm)), // Añadido filtro por estado
    )
  }

  const displayedLeads =
    activeTab === 'uncontacted'
      ? filterLeads(uncontactedLeads)
      : filterLeads(contactedLeads)

  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-primary-dark mb-6">
          Gestión de Clientes Potenciales
        </h1>

        {/* Buscador y Botón de Crear Nuevo */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="relative w-full md:w-1/2">
            {' '}
            {/* Contenedor para el buscador */}
            <input
              type="text"
              placeholder="Buscar por nombre, email, fuente, estado..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-3 pl-10 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT shadow-sm"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                className="h-5 w-5 text-neutral-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                ></path>
              </svg>
            </div>
          </div>
          <Link
            href="/dashboard-admin/potenciales/new"
            className="bg-secondary-DEFAULT text-primary-dark px-6 py-3 rounded-full font-semibold hover:bg-secondary-dark transition-colors duration-200 shadow-md whitespace-nowrap"
          >
            + Crear Nuevo Cliente
          </Link>
        </div>

        {/* Pestañas de Contactados / No Contactados */}
        <div className="flex border-b-2 border-neutral-300 mb-6 w-full overflow-x-auto">
          {' '}
          {/* Ajuste para scroll en móviles */}
          <button
            onClick={() => setActiveTab('uncontacted')}
            className={`flex-1 py-3 px-4 text-lg font-semibold whitespace-nowrap transition-colors duration-200 
              ${
                activeTab === 'uncontacted'
                  ? 'bg-primary-DEFAULT text-neutral-50 rounded-t-lg border-b-4 border-primary-DEFAULT -mb-0.5' // Fondo azul, texto blanco, borde más grueso
                  : 'text-neutral-600 hover:text-primary-dark hover:bg-neutral-200'
              }
            `}
          >
            Sin Contactar ({uncontactedLeads.length})
          </button>
          <button
            onClick={() => setActiveTab('contacted')}
            className={`flex-1 py-3 px-4 text-lg font-semibold whitespace-nowrap transition-colors duration-200 
              ${
                activeTab === 'contacted'
                  ? 'bg-primary-DEFAULT text-neutral-50 rounded-t-lg border-b-4 border-primary-DEFAULT -mb-0.5' // Fondo azul, texto blanco, borde más grueso
                  : 'text-neutral-600 hover:text-primary-dark hover:bg-neutral-200'
              }
            `}
          >
            Contactados ({contactedLeads.length})
          </button>
        </div>

        {loading && (
          <p className="text-center text-primary-dark text-lg py-10">
            Cargando clientes potenciales...
          </p>
        )}
        {error && (
          <p className="text-center text-error text-lg py-10">Error: {error}</p>
        )}

        {!loading && !error && displayedLeads.length === 0 && (
          <p className="text-center text-neutral-600 text-lg py-10">
            No hay clientes potenciales en esta lista.
          </p>
        )}

        {/* Lista de Tarjetas de Clientes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {' '}
          {/* Añadido xl:grid-cols-4 para más columnas en pantallas grandes */}
          {!loading &&
            !error &&
            displayedLeads.map((lead) => (
              <LeadCard key={lead.id} lead={lead} />
            ))}
        </div>
      </div>
    </div>
  )
}
