// src/app/(private)/dashboard-admin/potenciales/page.js
'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '../../../../context/AuthContext'
import { useRouter } from 'next/navigation'

// Importamos los componentes atómicos y moléculas que acabamos de crear
import SearchInput from '@/components/ui/SearchInput.jsx'
import StatCard from '@/components/ui/StatCard.jsx'
import SkeletonCard from '@/components/ui/SkeletonCard.jsx'
import Tabs from '@/components/ui/Tabs.jsx'
import LeadCard from '../../../../components/admin/LeadCard.jsx'

// Importamos los íconos necesarios para las StatCards
import {
  UsersIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline'

const GET_LEADS_URL = process.env.NEXT_PUBLIC_GET_LEADS_URL

export default function LeadsListPage() {
  const { idToken, authLoading, user } = useAuth()
  const [allLeads, setAllLeads] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [activeTab, setActiveTab] = useState('uncontacted')

  const fetchLeads = useCallback(async () => {
    if (authLoading || !idToken) {
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
      const response = await fetch(GET_LEADS_URL, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${idToken}`,
          // CORRECCIÓN: Volver a incluir el Content-Type para evitar 400 Bad Request
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          errorData.message || 'Error al cargar clientes potenciales.',
        )
      }

      const data = await response.json()
      // CORRECCIÓN: Ajustar el manejo de la respuesta de la API. La documentación
      // muestra que el backend devuelve un array directamente.
      const leadsArray = Array.isArray(data) ? data : data.leads || []

      const sortedData = leadsArray.sort((a, b) => {
        const timestampA = a.timestamp?._seconds || 0
        const timestampB = b.timestamp?._seconds || 0
        return timestampA - timestampB
      })
      setAllLeads(sortedData)
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [idToken, authLoading])

  useEffect(() => {
    fetchLeads()
  }, [fetchLeads])

  const filteredLeads = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase()
    return allLeads.filter(
      (lead) =>
        lead.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
        lead.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
        (lead.phone &&
          lead.phone.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (lead.interestedIn &&
          lead.interestedIn.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (lead.source &&
          lead.source.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (lead.status &&
          lead.status.toLowerCase().includes(lowerCaseSearchTerm)),
    )
  }, [allLeads, searchTerm])

  const uncontactedLeads = useMemo(
    () => filteredLeads.filter((lead) => lead.status === 'nuevo'),
    [filteredLeads],
  )
  const contactedLeads = useMemo(
    () => filteredLeads.filter((lead) => lead.status !== 'nuevo'),
    [filteredLeads],
  )

  const displayedLeads =
    activeTab === 'uncontacted' ? uncontactedLeads : contactedLeads

  const tabs = [
    {
      label: `Sin Contactar (${uncontactedLeads.length})`,
      value: 'uncontacted',
    },
    { label: `Contactados (${contactedLeads.length})`, value: 'contacted' },
  ]

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 text-neutral-600">
        <p>Verificando autenticación...</p>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-red-600">
        <p>Acceso denegado. Solo administradores pueden ver esta página.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4 sm:p-6 lg:p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold text-primary-dark mb-6 font-headings">
          Gestión de Clientes Potenciales
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Leads"
            value={allLeads.length}
            icon={UsersIcon}
            href="#"
          />
          <StatCard
            title="Nuevos Leads"
            value={uncontactedLeads.length}
            icon={ClockIcon}
            href="#"
          />
          <StatCard
            title="Contactados"
            value={contactedLeads.length}
            icon={CheckCircleIcon}
            href="#"
          />
          <StatCard
            title="Descartados"
            value={allLeads.filter((l) => l.status === 'descartado').length}
            icon={XCircleIcon}
            href="#"
          />
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div className="w-full md:w-1/2">
            <SearchInput
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              placeholder="Buscar por nombre, email, estado..."
            />
          </div>
          <Link
            href="/dashboard-admin/potenciales/new"
            className="bg-secondary-DEFAULT text-primary-dark px-6 py-3 rounded-full font-semibold hover:bg-secondary-dark transition-colors duration-200 shadow-md whitespace-nowrap font-body"
          >
            + Crear Nuevo Cliente
          </Link>
        </div>

        <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))}
          </div>
        )}
        {error && (
          <p className="text-center text-error text-lg py-10 font-body">
            Error: {error}
          </p>
        )}
        {!loading && !error && displayedLeads.length === 0 && (
          <p className="text-center text-neutral-600 text-lg py-10 font-body">
            No se encontraron clientes potenciales en esta lista.
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
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
