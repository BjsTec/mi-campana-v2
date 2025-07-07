// src/app/dashboard-admin/page.js
'use client'

import React from 'react'
import { useAuth } from '@/context/AuthContext'

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

// --- Datos Simulados (MOCKUP DATA) ---
const mockData = {
  campaignTypes: [
    { name: 'Demo Free', count: 5 },
    { name: 'Básica', count: 12 },
    { name: 'Estándar', count: 8 },
    { name: 'Premium', count: 4 },
    { name: 'Empresarial', count: 2 },
    { name: 'Educativa', count: 3 },
    { name: 'ONG', count: 6 },
    { name: 'Gobierno', count: 1 },
    { name: 'Personalizada', count: 0 },
  ],
  totalUsersByCampaignType: [
    { type: 'Demo Free', users: 150 },
    { type: 'Básica', users: 800 },
    { type: 'Estándar', users: 600 },
    { type: 'Premium', users: 400 },
    { type: 'Empresarial', users: 150 },
    { type: 'Educativa', users: 200 },
    { type: 'ONG', users: 350 },
    { type: 'Gobierno', users: 50 },
    { type: 'Personalizada', users: 0 },
  ],
  totalRegisteredUsers: 2700,
  leadsInterest: [
    {
      name: 'Juan Pérez',
      email: 'juan@example.com',
      plan: 'Básica',
      date: '2025-06-28',
    },
    {
      name: 'Maria López',
      email: 'maria@example.com',
      plan: 'Premium',
      date: '2025-06-29',
    },
    {
      name: 'Carlos Gomez',
      email: 'carlos@example.com',
      plan: 'Estándar',
      date: '2025-07-01',
    },
    {
      name: 'Ana Rodríguez',
      email: 'ana@example.com',
      plan: 'Demo Free',
      date: '2025-07-02',
    },
    {
      name: 'Pedro Sánchez',
      email: 'pedro@example.com',
      plan: 'Empresarial',
      date: '2025-07-03',
    },
    {
      name: 'Sofía Díaz',
      email: 'sofia@example.com',
      plan: 'Básica',
      date: '2025-07-03',
    },
  ],
  subscriptionsPerPeriod: {
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
  },
}

// --- Colores de marca para los gráficos (definidos aquí, basados en tu tailwind.config.mjs) ---
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

