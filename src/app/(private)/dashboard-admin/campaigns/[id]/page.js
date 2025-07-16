'use client' // Este componente necesita ser un Client Component por el uso de hooks y manejo de estado

import React, { useState, useEffect, useCallback, use } from 'react'
import { useAuth } from '@/context/AuthContext'
import CampaignDetailDisplay from '@/components/admin/campaigns/CampaignDetailDisplay'
import Alert from '@/components/ui/Alert' // Para mostrar mensajes de éxito/error
import ConfirmModal from '@/components/ui/ConfirmModal' // Para el modal de confirmación

export default function CampaignDetailPage({ params }) {
  const resolvedParams = use(params) // Resuelve la Promise 'params' usando el hook 'use'
  const { id } = resolvedParams // Accede al 'id' del objeto resuelto

  const { user, idToken, isLoading: authLoading } = useAuth() // Acceso al contexto de autenticación

  const [campaign, setCampaign] = useState(null)
  const [loading, setLoading] = useState(true) // Para la carga inicial de la campaña
  const [actionLoading, setActionLoading] = useState(false) // Para acciones como guardar nombre o cambiar estado
  const [error, setError] = useState(null)

  // Estados para la edición del nombre de la campaña
  const [isEditingName, setIsEditingName] = useState(false)
  const [editedCampaignName, setEditedCampaignName] = useState('')

  // Estado para el modal de confirmación (para activar/desactivar)
  const [showConfirmToggleModal, setShowConfirmToggleModal] = useState(false)
  const [campaignToToggleStatus, setCampaignToToggleStatus] = useState(null) // { id, currentStatus }

  // Estado para la alerta personalizada
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' })

  // URLs de las funciones de Firebase (del .env.local)
  const GET_CAMPAIGN_BY_ID_URL = process.env.NEXT_PUBLIC_GET_CAMPAIGN_BY_ID_URL
  const UPDATE_CAMPAIGN_URL = process.env.NEXT_PUBLIC_UPDATE_CAMPAIGN_URL // Esta es la ruta genérica de update

  // Función para obtener los detalles de la campaña
  const fetchCampaign = useCallback(async () => {
    // Esperar a que la autenticación termine y el token esté disponible
    if (authLoading) return

    if (!user || user.role !== 'admin' || !idToken) {
      setLoading(false)
      setError(
        'Acceso denegado: No eres un administrador o no hay token de autenticación.',
      )
      return
    }

    setLoading(true)
    setError(null)
    try {
      if (!GET_CAMPAIGN_BY_ID_URL)
        throw new Error('URL para obtener campaña no configurada.')
      if (!id) throw new Error('ID de campaña no proporcionado.')

      const response = await fetch(`${GET_CAMPAIGN_BY_ID_URL}?id=${id}`, {
        headers: {
          Authorization: `Bearer ${idToken}`, // Usar el idToken para la autenticación
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(
          errData.message || 'Error al cargar los detalles de la campaña.',
        )
      }

      const data = await response.json()
      setCampaign(data)
      setEditedCampaignName(data.campaignName) // Inicializa el campo editable con el nombre actual
    } catch (err) {
      setError(err.message)
      console.error('Error al obtener detalles de la campaña:', err)
    } finally {
      setLoading(false)
    }
  }, [id, idToken, authLoading, user, GET_CAMPAIGN_BY_ID_URL])

  // Ejecuta la obtención de datos al cargar el componente o cuando cambian las dependencias
  useEffect(() => {
    fetchCampaign()
  }, [fetchCampaign])

  // Manejador para iniciar la edición del nombre de la campaña
  const handleEditCampaignName = () => {
    setIsEditingName(true)
  }

  // Manejador para guardar el nombre de la campaña editado
  const handleSaveCampaignName = async () => {
    setActionLoading(true) // Usar actionLoading para esta acción
    setError(null)
    try {
      if (!UPDATE_CAMPAIGN_URL)
        throw new Error('URL para actualizar campaña no configurada.')
      if (!idToken) throw new Error('No hay token de autenticación.')
      if (!editedCampaignName.trim())
        throw new Error('El nombre de la campaña no puede estar vacío.')

      const response = await fetch(UPDATE_CAMPAIGN_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: id,
          updates: {
            campaignName: editedCampaignName,
          },
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(
          errData.message || 'Error al actualizar el nombre de la campaña.',
        )
      }

      // Actualizar el estado local de la campaña con el nuevo nombre y recargar para consistencia
      setCampaign((prev) => ({ ...prev, campaignName: editedCampaignName }))
      setAlert({
        show: true,
        message: 'Nombre de campaña actualizado con éxito.',
        type: 'success',
      })
      setIsEditingName(false) // Salir del modo de edición
      fetchCampaign() // Recargar todos los datos para asegurar consistencia
    } catch (err) {
      setAlert({
        show: true,
        message: `Error al guardar: ${err.message}`,
        type: 'error',
      })
      console.error('Error al guardar el nombre de la campaña:', err)
    } finally {
      setActionLoading(false)
    }
  }

  // Manejador para cancelar la edición
  const handleCancelEdit = () => {
    setEditedCampaignName(campaign.campaignName) // Revertir al nombre original
    setIsEditingName(false)
  }

  // Manejador para abrir el modal de confirmación de cambio de estado
  const handleOpenConfirmToggleStatus = (currentStatus) => {
    setCampaignToToggleStatus({ id: campaign.id, currentStatus })
    setShowConfirmToggleModal(true)
  }

  // Manejador para confirmar el cambio de estado
  const handleConfirmToggleStatus = async () => {
    if (!campaignToToggleStatus) return

    const { id: campaignIdToUpdate, currentStatus } = campaignToToggleStatus
    setShowConfirmToggleModal(false) // Cerrar modal inmediatamente
    setActionLoading(true)

    try {
      if (!UPDATE_CAMPAIGN_URL)
        throw new Error('URL para actualizar estado de campaña no configurada.')
      if (!idToken) throw new Error('No hay token de autenticación.')

      const newStatus = currentStatus === 'activo' ? 'inactivo' : 'activo'

      const response = await fetch(UPDATE_CAMPAIGN_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          campaignId: campaignIdToUpdate,
          updates: { status: newStatus },
        }),
      })

      if (!response.ok) {
        const errData = await response.json()
        throw new Error(
          errData.message || 'Error al actualizar el estado de la campaña.',
        )
      }

      setAlert({
        show: true,
        message: `Estado de la campaña actualizado a '${newStatus}' exitosamente.`,
        type: 'success',
      })
      fetchCampaign() // Recargar todos los datos de la campaña para reflejar el cambio
    } catch (err) {
      setAlert({
        show: true,
        message: `Error al cambiar estado: ${err.message}`,
        type: 'error',
      })
      console.error('Error al cambiar estado de campaña:', err)
    } finally {
      setActionLoading(false)
      setCampaignToToggleStatus(null) // Limpiar estado del modal
    }
  }

  // Manejador para cancelar el cambio de estado
  const handleCancelToggleStatus = () => {
    setShowConfirmToggleModal(false)
    setCampaignToToggleStatus(null)
  }

  // Manejador para cerrar la alerta
  const handleAlertClose = useCallback(() => {
    setAlert({ ...alert, show: false })
  }, [alert])

  // Renderizado de estados: Carga inicial de la página
  if (loading || authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 text-neutral-600">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>{' '}
        {/* Usando blue-600 */}
        <p className="ml-4 text-blue-700">
          Cargando detalles de la campaña...
        </p>{' '}
        {/* Usando blue-700 */}
      </div>
    )
  }

  // Renderizado de estados: Error de carga inicial
  if (error) {
    return (
      <div className="p-6 bg-neutral-100 min-h-screen flex items-center justify-center">
        <Alert message={error} type="error" onClose={handleAlertClose} />
      </div>
    )
  }

  // Renderizado si no se encontró la campaña (después de la carga y sin errores específicos)
  if (!campaign) {
    return (
      <div className="p-6 bg-neutral-100 min-h-screen flex items-center justify-center">
        <p className="text-neutral-600">
          No se encontraron datos de la campaña para el ID proporcionado.
        </p>
      </div>
    )
  }

  // Renderizado principal de la página
  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-neutral-100 min-h-screen relative">
      {/* Componente de alerta */}
      {alert.show && (
        <div className="fixed top-4 right-4 z-50">
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={handleAlertClose}
          />
        </div>
      )}

      {/* Modal de Confirmación para Activar/Desactivar */}
      {showConfirmToggleModal && campaignToToggleStatus && (
        <ConfirmModal
          title="Confirmar Cambio de Estado"
          message={`¿Estás seguro de cambiar el estado de la campaña a '${campaignToToggleStatus.currentStatus === 'activo' ? 'inactivo' : 'activo'}'? Esta acción afectará su visibilidad.`}
          onConfirm={handleConfirmToggleStatus}
          onCancel={handleCancelToggleStatus}
        />
      )}

      {/* UI para editar el nombre de la campaña (solo si está en modo edición) */}
      {isEditingName ? (
        <div className="bg-white p-6 rounded-lg shadow-md mb-6 flex flex-col sm:flex-row items-center gap-4 max-w-4xl mx-auto">
          <input
            type="text"
            value={editedCampaignName}
            onChange={(e) => setEditedCampaignName(e.target.value)}
            className="flex-1 w-full sm:w-auto px-3 py-2 border border-neutral-300 rounded-md focus:ring-primary-DEFAULT focus:border-primary-DEFAULT text-neutral-800"
            placeholder="Nuevo nombre de la Campaña"
          />
          <div className="flex gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={handleSaveCampaignName}
              disabled={actionLoading} // Deshabilitar si se está guardando
              className="px-4 py-2 bg-primary-DEFAULT text-white rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
            >
              {actionLoading ? 'Guardando...' : 'Guardar'}
            </button>
            <button
              onClick={handleCancelEdit}
              disabled={actionLoading}
              className="px-4 py-2 bg-neutral-200 text-neutral-800 rounded-md hover:bg-neutral-300 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : null}

      {/* Componente de visualización de los detalles de la campaña */}
      {/* Pasamos 'campaign' completo, que ahora incluye planName, planPrice, discountPercentage y candidateProfile */}
      <CampaignDetailDisplay
        campaign={campaign}
        isAdminEditable={true} // Se activa la edición ya que estamos en el dashboard de administrador
        onEditCampaignName={handleEditCampaignName} // Pasa el handler para iniciar la edición
        onToggleCampaignStatus={handleOpenConfirmToggleStatus} // Pasa el handler para cambiar estado
        actionLoading={actionLoading} // Pasa el estado de carga para los botones de acción
      />

      {/* Placeholder para la card del Candidato (ahora será parte de CampaignDetailDisplay) */}
      {/* Este div ya no es necesario aquí, la card del candidato se renderizará dentro de CampaignDetailDisplay */}
      {/* <div className="mt-8 max-w-4xl mx-auto">
                <h2 className="text-2xl font-bold text-neutral-800 mb-4">Información del Candidato</h2>
                <div className="bg-white p-6 rounded-lg shadow-lg border border-neutral-200 text-neutral-600">
                    <p className="mb-4">Aquí se mostrará la información del candidato asociado a esta campaña. Esta será una card reutilizable que crearemos más adelante con un botón "Ver Detalles" para el perfil completo del candidato.</p>
                    <button className="px-6 py-2 bg-secondary-DEFAULT text-white rounded-md hover:bg-secondary-dark transition-colors shadow-md">
                        Ver Detalles del Candidato
                    </button>
                </div>
            </div> */}
    </div>
  )
}
