'use client'

import React, { useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCampaignData } from '@/hooks/useCampaignData'
import StatCard from '@/components/ui/StatCard.jsx'
import ColombiaMap from '@/components/maps/ColombiaMap'
import BarChart from '@/components/charts/BarChart'
import DoughnutChart from '@/components/charts/DoughnutChart'
import CityTable from '@/components/tables/CityTable'

import {
  UsersIcon,
  ChartBarIcon,
  HandRaisedIcon,
  ChatBubbleBottomCenterTextIcon,
  SignalIcon,
  ChevronLeftIcon,
} from '@heroicons/react/24/outline'

import { chartBrandColors } from '@/lib/mockupData'

export default function PanoramaElectoralPage() {
  const { user, isLoading: authLoading } = useAuth()
  const [selectedDepartment, setSelectedDepartment] = useState(null)

  const { campaignData, isLoading: dataLoading, error } = useCampaignData()

  const handleDepartmentClick = useCallback((departmentId) => {
    setSelectedDepartment(departmentId)
  }, [])

  const handleBackToColombia = useCallback(() => {
    setSelectedDepartment(null)
  }, [])

  // Validar si campaignData existe antes de usarlo
  const colombiaMapData = campaignData
    ? {
        meta: {
          totalVotos: campaignData.totalConfirmedVotes || 0,
          totalPotenciales: campaignData.totalPotentialVotes || 0,
          totalPromesas: campaignData.totalPromesas || 0,
          totalOpinion: campaignData.totalOpinion || {
            aFavor: 0,
            enContra: 0,
            indeciso: 100,
          },
        },
        departamentos: campaignData.departamentos || [],
      }
    : null // Asignamos null si no hay datos

  const currentDepartment = selectedDepartment
    ? colombiaMapData?.departamentos.find((d) => d.id === selectedDepartment)
    : null

  if (authLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 text-neutral-600">
        <p>Cargando datos del panorama electoral...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-red-100 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error:</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    )
  }

  if (!user || user.role !== 'candidato') {
    return (
      <div
        className="flex items-center justify-center min-h-screen bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Acceso Denegado:</strong>
        <span className="block sm:inline">
          {' '}
          No tienes permisos para ver esta página.
        </span>
      </div>
    )
  }

  // Si no hay datos después de la carga, mostramos un mensaje
  if (!colombiaMapData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 text-neutral-600">
        <p>No se pudieron cargar los datos de la campaña.</p>
      </div>
    )
  }

  const globalVotosData = {
    labels: ['Votos Totales', 'Votos Potenciales', 'Promesas de Voto'],
    datasets: [
      {
        label: 'Cantidad',
        data: [
          colombiaMapData.meta.totalVotos,
          colombiaMapData.meta.totalPotenciales,
          colombiaMapData.meta.totalPromesas,
        ],
        backgroundColor: [
          chartBrandColors.primaryDefault,
          chartBrandColors.primaryLight,
          chartBrandColors.secondaryDefault,
        ],
      },
    ],
  }

  const opinionVotosData = {
    labels: ['A Favor', 'En Contra', 'Indecisos'],
    datasets: [
      {
        label: '% de Opinión',
        data: [
          colombiaMapData.meta.totalOpinion.aFavor,
          colombiaMapData.meta.totalOpinion.enContra,
          colombiaMapData.meta.totalOpinion.indeciso,
        ],
        backgroundColor: chartBrandColors.opinionColors,
      },
    ],
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-neutral-50 min-h-screen">
      <h1 className="text-2xl sm:text-3xl font-bold text-neutral-800 mb-4 sm:mb-6 flex items-center gap-2">
        {currentDepartment ? (
          <>
            <button
              onClick={handleBackToColombia}
              className="text-blue-600 hover:text-blue-800 transition-colors flex items-center"
              aria-label="Volver a Colombia"
            >
              <ChevronLeftIcon className="h-6 w-6" />
              <SignalIcon className="h-6 w-6 ml-1" />
            </button>
            <span className="text-neutral-500">Panorama en </span>{' '}
            {currentDepartment.name}
          </>
        ) : (
          <>
            <SignalIcon className="h-7 w-7 text-blue-600" /> Panorama Electoral
            Nacional
          </>
        )}
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard
          title="Votos Totales"
          value={colombiaMapData.meta.totalVotos}
          description="Votos confirmados a nivel nacional"
          color="text-green-600"
          icon={UsersIcon}
        />
        <StatCard
          title="Votos Potenciales"
          value={colombiaMapData.meta.totalPotenciales}
          description="Potencial de votos a nivel nacional"
          icon={ChartBarIcon}
          color="text-blue-400"
        />
        <StatCard
          title="Promesas de Voto"
          value={colombiaMapData.meta.totalPromesas}
          description="Compromisos de voto a nivel nacional"
          icon={HandRaisedIcon}
          color="text-yellow-500"
        />
        <StatCard
          title="Votos de Opinión (A Favor)"
          value={`${colombiaMapData.meta.totalOpinion.aFavor}%`}
          description="Porcentaje de opinión favorable a nivel nacional"
          icon={ChatBubbleBottomCenterTextIcon}
          color="text-purple-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-neutral-800 mb-4">
            Distribución Geográfica de Votos
          </h2>
          <ColombiaMap
            onDepartmentClick={handleDepartmentClick}
            selectedDepartment={selectedDepartment}
          />
        </div>

        <div className="lg:col-span-1 space-y-6">
          <BarChart data={globalVotosData} title="Resumen General de Votos" />
          <DoughnutChart data={opinionVotosData} title="Opinión Pública (%)" />
        </div>
      </div>

      {currentDepartment && (
        <CityTable
          ciudades={currentDepartment.ciudades}
          departamento={currentDepartment.name}
        />
      )}
    </div>
  )
}