// --- Componente de Tarjeta de Estadística ---
const StatCard = ({ title, value, description, icon: IconComponent }) => (
  <div className="bg-white p-5 sm:p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 flex-1 min-w-[200px] flex flex-col items-start border border-neutral-200">
    {/* Ajuste de padding y min-width */}
    {IconComponent && (
      <IconComponent className="h-7 w-7 sm:h-8 sm:w-8 text-primary mb-2 sm:mb-3" />
    )}
    {/* Ajuste de tamaño de icono y margen */}
    <h3 className="text-lg sm:text-xl font-semibold text-neutral-800 mb-1 sm:mb-2">
      {title}
    </h3>
    {/* Ajuste de tamaño de título */}
    <p className="text-3xl sm:text-4xl font-bold text-primary mb-1 sm:mb-2">
      {value}
    </p>
    {/* Ajuste de tamaño del valor */}
    <p className="text-xs sm:text-sm text-neutral-600">{description}</p>
    {/* Ajuste de tamaño de descripción */}
  </div>
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
  const { user, isLoading: authLoading } = useAuth()

  const dataLoading = false // Simula que la carga de datos ha terminado

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

  const totalCampaigns = mockData.campaignTypes.reduce(
    (sum, type) => sum + type.count,
    0,
  )
  const totalDemoFreeCampaigns =
    mockData.campaignTypes.find((t) => t.name === 'Demo Free')?.count || 0

  const campaignTypeChartData = {
    labels: mockData.campaignTypes.map((type) => type.name),
    datasets: [
      {
        label: 'Número de Campañas por Tipo',
        data: mockData.campaignTypes.map((type) => type.count),
        backgroundColor: chartBrandColors.campaignTypePalette,
        borderColor: chartBrandColors.campaignTypePalette.map((color) => color),
        borderWidth: 1,
      },
    ],
  }

  const usersByCampaignTypeChartData = {
    labels: mockData.totalUsersByCampaignType.map((data) => data.type),
    datasets: [
      {
        label: 'Usuarios Registrados por Tipo de Campaña',
        data: mockData.totalUsersByCampaignType.map((data) => data.users),
        backgroundColor: chartBrandColors.primaryLight,
        borderColor: chartBrandColors.primaryDefault,
        borderWidth: 1,
      },
    ],
  }

  const weeklySubscriptionsChartData = {
    labels: mockData.subscriptionsPerPeriod.weekly.map((data) => data.week),
    datasets: [
      {
        label: 'Nuevas Suscripciones Semanales',
        data: mockData.subscriptionsPerPeriod.weekly.map((data) => data.count),
        backgroundColor: chartBrandColors.secondaryDefault,
        borderColor: chartBrandColors.secondaryDark,
        borderWidth: 1,
      },
    ],
  }

  const monthlySubscriptionsChartData = {
    labels: mockData.subscriptionsPerPeriod.monthly.map((data) => data.month),
    datasets: [
      {
        label: 'Nuevas Suscripciones Mensuales',
        data: mockData.subscriptionsPerPeriod.monthly.map((data) => data.count),
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
        text: '',
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

  return (
    <div className="p-2 sm:p-4 lg:p-8 bg-neutral-50 min-h-screen">
      {/* Reducción de padding general en móvil */}
      <h1 className="text-xl sm:text-3xl font-bold text-neutral-800 mb-4 sm:mb-6">
        Estadísticas Globales del Programa
      </h1>
      {/* Ajuste de tamaño de título */}
      {/* Tarjetas de Resumen */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
        <StatCard
          title="Total de Campañas Activas"
          value={totalCampaigns}
          description="Organizaciones usando la plataforma"
          icon={BuildingOffice2Icon}
        />
        <StatCard
          title="Campañas Demo/Gratis"
          value={totalDemoFreeCampaigns}
          description="Campañas de prueba activas"
          icon={MegaphoneIcon}
        />
        <StatCard
          title="Usuarios Registrados"
          value={mockData.totalRegisteredUsers}
          description="Total de usuarios en todas las campañas"
          icon={UsersIcon}
        />
        <StatCard
          title="Leads de Interés"
          value={mockData.leadsInterest.length}
          description="Personas interesadas en suscripciones"
          icon={UserPlusIcon}
        />
      </div>
      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-8">
        {/* Reducción de gap y mb */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-neutral-200">
          {/* Reducción de padding */}
          <h2 className="text-lg font-semibold text-neutral-800 mb-3">
            Número de Campañas por Tipo
          </h2>
          {/* Ajuste de tamaño de título */}
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
          {/* Reducción de padding */}
          <h2 className="text-lg font-semibold text-neutral-800 mb-3">
            Usuarios Registrados por Tipo de Campaña
          </h2>
          {/* Ajuste de tamaño de título */}
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
        {/* Reducción de gap y mb */}
        <div className="bg-white p-3 sm:p-4 rounded-lg shadow-md border border-neutral-200">
          {/* Reducción de padding */}
          <h2 className="text-lg font-semibold text-neutral-800 mb-3">
            Nuevas Suscripciones Semanales
          </h2>
          {/* Ajuste de tamaño de título */}
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
          {/* Reducción de padding */}
          <h2 className="text-lg font-semibold text-neutral-800 mb-3">
            Nuevas Suscripciones Mensuales
          </h2>
          {/* Ajuste de tamaño de título */}
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
        {/* Reducción de padding */}
        <h2 className="text-lg font-semibold text-neutral-800 mb-3">
          Clientes Potenciales (Leads de Interés)
        </h2>
        {/* Ajuste de tamaño de título */}
        {mockData.leadsInterest.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-neutral-200 text-xs sm:text-sm">
              {/* Ajuste del tamaño de fuente de la tabla */}
              <thead className="bg-neutral-50">
                <tr>
                  <th
                    scope="col"
                    className="px-2 py-1 sm:px-3 sm:py-2 text-left font-medium text-neutral-600 uppercase tracking-wider"
                  >
                    Nombre
                  </th>
                  {/* Reducción de padding */}
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
                    Plan
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
                {mockData.leadsInterest.map((lead, index) => (
                  <tr
                    key={index}
                    className="hover:bg-neutral-50 transition-colors duration-150"
                  >
                    <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap font-medium text-neutral-800">
                      {lead.name}
                    </td>
                    {/* Reducción de padding */}
                    <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-neutral-600 truncate">
                      {lead.email}
                    </td>
                    {/* Reducción de padding y truncate */}
                    <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-neutral-600">
                      {lead.plan}
                    </td>
                    {/* Reducción de padding */}
                    <td className="px-2 py-2 sm:px-3 sm:py-3 whitespace-nowrap text-neutral-600">
                      {lead.date}
                    </td>
                    {/* Reducción de padding */}
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
