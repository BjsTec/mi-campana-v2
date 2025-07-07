// src/app/dashboard-admin/variables/page.js
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext' // Importamos useAuth

// Iconos de Heroicons
import {
  PlusCircleIcon,
  PencilIcon,
  EyeIcon,
  EyeSlashIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

// --- URL Base de las Funciones de Firebase (desde .env.local) ---
const VARIABLES_BASE_URL = process.env.NEXT_PUBLIC_VARIABLES_BASE_URL

// --- Componente de Fila Editable de Tabla (para Desktop/Tablet) ---
const EditableTableRow = ({
  item,
  fields,
  onSave,
  onToggleActive,
  onDelete,
  campaignTypesList,
}) => {
  // Añadir campaignTypesList
  const [isEditing, setIsEditing] = useState(false)
  const [editedItem, setEditedItem] = useState(item)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditedItem((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = () => {
    onSave(editedItem)
    setIsEditing(false)
  }

  return (
    <tr className="hover:bg-neutral-50 transition-colors duration-150">
      {fields.map((field) => (
        <td
          key={field.key}
          className="px-3 py-3 whitespace-nowrap text-sm text-neutral-600"
        >
          {isEditing && field.editable ? (
            field.type === 'checkbox' ? (
              <input
                type="checkbox"
                name={field.key}
                checked={editedItem[field.key]}
                onChange={handleChange}
                className="form-checkbox h-4 w-4 text-primary rounded"
              />
            ) : field.type === 'textarea' ? (
              <textarea
                name={field.key}
                value={editedItem[field.key]}
                onChange={handleChange}
                className="w-full border border-neutral-300 rounded-md shadow-sm p-1 text-neutral-800 focus:outline-none focus:ring-primary focus:border-primary"
                rows="2"
              />
            ) : field.key === 'typeId' && campaignTypesList ? ( // Selector para typeId en Planes de Precios
              <select
                name={field.key}
                value={editedItem[field.key]}
                onChange={handleChange}
                className="w-full border border-neutral-300 rounded-md shadow-sm p-1 text-neutral-800 focus:outline-none focus:ring-primary focus:border-primary"
              >
                {campaignTypesList.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || 'text'}
                name={field.key}
                value={editedItem[field.key]}
                onChange={handleChange}
                className="w-full border border-neutral-300 rounded-md shadow-sm p-1 text-neutral-800 focus:outline-none focus:ring-primary focus:border-primary"
              />
            )
          ) : field.format ? (
            field.format(item[field.key])
          ) : (
            item[field.key]?.toString() || ''
          )}
        </td>
      ))}
      <td className="px-3 py-3 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex items-center justify-end space-x-2">
          {isEditing ? (
            <>
              <button
                onClick={handleSave}
                className="text-success hover:text-success-dark transition-colors duration-150 p-1 rounded-full hover:bg-green-100"
                title="Guardar Cambios"
              >
                <CheckCircleIcon className="h-6 w-6" />
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-error hover:text-error-dark transition-colors duration-150 p-1 rounded-full hover:bg-red-100"
                title="Cancelar Edición"
              >
                <XCircleIcon className="h-6 w-6" />
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="text-primary hover:text-primary-dark transition-colors duration-150 p-1 rounded-full hover:bg-primary-light"
                title="Editar"
              >
                <PencilIcon className="h-6 w-6" />
              </button>
              {onToggleActive && (
                <button
                  onClick={() => onToggleActive(item.id, !item.active)}
                  className={`p-1 rounded-full transition-colors duration-150 ${item.active ? 'text-success hover:text-success-dark hover:bg-green-100' : 'text-error hover:text-error-dark hover:bg-red-100'}`}
                  title={item.active ? 'Desactivar' : 'Activar'}
                >
                  {item.active ? (
                    <EyeIcon className="h-6 w-6" />
                  ) : (
                    <EyeSlashIcon className="h-6 w-6" />
                  )}
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => onDelete(item.id)}
                  className="text-neutral-600 hover:text-error transition-colors duration-150 p-1 rounded-full hover:bg-red-100"
                  title="Eliminar"
                >
                  <TrashIcon className="h-6 w-6" />
                </button>
              )}
            </>
          )}
        </div>
      </td>
    </tr>
  )
}

// --- Nuevo Componente para la Vista de Lista/Card en Móviles ---
const MobileEditableCard = ({
  item,
  fields,
  onSave,
  onToggleActive,
  onDelete,
  campaignTypesList,
}) => {
  // Añadir campaignTypesList
  const [isEditing, setIsEditing] = useState(false)
  const [editedItem, setEditedItem] = useState(item)
  const [showDetails, setShowDetails] = useState(false)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setEditedItem((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

  const handleSave = () => {
    onSave(editedItem)
    setIsEditing(false)
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 mb-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-neutral-800 break-words pr-2">
          {item.name || item.title || item.id}
        </h3>
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="p-1 rounded-full text-neutral-600 hover:bg-neutral-100"
          title={showDetails ? 'Ocultar detalles' : 'Mostrar detalles'}
        >
          <InformationCircleIcon className="h-5 w-5" />
        </button>
      </div>

      {showDetails && (
        <div className="border-t border-neutral-100 pt-2 mt-2">
          {fields.map((field) => {
            if (
              field.key === 'id' ||
              field.key === 'name' ||
              field.key === 'title'
            )
              return null

            return (
              <div key={field.key} className="mb-1 text-xs text-neutral-600">
                <span className="font-medium text-neutral-700 mr-1">
                  {field.label}:
                </span>
                {isEditing && field.editable ? (
                  field.type === 'checkbox' ? (
                    <input
                      type="checkbox"
                      name={field.key}
                      checked={editedItem[field.key]}
                      onChange={handleChange}
                      className="form-checkbox h-4 w-4 text-primary rounded"
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea
                      name={field.key}
                      value={editedItem[field.key]}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-md shadow-sm p-1 text-neutral-800 focus:outline-none focus:ring-primary focus:border-primary text-xs"
                      rows="2"
                    />
                  ) : field.key === 'typeId' && campaignTypesList ? ( // Selector para typeId en Planes de Precios en móvil
                    <select
                      name={field.key}
                      value={editedItem[field.key]}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-md shadow-sm p-1 text-neutral-800 focus:outline-none focus:ring-primary focus:border-primary text-xs"
                    >
                      {campaignTypesList.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={field.type || 'text'}
                      name={field.key}
                      value={editedItem[field.key]}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-md shadow-sm p-1 text-neutral-800 focus:outline-none focus:ring-primary focus:border-primary text-xs"
                    />
                  )
                ) : field.format ? (
                  field.format(item[field.key])
                ) : (
                  item[field.key]?.toString() || ''
                )}
              </div>
            )
          })}
        </div>
      )}

      <div
        className={`mt-3 pt-3 border-t border-neutral-100 flex ${isEditing ? 'justify-around' : 'justify-end'} items-center space-x-2`}
      >
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="flex-1 text-success hover:text-success-dark transition-colors duration-150 p-1 rounded-md hover:bg-green-100 flex items-center justify-center"
              title="Guardar Cambios"
            >
              <CheckCircleIcon className="h-5 w-5 mr-1" />{' '}
              <span className="hidden sm:inline">Guardar</span>
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex-1 text-error hover:text-error-dark transition-colors duration-150 p-1 rounded-md hover:bg-red-100 flex items-center justify-center"
              title="Cancelar Edición"
            >
              <XCircleIcon className="h-5 w-5 mr-1" />{' '}
              <span className="hidden sm:inline">Cancelar</span>
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="text-primary hover:text-primary-dark transition-colors duration-150 p-1 rounded-full hover:bg-primary-light"
              title="Editar"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
            {onToggleActive && (
              <button
                onClick={() => onToggleActive(item.id, !item.active)}
                className={`p-1 rounded-full transition-colors duration-150 ${item.active ? 'text-success hover:text-success-dark hover:bg-green-100' : 'text-error hover:text-error-dark hover:bg-red-100'}`}
                title={item.active ? 'Desactivar' : 'Activar'}
              >
                {item.active ? (
                  <EyeIcon className="h-5 w-5" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5" />
                )}
              </button>
            )}
            {onDelete && (
              <button
                onClick={() => onDelete(item.id)}
                className="text-neutral-600 hover:text-error transition-colors duration-150 p-1 rounded-full hover:bg-red-100"
                title="Eliminar"
              >
                <TrashIcon className="h-5 w-5" />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default function VariablesPage() {
  const { user, isLoading: authLoading, idToken } = useAuth()
  // Inicializar con null para indicar que los datos aún no se han cargado
  const [campaignTypes, setCampaignTypes] = useState(null)
  const [pricingPlans, setPricingPlans] = useState(null)
  const [contactInfo, setContactInfo] = useState(null)
  const [promoBonus, setPromoBonus] = useState(null)

  const [loadingData, setLoadingData] = useState(true) // Estado de carga para los datos de las variables

  const [newCampaignTypeName, setNewCampaignTypeName] = useState('')
  const [newCampaignTypeDescription, setNewCampaignTypeDescription] =
    useState('')

  const [newPricePlan, setNewPricePlan] = useState({
    typeId: '',
    name: '',
    price: '',
    description: '',
  })

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
      const idToken = await getIdToken()
      if (!idToken) {
        alert('No autenticado. Por favor, inicia sesión de nuevo.')
        return { error: 'No authenticated' }
      }

      try {
        const response = await fetch(`${VARIABLES_BASE_URL}${functionName}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${idToken}`,
          },
          body: JSON.stringify(data),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message ||
              `Error ${response.status}: ${response.statusText}`,
          )
        }

        return await response.json()
      } catch (error) {
        console.error(`Error calling ${functionName}:`, error)
        alert(`Error al guardar: ${error.message}`)
        return { error: error.message }
      }
    },
    [getIdToken],
  )

  // --- Carga inicial de todas las variables ---
  useEffect(() => {
    const fetchAllVariables = async () => {
      if (!user || authLoading) return // Esperar a que el usuario esté cargado y autenticado

      setLoadingData(true)
      try {
        const idToken = await getIdToken()
        if (!idToken) {
          throw new Error('No se pudo obtener el token de autenticación.')
        }

        const response = await fetch(
          `${VARIABLES_BASE_URL}getSystemVariables`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          },
        )

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(
            errorData.message ||
              `Error ${response.status}: ${response.statusText}`,
          )
        }

        const data = await response.json()
        setCampaignTypes(data.campaign_types?.types || [])
        setPricingPlans(data.pricing_plans?.plans || [])
        setContactInfo(data.contact_info || {})
        setPromoBonus(
          data.promo_bonus || {
            id: 'default_promo_bonus',
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
          },
        )
      } catch (error) {
        console.error('Error al cargar todas las variables:', error)
        alert(`Error al cargar datos: ${error.message}`)
        // Si hay un error, puedes optar por mantener los datos en null o usar mocks de respaldo
        setCampaignTypes([])
        setPricingPlans([])
        setContactInfo({})
        setPromoBonus({
          id: 'default_promo_bonus',
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
      // Solo cargar si es admin
      fetchAllVariables()
    }
  }, [user, authLoading, getIdToken]) // Se dispara cuando user o authLoading cambian

  // --- Manejadores de eventos que llaman a las funciones de Firebase ---

  // Tipos de Campaña
  const handleSaveCampaignType = async (updatedItem) => {
    const result = await callProtectedFunction('updateCampaignType', {
      id: updatedItem.id,
      updates: updatedItem,
    })
    if (!result.error) {
      setCampaignTypes((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      )
      alert('Tipo de campaña actualizado exitosamente.')
    }
  }

  const handleToggleCampaignTypeActive = async (id, newStatus) => {
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
      alert('Estado de tipo de campaña actualizado.')
    }
  }

  const handleDeleteCampaignType = async (id) => {
    if (
      window.confirm(
        '¿Estás seguro de que quieres eliminar este tipo de campaña? Esta acción es irreversible.',
      )
    ) {
      const result = await callProtectedFunction('deleteCampaignType', {
        id: id,
      })
      if (!result.error) {
        setCampaignTypes((prev) => prev.filter((item) => item.id !== id))
        alert('Tipo de campaña eliminado exitosamente.')
      }
    }
  }

  const handleAddCampaignType = async () => {
    if (newCampaignTypeName.trim() && newCampaignTypeDescription.trim()) {
      const newId = newCampaignTypeName
        .toLowerCase()
        .replace(/\s/g, '_')
        .replace(/[^a-z0-9_]/g, '')
      const newItem = {
        id: newId,
        name: newCampaignTypeName.trim(),
        description: newCampaignTypeDescription.trim(),
        active: true,
      }
      const result = await callProtectedFunction('addCampaignType', newItem)
      if (!result.error) {
        setCampaignTypes((prev) => [...prev, newItem])
        setNewCampaignTypeName('')
        setNewCampaignTypeDescription('')
        alert('Nuevo tipo de campaña añadido exitosamente.')
      }
    } else {
      alert(
        'Por favor, completa el nombre y la descripción del tipo de campaña.',
      )
    }
  }

  // Planes de Precios
  const handleSavePricingPlan = async (updatedItem) => {
    const result = await callProtectedFunction('updatePricingPlan', {
      id: updatedItem.id,
      updates: updatedItem,
    })
    if (!result.error) {
      setPricingPlans((prev) =>
        prev.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
      )
      alert('Plan de precios actualizado exitosamente.')
    }
  }

  const handleDeletePricingPlan = async (id) => {
    if (
      window.confirm(
        '¿Estás seguro de que quieres eliminar este plan de precios? Esta acción es irreversible.',
      )
    ) {
      const result = await callProtectedFunction('deletePricingPlan', {
        id: id,
      })
      if (!result.error) {
        setPricingPlans((prev) => prev.filter((item) => item.id !== id))
        alert('Plan de precios eliminado exitosamente.')
      }
    }
  }

  const handleAddPricingPlan = async () => {
    if (
      newPricePlan.name.trim() &&
      newPricePlan.price !== '' &&
      newPricePlan.typeId
    ) {
      const newId = `plan_${newPricePlan.typeId}_${newPricePlan.name
        .toLowerCase()
        .replace(/\s/g, '_')
        .replace(/[^a-z0-9_]/g, '')}`
      const newItem = { ...newPricePlan, id: newId }
      const result = await callProtectedFunction('addPricingPlan', newItem)
      if (!result.error) {
        setPricingPlans((prev) => [...prev, newItem])
        setNewPricePlan({ typeId: '', name: '', price: '', description: '' })
        alert('Nuevo plan de precios añadido exitosamente.')
      }
    } else {
      alert(
        'Por favor, completa todos los campos del plan de precios: Tipo de Campaña, Nombre y Precio.',
      )
    }
  }

  // Información de Contacto
  const handleSaveContactInfo = async () => {
    const result = await callProtectedFunction('updateSystemVariable', {
      variableName: 'contact_info',
      data: contactInfo,
    })
    if (!result.error) {
      alert('Información de contacto guardada exitosamente.')
    }
  }

  // Bono Promocional
  const handleSavePromoBonus = async () => {
    const result = await callProtectedFunction('updateSystemVariable', {
      variableName: 'promo_bonus',
      data: promoBonus,
    })
    if (!result.error) {
      alert('Bono promocional guardado exitosamente.')
    }
  }

  const handleToggleBonusActive = async () => {
    const updatedStatus = !promoBonus.isActive
    const result = await callProtectedFunction('updateSystemVariable', {
      variableName: 'promo_bonus',
      data: { isActive: updatedStatus },
    })
    if (!result.error) {
      setPromoBonus((prev) => ({ ...prev, isActive: updatedStatus }))
      alert(
        `Bono promocional ${updatedStatus ? 'activado' : 'desactivado'} exitosamente.`,
      )
    }
  }

  const handleBonusChange = (e) => {
    const { name, value, type, checked } = e.target
    setPromoBonus((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }))
  }

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

  // Definición de los campos de la tabla de tipos de campaña
  const campaignTypeFields = [
    { label: 'ID', key: 'id', editable: false },
    { label: 'Nombre', key: 'name', editable: true, type: 'text' },
    {
      label: 'Descripción',
      key: 'description',
      editable: true,
      type: 'textarea',
    },
    {
      label: 'Activo',
      key: 'active',
      editable: true,
      type: 'checkbox',
      format: (val) => (val ? 'Sí' : 'No'),
    },
  ]

  // Definición de los campos de la tabla de planes de precios
  const pricingPlanFields = [
    { label: 'ID', key: 'id', editable: false },
    {
      label: 'Tipo Campaña',
      key: 'typeId',
      editable: true,
      type: 'select',
      format: (val) =>
        (campaignTypes ? campaignTypes.find((t) => t.id === val)?.name : val) ||
        val,
    }, // Ahora editable y usa select
    { label: 'Nombre Plan', key: 'name', editable: true, type: 'text' },
    { label: 'Precio', key: 'price', editable: true, type: 'number' },
    {
      label: 'Descripción',
      key: 'description',
      editable: true,
      type: 'textarea',
    },
  ]

  return (
    <div className="p-2 sm:p-4 lg:p-8 bg-neutral-50 min-h-screen">
      <h1 className="text-xl sm:text-3xl font-bold text-neutral-800 mb-4 sm:mb-6">
        Variables del Sistema
      </h1>

      {/* Sección de Bono/Descuento para la Home Principal */}
      <section className="bg-white p-3 sm:p-5 rounded-lg shadow-md mb-6 sm:mb-8 border border-neutral-200">
        <h2 className="text-lg sm:text-2xl font-semibold text-neutral-800 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
          <span>Bono/Descuento para Home Principal</span>
          <button
            onClick={handleToggleBonusActive}
            className={`mt-2 sm:mt-0 inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md shadow-sm ${promoBonus?.isActive ? 'text-white bg-success hover:bg-success-dark' : 'text-neutral-700 bg-neutral-200 hover:bg-neutral-300'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-success transition-colors duration-200`}
          >
            {promoBonus?.isActive ? (
              <>
                <EyeIcon className="-ml-0.5 mr-2 h-5 w-5" /> Activo
              </>
            ) : (
              <>
                <EyeSlashIcon className="-ml-0.5 mr-2 h-5 w-5" /> Inactivo
              </>
            )}
          </button>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div>
            <label
              htmlFor="bonusTitle"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              Título del Bono
            </label>
            <input
              type="text"
              id="bonusTitle"
              name="title"
              value={promoBonus?.title || ''}
              onChange={handleBonusChange}
              placeholder="Ej: ¡20% OFF en Plan Premium!"
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
            />
          </div>
          <div>
            <label
              htmlFor="bonusDiscountPercentage"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              Porcentaje de Descuento (%)
            </label>
            <input
              type="number"
              id="bonusDiscountPercentage"
              name="discountPercentage"
              value={promoBonus?.discountPercentage || 0}
              onChange={handleBonusChange}
              placeholder="Ej: 20"
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label
              htmlFor="bonusAppliesTo"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              Aplica a
            </label>
            <input
              type="text"
              id="bonusAppliesTo"
              name="appliesTo"
              value={promoBonus?.appliesTo || ''}
              onChange={handleBonusChange}
              placeholder="Ej: Planes Premium"
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-3">
            <label
              htmlFor="bonusDescription"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              Descripción Detallada
            </label>
            <textarea
              id="bonusDescription"
              name="description"
              value={promoBonus?.description || ''}
              onChange={handleBonusChange}
              placeholder="Ej: Válido para nuevas suscripciones hasta el 31/12/2025."
              rows="2"
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
            />
          </div>
          <div>
            <label
              htmlFor="bonusCtaText"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              Texto de Botón (CTA)
            </label>
            <input
              type="text"
              id="bonusCtaText"
              name="ctaText"
              value={promoBonus?.ctaText || ''}
              onChange={handleBonusChange}
              placeholder="Ej: ¡Compra Ya!"
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
            />
          </div>
          <div>
            <label
              htmlFor="bonusCtaLink"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              Enlace del Botón (CTA)
            </label>
            <input
              type="text"
              id="bonusCtaLink"
              name="ctaLink"
              value={promoBonus?.ctaLink || ''}
              onChange={handleBonusChange}
              placeholder="Ej: /planes-de-suscripcion"
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
            />
          </div>
          <div className="md:col-span-2 lg:col-span-1">
            <label
              htmlFor="bonusImageUrl"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              URL de Imagen (Opcional)
            </label>
            <input
              type="text"
              id="bonusImageUrl"
              name="imageUrl"
              value={promoBonus?.imageUrl || ''}
              onChange={handleBonusChange}
              placeholder="https://ejemplo.com/bono.jpg"
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
            />
          </div>
          <div>
            <label
              htmlFor="bonusStartDate"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              Fecha de Inicio
            </label>
            <input
              type="date"
              id="bonusStartDate"
              name="startDate"
              value={promoBonus?.startDate || ''}
              onChange={handleBonusChange}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
            />
          </div>
          <div>
            <label
              htmlFor="bonusEndDate"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              Fecha de Fin
            </label>
            <input
              type="date"
              id="bonusEndDate"
              name="endDate"
              value={promoBonus?.endDate || ''}
              onChange={handleBonusChange}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
            />
          </div>
          <div>
            <label
              htmlFor="bonusBackgroundColor"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              Color de Fondo (Opcional)
            </label>
            <input
              type="color"
              id="bonusBackgroundColor"
              name="backgroundColor"
              value={promoBonus?.backgroundColor || '#FFFFFF'}
              onChange={handleBonusChange}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm h-8 sm:h-10"
            />
          </div>
          <div>
            <label
              htmlFor="bonusTextColor"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              Color de Texto (Opcional)
            </label>
            <input
              type="color"
              id="bonusTextColor"
              name="textColor"
              value={promoBonus?.textColor || '#000000'}
              onChange={handleBonusChange}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm h-8 sm:h-10"
            />
          </div>
        </div>
        <button
          onClick={handleSavePromoBonus}
          className="mt-6 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
        >
          Guardar Cambios del Bono
        </button>
      </section>

      {/* Sección de Tipos de Campaña */}
      <section className="bg-white p-3 sm:p-5 rounded-lg shadow-md mb-6 sm:mb-8 border border-neutral-200">
        <h2 className="text-lg sm:text-2xl font-semibold text-neutral-800 mb-4">
          Tipos de Campaña (Organizaciones)
        </h2>
        {/* Ocultar tabla en móvil, mostrar en md en adelante */}
        <div className="hidden md:block overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-neutral-200 text-xs sm:text-sm">
            <thead className="bg-neutral-50">
              <tr>
                {campaignTypeFields.map((field) => (
                  <th
                    key={field.key}
                    scope="col"
                    className="px-2 py-1 sm:px-3 sm:py-2 text-left font-medium text-neutral-600 uppercase tracking-wider"
                  >
                    {field.label}
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-2 py-1 sm:px-3 sm:py-2 text-right font-medium text-neutral-600 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {campaignTypes.map((type) => (
                <EditableTableRow
                  key={type.id}
                  item={type}
                  fields={campaignTypeFields}
                  onSave={handleSaveCampaignType}
                  onToggleActive={handleToggleCampaignTypeActive}
                  onDelete={handleDeleteCampaignType}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mostrar lista de cards en móvil, ocultar en md en adelante */}
        <div className="md:hidden">
          {campaignTypes.map((type) => (
            <MobileEditableCard
              key={type.id}
              item={type}
              fields={campaignTypeFields}
              onSave={handleSaveCampaignType}
              onToggleActive={handleToggleCampaignTypeActive}
              onDelete={handleDeleteCampaignType}
            />
          ))}
        </div>

        {/* Formulario para añadir nuevo tipo de campaña */}
        <div className="border-t border-neutral-200 pt-4 sm:pt-6">
          <h3 className="text-md sm:text-lg font-semibold text-neutral-800 mb-3">
            Añadir Nuevo Tipo de Campaña
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <label
                htmlFor="newCampaignTypeName"
                className="block text-xs sm:text-sm font-medium text-neutral-700"
              >
                Nombre del Tipo
              </label>
              <input
                type="text"
                id="newCampaignTypeName"
                value={newCampaignTypeName}
                onChange={(e) => setNewCampaignTypeName(e.target.value)}
                placeholder="Ej: Campaña a Junta de Vecinos"
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
              />
            </div>
            <div>
              <label
                htmlFor="newCampaignTypeDescription"
                className="block text-xs sm:text-sm font-medium text-neutral-700"
              >
                Descripción
              </label>
              <textarea
                id="newCampaignTypeDescription"
                value={newCampaignTypeDescription}
                onChange={(e) => setNewCampaignTypeDescription(e.target.value)}
                placeholder="Breve descripción del tipo de campaña"
                rows="2"
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
              />
            </div>
          </div>
          <button
            onClick={handleAddCampaignType}
            className="mt-4 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Añadir Tipo de Campaña
          </button>
        </div>
      </section>

      {/* Sección de Planes de Precios */}
      <section className="bg-white p-3 sm:p-5 rounded-lg shadow-md mb-6 sm:mb-8 border border-neutral-200">
        <h2 className="text-lg sm:text-2xl font-semibold text-neutral-800 mb-4">
          Planes de Precios por Tipo de Campaña
        </h2>
        {/* Ocultar tabla en móvil, mostrar en md en adelante */}
        <div className="hidden md:block overflow-x-auto mb-6">
          <table className="min-w-full divide-y divide-neutral-200 text-xs sm:text-sm">
            <thead className="bg-neutral-50">
              <tr>
                {pricingPlanFields.map((field) => (
                  <th
                    key={field.key}
                    scope="col"
                    className="px-2 py-1 sm:px-3 sm:py-2 text-left font-medium text-neutral-600 uppercase tracking-wider"
                  >
                    {field.label}
                  </th>
                ))}
                <th
                  scope="col"
                  className="px-2 py-1 sm:px-3 sm:py-2 text-right font-medium text-neutral-600 uppercase tracking-wider"
                >
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-neutral-200">
              {pricingPlans.map((plan) => (
                <EditableTableRow
                  key={plan.id}
                  item={plan}
                  fields={pricingPlanFields}
                  onSave={handleSavePricingPlan}
                  onDelete={handleDeletePricingPlan}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Mostrar lista de cards en móvil, ocultar en md en adelante */}
        <div className="md:hidden">
          {pricingPlans.map((plan) => (
            <MobileEditableCard
              key={plan.id}
              item={plan}
              fields={pricingPlanFields}
              onSave={handleSavePricingPlan}
              onDelete={handleDeletePricingPlan}
            />
          ))}
        </div>

        {/* Formulario para añadir nuevo plan de precios */}
        <div className="border-t border-neutral-200 pt-4 sm:pt-6">
          <h3 className="text-md sm:text-lg font-semibold text-neutral-800 mb-3">
            Añadir Nuevo Plan de Precios
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <label
                htmlFor="newPricePlanTypeId"
                className="block text-xs sm:text-sm font-medium text-neutral-700"
              >
                Tipo de Campaña
              </label>
              <select
                id="newPricePlanTypeId"
                name="typeId"
                value={newPricePlan.typeId}
                onChange={(e) =>
                  setNewPricePlan((prev) => ({
                    ...prev,
                    typeId: e.target.value,
                  }))
                }
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
              >
                <option value="">Selecciona un tipo</option>
                {campaignTypes.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="newPricePlanName"
                className="block text-xs sm:text-sm font-medium text-neutral-700"
              >
                Nombre del Plan
              </label>
              <input
                type="text"
                id="newPricePlanName"
                name="name"
                value={newPricePlan.name}
                onChange={(e) =>
                  setNewPricePlan((prev) => ({ ...prev, name: e.target.value }))
                }
                placeholder="Ej: Plan Nacional Plus"
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
              />
            </div>
            <div>
              <label
                htmlFor="newPricePlanPrice"
                className="block text-xs sm:text-sm font-medium text-neutral-700"
              >
                Precio (COP)
              </label>
              <input
                type="number"
                id="newPricePlanPrice"
                name="price"
                value={newPricePlan.price}
                onChange={(e) =>
                  setNewPricePlan((prev) => ({
                    ...prev,
                    price: parseFloat(e.target.value),
                  }))
                }
                placeholder="Ej: 1500000"
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
              />
            </div>
            <div className="md:col-span-3 lg:col-span-3">
              <label
                htmlFor="newPricePlanDescription"
                className="block text-xs sm:text-sm font-medium text-neutral-700"
              >
                Descripción
              </label>
              <textarea
                id="newPricePlanDescription"
                name="description"
                value={newPricePlan.description}
                onChange={(e) =>
                  setNewPricePlan((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Descripción detallada del plan."
                rows="2"
                className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
              />
            </div>
          </div>
          <button
            onClick={handleAddPricingPlan}
            className="mt-4 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
          >
            <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Añadir Plan de Precios
          </button>
        </div>
      </section>

      {/* Sección de Información de Contacto */}
      <section className="bg-white p-3 sm:p-5 rounded-lg shadow-md mb-6 sm:mb-8 border border-neutral-200">
        <h2 className="text-lg sm:text-2xl font-semibold text-neutral-800 mb-4">
          Información de Contacto del Software
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
          <div>
            <label
              htmlFor="supportEmail"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              Email de Soporte
            </label>
            <input
              type="email"
              id="supportEmail"
              name="supportEmail"
              value={contactInfo.supportEmail}
              onChange={handleContactInfoChange}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
            />
          </div>
          <div>
            <label
              htmlFor="supportWhatsapp"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              WhatsApp de Soporte
            </label>
            <input
              type="text"
              id="supportWhatsapp"
              name="supportWhatsapp"
              value={contactInfo.supportWhatsapp}
              onChange={handleContactInfoChange}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
            />
          </div>
          <div>
            <label
              htmlFor="salesEmail"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              Email de Ventas
            </label>
            <input
              type="email"
              id="salesEmail"
              name="salesEmail"
              value={contactInfo.salesEmail}
              onChange={handleContactInfoChange}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
            />
          </div>
          <div>
            <label
              htmlFor="salesWhatsapp"
              className="block text-xs sm:text-sm font-medium text-neutral-700"
            >
              WhatsApp de Ventas
            </label>
            <input
              type="text"
              id="salesWhatsapp"
              name="salesWhatsapp"
              value={contactInfo.salesWhatsapp}
              onChange={handleContactInfoChange}
              className="mt-1 block w-full border border-neutral-300 rounded-md shadow-sm py-1.5 px-2 sm:py-2 sm:px-3 focus:outline-none focus:ring-primary focus:border-primary text-xs sm:text-sm text-neutral-800"
            />
          </div>
        </div>
        <button
          onClick={handleSaveContactInfo}
          className="mt-6 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
        >
          Guardar Información de Contacto
        </button>
      </section>
    </div>
  )
}
