// src/app/dashboard-admin/variables/page.js
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

// Importar los nuevos componentes de sección
import PromoBonusSection from '@/components/admin/variables/PromoBonusSection'
import CampaignTypesSection from '@/components/admin/variables/CampaignTypesSection'
import PricingPlansSection from '@/components/admin/variables/PricingPlansSection'
import ContactInfoSection from '@/components/admin/variables/ContactInfoSection'

// Importar los componentes de UI de alerta y modal
import Alert from '@/components/ui/Alert'
import ConfirmModal from '@/components/ui/ConfirmModal'

export default function VariablesPage() {
  const { user, isLoading: authLoading, idToken } = useAuth()

  // Estados para almacenar los datos de las variables
  const [campaignTypes, setCampaignTypes] = useState(null)
  const [pricingPlans, setPricingPlans] = useState(null)
  const [contactInfo, setContactInfo] = useState(null)
  const [promoBonus, setPromoBonus] = useState(null)

  const [loadingData, setLoadingData] = useState(true) // Estado de carga para los datos iniciales
  const [activeTab, setActiveTab] = useState('promoBonus') // Estado para la pestaña activa

  // --- Estados y funciones para la Alerta Personalizada ---
  const [showAlert, setShowAlert] = useState(false)
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState('success') // 'success', 'error', 'warning', 'info'

  const triggerAlert = useCallback((message, type) => {
    setAlertMessage(message)
    setAlertType(type)
    setShowAlert(true)
    // La alerta se ocultará automáticamente por el componente Alert
  }, [])

  // --- Estados y funciones para el Modal de Confirmación Global ---
  const [showGlobalConfirmModal, setShowGlobalConfirmModal] = useState(false)
  const [globalConfirmMessage, setGlobalConfirmMessage] = useState('')
  const [globalConfirmAction, setGlobalConfirmAction] = useState(null) // Función a ejecutar si se confirma
  const [globalConfirmTitle, setGlobalConfirmTitle] =
    useState('Confirmar Acción')

  const handleOpenGlobalConfirm = useCallback(
    (message, action, title = 'Confirmar Acción') => {
      setGlobalConfirmMessage(message)
      setGlobalConfirmAction(() => action) // Guardar la función en un callback
      setGlobalConfirmTitle(title)
      setShowGlobalConfirmModal(true)
    },
    [],
  )

  const handleGlobalConfirm = useCallback(() => {
    if (globalConfirmAction) {
      globalConfirmAction()
    }
    setShowGlobalConfirmModal(false)
    setGlobalConfirmAction(null)
  }, [globalConfirmAction])

  const handleGlobalCancel = useCallback(() => {
    setShowGlobalConfirmModal(false)
    setGlobalConfirmAction(null)
  }, [])

  // --- Función para obtener el ID Token del usuario actual ---
  const getIdToken = useCallback(async () => {
    if (!idToken) {
      console.error('ID Token no disponible en el contexto.')
    }
    return idToken
  }, [idToken])

  // --- Función genérica para hacer llamadas POST a las funciones protegidas ---
  const callProtectedFunction = useCallback(
    async (functionName, data) => {
      const token = await getIdToken()
      if (!token) {
        triggerAlert(
          'No autenticado. Por favor, inicia sesión de nuevo.',
          'error',
        )
        return { error: 'No authenticated' }
      }

      let functionUrl
      switch (functionName) {
        case 'updateSystemVariable':
          functionUrl = process.env.NEXT_PUBLIC_UPDATE_SYSTEM_VARIABLE_URL
          break
        case 'addCampaignType':
          functionUrl = process.env.NEXT_PUBLIC_ADD_CAMPAIGN_TYPE_URL
          break
        case 'updateCampaignType':
          functionUrl = process.env.NEXT_PUBLIC_UPDATE_CAMPAIGN_TYPE_URL
          break
        case 'deleteCampaignType':
          functionUrl = process.env.NEXT_PUBLIC_DELETE_CAMPAIGN_TYPE_URL
          break
        case 'addPricingPlan':
          functionUrl = process.env.NEXT_PUBLIC_ADD_PRICING_PLAN_URL
          break
        case 'updatePricingPlan':
          functionUrl = process.env.NEXT_PUBLIC_UPDATE_PRICING_PLAN_URL
          break
        case 'deletePricingPlan':
          functionUrl = process.env.NEXT_PUBLIC_DELETE_PRICING_PLAN_URL
          break
        default:
          triggerAlert('Error: Función no configurada en el frontend.', 'error')
          return { error: 'Función no configurada en el frontend.' }
      }

      if (!functionUrl) {
        triggerAlert(
          `Error de configuración: URL para ${functionName} no encontrada.`,
          'error',
        )
        return { error: 'URL de función no encontrada.' }
      }

      try {
        const response = await fetch(functionUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorText = await response.text()
          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch (e) {
            throw new Error(`Error ${response.status}: ${errorText || response.statusText}`)
          }
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }

        return await response.json()
      } catch (error) {
        triggerAlert(`Error al guardar: ${error.message}`, 'error')
        return { error: error.message }
      }
    },
    [getIdToken, triggerAlert],
  )

  // --- Carga inicial de todas las variables ---
  useEffect(() => {
    const fetchAllVariables = async () => {
      if (!user || authLoading || !idToken) {
        if (!user && !authLoading) {
          setLoadingData(false)
        }
        return
      }

      setLoadingData(true)
      try {
        const token = await getIdToken()
        if (!token) {
          throw new Error('No se pudo obtener el token de autenticación.')
        }

        const response = await fetch(
          process.env.NEXT_PUBLIC_GET_SYSTEM_VARIABLES_URL,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        )

        if (!response.ok) {
          const errorText = await response.text()
          let errorData
          try {
            errorData = JSON.parse(errorText)
          } catch (e) {
            throw new Error(`Error ${response.status}: ${errorText || response.statusText}`)
          }
          throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        setCampaignTypes(data.campaign_types?.types || [])
        setPricingPlans(data.pricing_plans?.plans || [])
        setContactInfo(data.contact_info || {})
        setPromoBonus(data.promo_bonus || {
          title: '',
          description: '',
          discountPercentage: 0,
          appliesTo: '',
          startDate: '',
          endDate: '',
          isActive: false,
          ctaText: '',
          ctaLink: '',
          imageUrl: '',
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        })
      } catch (error) {
        triggerAlert(`Error al cargar datos: ${error.message}`, 'error')
        setCampaignTypes([])
        setPricingPlans([])
        setContactInfo({})
        setPromoBonus({
          title: '',
          description: '',
          discountPercentage: 0,
          appliesTo: '',
          startDate: '',
          endDate: '',
          isActive: false,
          ctaText: '',
          ctaLink: '',
          imageUrl: '',
          backgroundColor: '#FFFFFF',
          textColor: '#000000',
        })
      } finally {
        setLoadingData(false)
      }
    }

    if (user && user.role === 'admin') {
      fetchAllVariables()
    }
  }, [user, authLoading, getIdToken, idToken, triggerAlert])

  // --- Manejadores de eventos (pasados a los componentes de sección) ---

  // Tipos de Campaña
  const handleSaveCampaignType = useCallback(
    async (updatedItem) => {
      const result = await callProtectedFunction('updateCampaignType', {
        id: updatedItem.id,
        updates: updatedItem,
      })
      if (!result.error) {
        setCampaignTypes((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
        )
        triggerAlert('Tipo de campaña actualizado exitosamente.', 'success')
      }
    },
    [callProtectedFunction, triggerAlert],
  )

  const handleToggleCampaignTypeActive = useCallback(
    async (id, newStatus) => {
      const result = await callProtectedFunction('updateCampaignType', {
        id: id,
        updates: { active: newStatus },
      })
      if (!result.error) {
        setCampaignTypes((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, active: newStatus } : item,
          ),
        )
        triggerAlert('Estado de tipo de campaña actualizado.', 'success')
      }
    },
    [callProtectedFunction, triggerAlert],
  )

  const handleDeleteCampaignType = useCallback(
    async (id) => {
      handleOpenGlobalConfirm(
        '¿Estás seguro de que quieres eliminar este tipo de campaña? Esta acción es irreversible.',
        async () => {
          const result = await callProtectedFunction('deleteCampaignType', {
            id: id,
          })
          if (!result.error) {
            setCampaignTypes((prev) => prev.filter((item) => item.id !== id))
            triggerAlert('Tipo de campaña eliminado exitosamente.', 'success')
          }
        },
        'Confirmar Eliminación',
      )
    },
    [callProtectedFunction, triggerAlert, handleOpenGlobalConfirm],
  )

  const handleAddCampaignType = useCallback(
    async (newItem) => {
      const result = await callProtectedFunction('addCampaignType', newItem)
      if (!result.error) {
        setCampaignTypes((prev) => [...prev, newItem])
        triggerAlert('Nuevo tipo de campaña añadido exitosamente.', 'success')
      }
    },
    [callProtectedFunction, triggerAlert],
  )

  // Planes de Precios
  const handleSavePricingPlan = useCallback(
    async (updatedItem) => {
      const result = await callProtectedFunction('updatePricingPlan', {
        id: updatedItem.id,
        updates: updatedItem,
      })
      if (!result.error) {
        setPricingPlans((prev) =>
          prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
        )
        triggerAlert('Plan de precios actualizado exitosamente.', 'success')
      }
    },
    [callProtectedFunction, triggerAlert],
  )

  const handleDeletePricingPlan = useCallback(
    async (id) => {
      handleOpenGlobalConfirm(
        '¿Estás seguro de que quieres eliminar este plan de precios? Esta acción es irreversible.',
        async () => {
          const result = await callProtectedFunction('deletePricingPlan', {
            id: id,
          })
          if (!result.error) {
            setPricingPlans((prev) => prev.filter((item) => item.id !== id))
            triggerAlert('Plan de precios eliminado exitosamente.', 'success')
          }
        },
        'Confirmar Eliminación',
      )
    },
    [callProtectedFunction, triggerAlert, handleOpenGlobalConfirm],
  )

  const handleAddPricingPlan = useCallback(
    async (newItem) => {
      const result = await callProtectedFunction('addPricingPlan', newItem)
      if (!result.error) {
        setPricingPlans((prev) => [...prev, newItem])
        triggerAlert('Nuevo plan de precios añadido exitosamente.', 'success')
      }
    },
    [callProtectedFunction, triggerAlert],
  )

  // Información de Contacto
  const handleSaveContactInfo = useCallback(
    async (updatedContactInfo) => {
      const result = await callProtectedFunction('updateSystemVariable', {
        variableName: 'contact_info',
        data: updatedContactInfo,
      })
      if (!result.error) {
        setContactInfo(updatedContactInfo)
        triggerAlert(
          'Información de contacto guardada exitosamente.',
          'success',
        )
      }
    },
    [callProtectedFunction, triggerAlert],
  )

  // Bono Promocional
  const handleSavePromoBonus = useCallback(
    async (updatedPromoBonus) => {
      const result = await callProtectedFunction('updateSystemVariable', {
        variableName: 'promo_bonus',
        data: updatedPromoBonus,
      })
      if (!result.error) {
        setPromoBonus(updatedPromoBonus)
        triggerAlert('Bono promocional guardado exitosamente.', 'success')
      }
    },
    [callProtectedFunction, triggerAlert],
  )

  const handleToggleBonusActive = useCallback(
    async (currentPromoBonus) => {
      const updatedStatus = !currentPromoBonus.isActive
      const result = await callProtectedFunction('updateSystemVariable', {
        variableName: 'promo_bonus',
        data: { ...currentPromoBonus, isActive: updatedStatus },
      })
      if (!result.error) {
        setPromoBonus((prev) => ({ ...prev, isActive: updatedStatus }))
        triggerAlert(
          `Bono promocional ${updatedStatus ? 'activado' : 'desactivado'} exitosamente.`,
          'success',
        )
      }
    },
    [callProtectedFunction, triggerAlert],
  )

  if (authLoading || loadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-50 text-neutral-600">
        <p>Cargando variables del sistema...</p>
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

  return (
    <div className="p-2 sm:p-4 lg:p-8 bg-neutral-50 min-h-screen relative">
      <h1 className="text-xl sm:text-3xl font-bold text-neutral-800 mb-4 sm:mb-6">
        Variables del Sistema
      </h1>

      {/* Alerta Personalizada Global - Centrada */}
      {showAlert && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
          {' '}
          {/* Centrado */}
          <Alert
            message={alertMessage}
            type={alertType}
            onClose={() => setShowAlert(false)}
          />
        </div>
      )}

      {/* Modal de Confirmación Global */}
      {showGlobalConfirmModal && (
        <ConfirmModal
          title={globalConfirmTitle}
          message={globalConfirmMessage}
          onConfirm={handleGlobalConfirm}
          onCancel={handleGlobalCancel}
        />
      )}

      {/* Navegación por pestañas */}
      <div className="mb-6 border-b border-neutral-200">
        <nav className="-mb-px flex space-x-4 sm:space-x-8" aria-label="Tabs">
          <button
            onClick={() => setActiveTab('promoBonus')}
            className={`${activeTab === 'promoBonus' ? 'border-primary text-primary' : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
          >
            Bono Promocional
          </button>
          <button
            onClick={() => setActiveTab('campaignTypes')}
            className={`${activeTab === 'campaignTypes' ? 'border-primary text-primary' : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
          >
            Tipos de Campaña
          </button>
          <button
            onClick={() => setActiveTab('pricingPlans')}
            className={`${activeTab === 'pricingPlans' ? 'border-primary text-primary' : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
          >
            Planes de Precios
          </button>
          <button
            onClick={() => setActiveTab('contactInfo')}
            className={`${activeTab === 'contactInfo' ? 'border-primary text-primary' : 'border-transparent text-neutral-600 hover:text-neutral-800 hover:border-neutral-300'} whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
          >
            Información de Contacto
          </button>
        </nav>
      </div>

      {/* Contenido de las pestañas */}
      <div className="mt-6">
        {activeTab === 'promoBonus' && promoBonus && (
          <PromoBonusSection
            promoBonus={promoBonus}
            onSavePromoBonus={handleSavePromoBonus}
            onToggleBonusActive={() => handleToggleBonusActive(promoBonus)}
            setPromoBonus={setPromoBonus}
            triggerAlert={triggerAlert}
          />
        )}

        {activeTab === 'campaignTypes' && campaignTypes && (
          <CampaignTypesSection
            campaignTypes={campaignTypes}
            onSaveCampaignType={handleSaveCampaignType}
            onToggleCampaignTypeActive={handleToggleCampaignTypeActive}
            onDeleteCampaignType={handleDeleteCampaignType}
            onAddCampaignType={handleAddCampaignType}
            triggerAlert={triggerAlert}
          />
        )}

        {activeTab === 'pricingPlans' && pricingPlans && campaignTypes && (
          <PricingPlansSection
            pricingPlans={pricingPlans}
            campaignTypesList={campaignTypes}
            onSavePricingPlan={handleSavePricingPlan}
            onDeletePricingPlan={handleDeletePricingPlan}
            onAddPricingPlan={handleAddPricingPlan}
            triggerAlert={triggerAlert}
          />
        )}

        {activeTab === 'contactInfo' && contactInfo && (
          <ContactInfoSection
            contactInfo={contactInfo}
            onSaveContactInfo={handleSaveContactInfo}
            setContactInfo={setContactInfo}
            triggerAlert={triggerAlert}
          />
        )}
      </div>
    </div>
  )
}