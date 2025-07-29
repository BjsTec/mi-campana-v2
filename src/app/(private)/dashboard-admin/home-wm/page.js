// src/app/dashboard-admin/page.js
'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import Link from 'next/link' // Importa Link de Next.js para la navegación

// Importar los componentes de gráficos y registrar Chart.js
import { Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
)

// Iconos de Heroicons
import {
  BuildingOffice2Icon,
  MegaphoneIcon,
  UsersIcon,
  UserPlusIcon,
} from '@heroicons/react/24/outline'

// --- Colores de marca para los gráficos ---
const chartBrandColors = {
  primaryDefault: '#3084F2',
  primaryLight: '#61A3F7',
  primaryDark: '#102540',
  secondaryDefault: '#F2B90F',
  secondaryLight: '#FCE497',
  secondaryDark: '#CC9900',
  neutral50: '#FAFAFA',
  neutral100: '#F3F4F6',
  neutral200: '#E5E7EB',
  neutral300: '#D1D5DB',
  neutral600: '#4B5563',
  neutral800: '#1F2937',
  errorDark: '#dc3545',
  campaignTypePalette: [
    '#3084F2', // Primary
    '#F2B90F', // Secondary
    '#28a745', // Success green
    '#dc3545', // Error red
    '#ffc107', // Warning yellow
    '#17a2b8', // Info cyan
    '#6f42c1', // Purple
    '#fd7e14', // Orange
    '#e83e8c', // Pink
  ],
}

// --- Componente de Tarjeta de Estadística (modificado para ser un enlace) ---
const StatCard = ({ title, value, description, icon: IconComponent, href }) => (
  <Link href={href} className="block">
    {' '}
    {/* Envuelve la tarjeta en un Link */}
    <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md hover:shadow-lg hover:border-primary-300 transition-all duration-300 flex-1 min-w-[200px] flex flex-col items-start border border-neutral-200 cursor-pointer">
      {IconComponent && (
        <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 text-primary mb-2 sm:mb-3" />
      )}
      <h3 className="text-lg sm:text-xl font-semibold text-neutral-800 mb-1 sm:mb-2">
        {title}
      </h3>
      <p className="text-3xl sm:text-4xl font-bold text-primary mb-1 sm:mb-2">
        {value}
      </p>
      <p className="text-xs sm:text-sm text-neutral-600">{description}</p>
    </div>
  </Link>
)

// Componente Skeleton Card para estados de carga
const SkeletonCard = () => (
  <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md animate-pulse border border-neutral-200">
    <div className="h-7 w-7 sm:h-8 sm:w-8 bg-neutral-200 rounded-full mb-2 sm:mb-3"></div>
    <div className="h-4 bg-neutral-200 rounded w-3/4 mb-3"></div>
    <div className="h-7 bg-neutral-300 rounded w-1/2 mb-2"></div>
    <div className="h-3 bg-neutral-200 rounded w-full"></div>
  </div>
)

