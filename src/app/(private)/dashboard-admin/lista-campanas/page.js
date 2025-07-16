'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCampaigns } from '@/hooks/useCampaigns'
import Link from 'next/link'
import Alert from '@/components/ui/Alert' // Importar el componente Alert
import ConfirmModal from '@/components/ui/ConfirmModal' // Importar el componente ConfirmModal

// --- Iconos ---
const CampaignIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    {' '}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514M15 11l-1 1"
    />{' '}
  </svg>
)
const CheckCircleIcon = ({ isActive }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={`h-5 w-5 ${isActive ? 'text-green-500' : 'text-red-500'}`}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-4 w-4"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
)

// --- Definición de colores pastel (usando tus colores de Tailwind extendidos) ---
const pastelColors = [
  'bg-primary-50', // Asumiendo que has definido primary-50 o similar
  'bg-secondary-50', // Asumiendo que has definido secondary-50 o similar
  'bg-neutral-50',
  'bg-blue-50',
  'bg-green-50',
  'bg-yellow-50',
  'bg-pink-50',
  'bg-purple-50',
]

export default function ListaCampanasPage() {
  // Usamos 'idToken' del AuthContext, que es el nombre correcto según tu definición
  const { user, idToken } = useAuth()
  const [filters, setFilters] = useState({ type: '', status: '', search: '' })

  const { campaigns, campaignTypes, loading, error, refreshData } =
    useCampaigns()

  const UPDATE_CAMPAIGN_STATUS_URL =
    process.env.NEXT_PUBLIC_UPDATE_CAMPAIGN_STATUS_URL

  // Estado para el modal de confirmación
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [campaignToToggle, setCampaignToToggle] = useState(null) // { id, currentStatus }

  // Estado para la alerta personalizada
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' })

  const filteredCampaigns = campaigns.filter((campaign) => {
    const matchesType = filters.type === '' || campaign.type === filters.type
    const matchesStatus =
      filters.status === '' || campaign.status === filters.status
    const matchesSearch =
      filters.search === '' ||
      (campaign.campaignName &&
        campaign.campaignName
          .toLowerCase()
          .includes(filters.search.toLowerCase())) ||
      (campaign.candidateName &&
        campaign.candidateName
          .toLowerCase()
          .includes(filters.search.toLowerCase()))
    return matchesType && matchesStatus && matchesSearch
  })

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters((prevFilters) => ({ ...prevFilters, [name]: value }))
  }

  // Abre el modal de confirmación
  const handleOpenConfirmModal = useCallback((campaignId, currentStatus) => {
    setCampaignToToggle({ id: campaignId, currentStatus })
    setShowConfirmModal(true)
  }, [])

  // Función para confirmar y ejecutar el cambio de estado
  const handleConfirmToggleStatus = useCallback(async () => {
    if (!campaignToToggle) return // Asegurarse de que hay una campaña para procesar

    const { id, currentStatus } = campaignToToggle
    setShowConfirmModal(false) // Cerrar el modal inmediatamente después de confirmar

    try {
      if (!UPDATE_CAMPAIGN_STATUS_URL) {
        throw new Error('URL para actualizar estado de campaña no configurada.')
      }
      if (!idToken) {
        // Usamos idToken del AuthContext
        throw new Error('No hay token de autenticación disponible.')
      }

      const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo'

      const response = await fetch(UPDATE_CAMPAIGN_STATUS_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`, // Usamos idToken aquí
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ campaignId: id, status: newStatus }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(
          errData.message || 'Error al actualizar el estado de la campaña.',
        )
      }

      await refreshData() // Recargar los datos después de la actualización exitosa
      setAlert({
        show: true,
        message: `Estado de la campaña actualizado a '${newStatus}' exitosamente.`,
        type: 'success',
      })
    } catch (err) {
      console.error('Error al cambiar estado de campaña:', err)
      setAlert({
        show: true,
        message: `Error al cambiar estado de campaña: ${err.message}`,
        type: 'error',
      })
    } finally {
      setCampaignToToggle(null) // Limpiar el estado de la campaña a conmutar
    }
  }, [UPDATE_CAMPAIGN_STATUS_URL, idToken, refreshData, campaignToToggle]) // Dependencias actualizadas

  // Función para cancelar el cambio de estado
  const handleCancelToggleStatus = useCallback(() => {
    setShowConfirmModal(false)
    setCampaignToToggle(null) // Limpiar el estado
  }, [])

  const handleCloseAlert = useCallback(() => {
    setAlert({ ...alert, show: false })
  }, [alert])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 text-neutral-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        <p className="ml-4 text-primary-600">Cargando campañas...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 bg-neutral-100 min-h-screen flex items-center justify-center">
        {/* Usando el componente Alert para mostrar errores de carga inicial */}
        <Alert
          message={error}
          type="error"
          onClose={() => setAlert({ show: false, message: '', type: 'info' })} // Se podría reiniciar, o dejar fijo.
        />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-neutral-100 min-h-screen">
      {alert.show && (
        <div className="fixed top-4 right-4 z-50">
          {' '}
          {/* Posiciona la alerta en la esquina superior derecha */}
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={handleCloseAlert}
          />
        </div>
      )}

      {showConfirmModal && campaignToToggle && (
        <ConfirmModal
          title="Confirmar Cambio de Estado"
          message={`¿Estás seguro de cambiar el estado de la campaña a '${campaignToToggle.currentStatus === 'activo' ? 'inactivo' : 'activo'}'? Esta acción afectará su visibilidad.`}
          onConfirm={handleConfirmToggleStatus}
          onCancel={handleCancelToggleStatus}
        />
      )}

      <h1 className="text-3xl font-bold text-neutral-800 mb-6">
        Gestión de Campañas
      </h1>
      <p className="text-neutral-600 mb-6">
        Aquí puedes ver y gestionar todas las campañas registradas en el
        sistema.
      </p>

      {/* --- Controles de Filtro --- */}
      <div className="bg-white p-4 rounded-xl shadow-md mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex-1">
          <label htmlFor="search" className="sr-only">
            Buscar
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-neutral-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              name="search"
              id="search"
              value={filters.search}
              onChange={handleFilterChange}
              className="block w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-md leading-5 bg-white placeholder-neutral-500 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm text-neutral-900"
              placeholder="Buscar por Nombre/Candidato"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch md:items-center gap-4">
          <div>
            <label htmlFor="type" className="sr-only">
              Filtrar por Tipo
            </label>
            <select
              name="type"
              id="type"
              value={filters.type}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-neutral-900"
            >
              <option value="">Todos los Tipos</option>
              {campaignTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="status" className="sr-only">
              Filtrar por Estado
            </label>
            <select
              name="status"
              id="status"
              value={filters.status}
              onChange={handleFilterChange}
              className="block w-full pl-3 pr-10 py-2 text-base border-neutral-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md text-neutral-900"
            >
              <option value="">Todos los Estados</option>
              <option value="activo">Activo</option>
              <option value="inactivo">Inactivo</option>
              <option value="archivado">Archivado</option>
            </select>
          </div>
        </div>
      </div>
      {!loading && !error && filteredCampaigns.length === 0 && (
        <div className="text-center py-8 text-neutral-600">
          <p>No se encontraron campañas con los filtros aplicados.</p>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCampaigns.map((campaign, index) => (
          <div
            key={campaign.id}
            className={`${pastelColors[index % pastelColors.length]} rounded-xl shadow-lg p-4 sm:p-6 transform hover:scale-105 transition duration-300 ease-in-out border border-neutral-200 flex items-center`}
          >
            {/* Columna Izquierda: Logo e Ícono de Estado */}
            <div className="flex-shrink-0 flex flex-col items-center mr-4">
              {campaign.logoUrl ? (
                <img
                  src={campaign.logoUrl}
                  alt={`Logo de ${campaign.campaignName}`}
                  className="h-16 w-16 sm:h-20 sm:w-20 object-contain rounded-full border-2 border-neutral-200"
                  onError={(e) => {
                    e.target.onerror = null
                    e.target.src = `https://placehold.co/80x80/E5E7EB/4B5563?text=Logo`
                  }}
                />
              ) : (
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-neutral-200 bg-neutral-200 flex items-center justify-center">
                  <CampaignIcon className="h-8 w-8 text-neutral-500" />
                </div>
              )}
              {/* Ajuste: Ícono de estado visible */}
              <div className="mt-2 text-xs font-semibold uppercase">
                <CheckCircleIcon isActive={campaign.status === 'activo'} />
              </div>
            </div>

            {/* Columna Derecha: Contenido y Acciones */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-xl font-semibold text-neutral-900 mb-1 leading-tight truncate">
                {campaign.campaignName}
              </h2>
              <div className="space-y-1 text-sm text-neutral-700 mb-3">
                <p className="truncate">
                  <span className="font-medium">Candidato:</span>{' '}
                  {campaign.candidateName}
                </p>
                <p className="truncate">
                  <span className="font-medium">Tipo:</span> {campaign.type}
                </p>
                {/* Puesto de forma predeterminada "Básico" ya que el backend aún no lo proporciona */}
                <p className="truncate">
                  <span className="font-medium">Plan:</span>{' '}
                  {campaign.planName || 'Básico'}
                </p>
                <p className="truncate">
                  <span className="font-medium">Estado:</span> {campaign.status}
                </p>
              </div>

              {/* Botones de Acción: Ajustados para mayor visibilidad y alineación */}
              <div className="flex flex-wrap items-center gap-2">
                {' '}
                {/* Usar flex-wrap para evitar desbordamiento en pantallas pequeñas */}
                <Link
                  href={`/dashboard-admin/campaigns/${campaign.id}`}
                  className="inline-flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md shadow-sm
               border border-blue-600 text-blue-600 /* Default: borde azul (visible), texto azul (visible) */
               hover:bg-blue-600 hover:text-white /* Hover: fondo azul, texto blanco */
               focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 whitespace-nowrap
               transition-colors duration-200"
                >
                  <span className="flex items-center">
                    Ver Detalles
                    <EditIcon className="ml-2" />
                  </span>
                </Link>
                <button
                  onClick={() =>
                    handleOpenConfirmModal(campaign.id, campaign.status)
                  } // Llama al nuevo manejador del modal
                  disabled={loading}
                  className={`px-3 py-2 text-sm font-medium rounded-md shadow-sm text-white whitespace-nowrap ${
                    // Añadido whitespace-nowrap
                    campaign.status === 'activo'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-green-600 hover:bg-green-700'
                  } focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                    campaign.status === 'activo'
                      ? 'focus:ring-red-500'
                      : 'focus:ring-green-500'
                  } disabled:opacity-50`}
                >
                  {campaign.status === 'activo' ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