export default function StatisticsPage() {
  const { user, isLoading: authLoading, idToken } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [leads, setLeads] = useState([])
  const [totalRegisteredUsers, setTotalRegisteredUsers] = useState(0)
  const [subscriptionsPerPeriod, setSubscriptionsPerPeriod] = useState({
    weekly: [],
    monthly: [],
  })
  const [dataLoading, setDataLoading] = useState(true)
  const [error, setError] = useState(null)

  // Función para obtener datos de las campañas
  const fetchCampaigns = useCallback(async (token) => {
    setError(null)
    if (!token) {
      setError('No autenticado. Por favor, inicia sesión.')
      return
    }

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_GET_CAMPAIGNS_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          `Error ${response.status}: ${errorData.message || 'Error al cargar campañas.'}`,
        )
      }
      const data = await response.json()
      setCampaigns(data.campaigns || [])
    } catch (err) {
      console.error('Error fetching campaigns:', err)
      setError(`Error al cargar los datos de las campañas: ${err.message}`)
    }
  }, [])

  // Función para obtener datos de los leads
  const fetchLeads = useCallback(async (token) => {
    setError(null)
    if (!token) {
      setError('No autenticado. Por favor, inicia sesión.')
      return
    }

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_GET_LEADS_URL, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(
          `Error ${response.status}: ${errorData.message || 'Error al cargar leads.'}`,
        )
      }
      const data = await response.json()
      setLeads(data || [])
    } catch (err) {
      console.error('Error fetching leads:', err)
      setError(`Error al cargar los datos de los leads: ${err.message}`)
    }
  }, [])

  // NOTE: Necesitarías una Cloud Function que retorne el total de usuarios registrados
  const fetchTotalRegisteredUsers = useCallback(async () => {
    // Si tu `getCampaigns` retorna el número de usuarios por campaña, podrías sumarlos aquí.
    // O si tienes una función específica, la llamarías:
    // try {
    //   const token = await idToken; // Si necesitas el token para esta nueva función
    //   const response = await fetch(process.env.NEXT_PUBLIC_GET_TOTAL_REGISTERED_USERS_URL, {
    //     headers: { Authorization: `Bearer ${token}` }
    //   });
    //   const data = await response.json();
    //   setTotalRegisteredUsers(data.totalUsers);
    // } catch (err) {
    //   console.error('Error fetching total users:', err);
    //   setError('Error al cargar el total de usuarios.');
    // }
    setTotalRegisteredUsers(2700) // Valor de MOCK, ajustar con datos reales
  }, [])

  // NOTE: Necesitarías Cloud Functions para las suscripciones semanales/mensuales
  const fetchSubscriptionsPerPeriod = useCallback(async () => {
    setSubscriptionsPerPeriod({
      // MOCK para demostración, ajustar con datos reales
      weekly: [
        { week: 'Semana 1 Jun', count: 5 },
        { week: 'Semana 2 Jun', count: 8 },
        { week: 'Semana 3 Jun', count: 6 },
        { week: 'Semana 4 Jun', count: 10 },
        { week: 'Semana 1 Jul', count: 7 },
        { week: 'Semana 2 Jul', count: 12 },
      ],
      monthly: [
        { month: 'Abril', count: 20 },
        { month: 'Mayo', count: 25 },
        { month: 'Junio', count: 29 },
        { month: 'Julio', count: 19 },
      ],
    })
  }, [])

  useEffect(() => {
    if (!authLoading && user && user.role === 'admin' && idToken) {
      const loadData = async () => {
        setDataLoading(true)
        setError(null) // Limpiar errores antes de cargar

        await Promise.all([
          fetchCampaigns(idToken),
          fetchLeads(idToken),
          fetchTotalRegisteredUsers(),
          fetchSubscriptionsPerPeriod(),
        ])
        setDataLoading(false)
      }
      loadData()
    } else if (!authLoading && (!user || user.role !== 'admin')) {
      setDataLoading(false)
    }
  }, [
    authLoading,
    user,
    idToken,
    fetchCampaigns,
    fetchLeads,
    fetchTotalRegisteredUsers,
    fetchSubscriptionsPerPeriod,
  ])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 text-neutral-600">
        <p>Cargando autenticación...</p>
      </div>
    )
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-error-dark">
        <p>Acceso denegado. Solo administradores pueden ver esta página.</p>
      </div>
    )
  }

  // --- Procesamiento de datos para gráficos y tarjetas ---
  const totalCampaigns = campaigns.length
  const totalDemoFreeCampaigns = campaigns.filter(
    (c) => c.type === 'Demo Free',
  ).length

  // Para 'campaignTypeChartData' y 'usersByCampaignTypeChartData'
  const campaignTypeCounts = {}
  const usersByCampaignType = {}
  campaigns.forEach((campaign) => {
    campaignTypeCounts[campaign.type] =
      (campaignTypeCounts[campaign.type] || 0) + 1
    // Ajustado para usar totalConfirmedVotes + totalPotentialVotes como proxy de usuarios
    usersByCampaignType[campaign.type] =
      (usersByCampaignType[campaign.type] || 0) +
      (campaign.totalConfirmedVotes || 0) +
      (campaign.totalPotentialVotes || 0)
  })

  const campaignTypeChartData = {
    labels: Object.keys(campaignTypeCounts),
    datasets: [
      {
        label: 'Número de Campañas por Tipo',
        data: Object.values(campaignTypeCounts),
        backgroundColor: chartBrandColors.campaignTypePalette.slice(
          0,
          Object.keys(campaignTypeCounts).length,
        ),
        borderColor: chartBrandColors.campaignTypePalette.slice(
          0,
          Object.keys(campaignTypeCounts).length,
        ),
        borderWidth: 1,
      },
    ],
  }

  const usersByCampaignTypeChartData = {
    labels: Object.keys(usersByCampaignType),
    datasets: [
      {
        label: 'Usuarios Registrados por Tipo de Campaña',
        data: Object.values(usersByCampaignType),
        backgroundColor: chartBrandColors.primaryLight,
        borderColor: chartBrandColors.primaryDefault,
        borderWidth: 1,
      },
    ],
  }

  // Para 'leadsInterest' en la tabla
  const processedLeads = leads.map((lead) => ({
    name: lead.name,
    email: lead.email,
    // Usar 'interestedIn' del JSON de Postman
    plan: lead.interestedIn,
    date:
      lead.timestamp && typeof lead.timestamp._seconds === 'number'
        ? new Date(lead.timestamp._seconds * 1000).toLocaleDateString('es-CO')
        : 'N/A',
  }))

  const weeklySubscriptionsChartData = {
    labels: subscriptionsPerPeriod.weekly.map((data) => data.week),
    datasets: [
      {
        label: 'Nuevas Suscripciones Semanales',
        data: subscriptionsPerPeriod.weekly.map((data) => data.count),
        backgroundColor: chartBrandColors.secondaryDefault,
        borderColor: chartBrandColors.secondaryDark,
        borderWidth: 1,
      },
    ],
  }

  const monthlySubscriptionsChartData = {
    labels: subscriptionsPerPeriod.monthly.map((data) => data.month),
    datasets: [
      {
        label: 'Nuevas Suscripciones Mensuales',
        data: subscriptionsPerPeriod.monthly.map((data) => data.count),
        backgroundColor: chartBrandColors.primaryDefault,
        borderColor: chartBrandColors.primaryDark,
        borderWidth: 1,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: chartBrandColors.neutral800,
        },
      },
      title: {
        display: true,
        text: '', // Se sobreescribe en cada gráfico
        color: chartBrandColors.neutral800,
      },
      tooltip: {
        backgroundColor: chartBrandColors.neutral800,
        titleColor: chartBrandColors.neutral100,
        bodyColor: chartBrandColors.neutral100,
      },
    },
    scales: {
      x: {
        ticks: {
          color: chartBrandColors.neutral600,
        },
        grid: {
          color: chartBrandColors.neutral100,
        },
      },
      y: {
        ticks: {
          color: chartBrandColors.neutral600,
        },
        grid: {
          color: chartBrandColors.neutral100,
        },
      },
    },
  }

  if (dataLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-neutral-50">
        <div className="h-10 w-1/3 bg-neutral-200 rounded animate-pulse mb-6"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <SkeletonCard />
          <SkeletonCard />
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md animate-pulse h-64 border border-neutral-200">
          <div className="h-6 bg-neutral-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-neutral-100 rounded w-full mb-2"></div>
          <div className="h-4 bg-neutral-100 rounded w-full mb-2"></div>
          <div className="h-4 bg-neutral-100 rounded w-full mb-2"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-red-100 text-error-dark">
        <p>Error: {error}</p>
      </div>
    )
  }

  return (
    <div className="p-2 sm:p-4 lg:p-8 bg-neutral-50 min-h-screen">
      <h1 className="text-xl sm:text-3xl font-bold text-neutral-800 mb-4 sm:mb-6">
        Estadísticas Globales del Programa
      </h1>

      {/* Tarjetas de Resumen como Enlaces/Botones */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          title="Total de Campañas Activas"
          value={totalCampaigns}
          description="Organizaciones usando la plataforma"
          icon={BuildingOffice2Icon}
          href="/dashboard-admin/lista-campanas" // Enlace a la lista de campañas
        />
        <StatCard
          title="Campañas Demo/Gratis"
          value={totalDemoFreeCampaigns}
          description="Campañas de prueba activas"
          icon={MegaphoneIcon}
          href="/dashboard-admin/lista-campanas?type=Demo Free" // Filtra por tipo
        />
        <StatCard
          title="Usuarios Registrados"
          value={totalRegisteredUsers}
          description="Total de usuarios en todas las campañas"
          icon={UsersIcon}
          href="/dashboard-admin/users-list" // Asumiendo una ruta para usuarios si existe
        />
        <StatCard
          title="Leads de Interés"
          value={processedLeads.length}
          description="Personas interesadas en suscripciones"
          icon={UserPlusIcon}
          href="/dashboard-admin/potenciales" // Nueva ruta para Leads
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800 mb-3">
            Número de Campañas por Tipo
          </h2>
          <Pie
            data={campaignTypeChartData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Distribución de Campañas por Tipo',
                },
              },
            }}
          />
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800 mb-3">
            Usuarios Registrados por Tipo de Campaña
          </h2>
          <Bar
            data={usersByCampaignTypeChartData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Usuarios por Plan de Campaña',
                },
              },
            }}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800 mb-3">
            Nuevas Suscripciones Semanales
          </h2>
          <Bar
            data={weeklySubscriptionsChartData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Suscripciones por Semana',
                },
              },
            }}
          />
        </div>
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-neutral-200">
          <h2 className="text-lg font-semibold text-neutral-800 mb-3">
            Nuevas Suscripciones Mensuales
          </h2>
          <Bar
            data={monthlySubscriptionsChartData}
            options={{
              ...chartOptions,
              plugins: {
                ...chartOptions.plugins,
                title: {
                  ...chartOptions.plugins.title,
                  text: 'Suscripciones por Mes',
                },
              },
            }}
          />
        </div>
      </div>
      {/* Listado de Clientes Interesados (Leads) */}
      <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-neutral-200">
        <h2 className="text-lg font-semibold text-neutral-800 mb-3">
          Clientes Potenciales (Leads de Interés)
        </h2>
        {processedLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-xs sm:text-sm">
              <thead className="bg-neutral-50">
                <tr>
                  <th
                    scope="col"
                    className="px-2 py-1 sm:px-3 sm:py-2 text-left font-medium text-neutral-600 uppercase tracking-wider"
                  >
                    Nombre
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-1 sm:px-3 sm:py-2 text-left font-medium text-neutral-600 uppercase tracking-wider"
                  >
                    Email
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-1 sm:px-3 sm:py-2 text-left font-medium text-neutral-600 uppercase tracking-wider"
                  >
                    Interesado en (Plan) {/* Etiqueta actualizada */}
                  </th>
                  <th
                    scope="col"
                    className="px-2 py-1 sm:px-3 sm:py-2 text-left font-medium text-neutral-600 uppercase tracking-wider"
                  >
                    Fecha
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-neutral-200">
                {processedLeads.map((lead, index) => (
                  <tr
                    key={index}
                    className="hover:bg-neutral-50 transition-colors duration-150"
                  >
                    <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap font-medium text-neutral-800">
                      {lead.name}
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-neutral-600 truncate">
                      {lead.email}
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-neutral-600">
                      {lead.plan} {/* Muestra lead.interestedIn */}
                    </td>
                    <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-neutral-600">
                      {lead.date}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-neutral-600 text-sm">
            No hay clientes potenciales registrados por ahora.
          </p>
        )}
      </div>
    </div>
  )
}
