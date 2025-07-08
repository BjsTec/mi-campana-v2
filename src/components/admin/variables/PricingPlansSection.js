// src/components/admin/variables/PricingPlansSection.js
import React, { useState } from 'react'
import {
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/outline'

// Componente de Fila Editable de Tabla (para Desktop/Tablet)
const EditableTableRow = ({
  item,
  fields,
  onSave,
  onDelete,
  campaignTypesList,
}) => {
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
      {fields.map((field) =>
        // Ocultar la columna 'ID'
        field.key === 'id' ? null : (
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
                  className="form-checkbox h-4 w-4 text-primary rounded-md focus:ring-primary"
                />
              ) : field.type === 'textarea' ? (
                <textarea
                  name={field.key}
                  value={editedItem[field.key]}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-md shadow-sm p-1 text-neutral-800 focus:outline-none focus:ring-primary focus:border-primary"
                  rows="2"
                />
              ) : field.key === 'typeId' && campaignTypesList ? (
                <select
                  name={field.key}
                  value={editedItem[field.key]}
                  onChange={handleChange}
                  className="w-full border border-neutral-300 rounded-md shadow-sm p-1 text-neutral-800 focus:outline-none focus:ring-primary focus:border-primary"
                >
                  <option value="">Seleccionar</option>
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
        ),
      )}
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

// Nuevo Componente para la Vista de Lista/Card en Móviles
const MobileEditableCard = ({
  item,
  fields,
  onSave,
  onDelete,
  campaignTypesList,
}) => {
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
            // Ocultar el campo 'ID' en la vista de detalles del móvil
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
                      className="form-checkbox h-4 w-4 text-primary rounded-md focus:ring-primary"
                    />
                  ) : field.type === 'textarea' ? (
                    <textarea
                      name={field.key}
                      value={editedItem[field.key]}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-md shadow-sm p-1 text-neutral-800 focus:outline-none focus:ring-primary focus:border-primary text-xs"
                      rows="2"
                    />
                  ) : field.key === 'typeId' && campaignTypesList ? (
                    <select
                      name={field.key}
                      value={editedItem[field.key]}
                      onChange={handleChange}
                      className="w-full border border-neutral-300 rounded-md shadow-sm p-1 text-neutral-800 focus:outline-none focus:ring-primary focus:border-primary text-xs"
                    >
                      <option value="">Seleccionar</option>
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

const PricingPlansSection = ({
  pricingPlans,
  campaignTypesList,
  onSavePricingPlan,
  onDeletePricingPlan,
  onAddPricingPlan,
}) => {
  const [newPricePlan, setNewPricePlan] = useState({
    typeId: '',
    name: '',
    price: '',
    description: '',
  })

  const handleAdd = () => {
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
      onAddPricingPlan(newItem)
      setNewPricePlan({ typeId: '', name: '', price: '', description: '' })
    } else {
      alert(
        'Por favor, completa todos los campos del plan de precios: Tipo de Campaña, Nombre y Precio.',
      )
    }
  }

  const pricingPlanFields = [
    // { label: 'ID', key: 'id', editable: false }, // Eliminado para no mostrar en la tabla
    {
      label: 'Tipo Campaña',
      key: 'typeId',
      editable: true,
      type: 'select',
      format: (val) =>
        (campaignTypesList
          ? campaignTypesList.find((t) => t.id === val)?.name
          : val) || val,
    },
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
                onSave={onSavePricingPlan}
                onDelete={onDeletePricingPlan}
                campaignTypesList={campaignTypesList}
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
            onSave={onSavePricingPlan}
            onDelete={onDeletePricingPlan}
            campaignTypesList={campaignTypesList}
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
              {campaignTypesList.map((type) => (
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
          onClick={handleAdd}
          className="mt-4 inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors duration-200"
        >
          <PlusCircleIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
          Añadir Plan de Precios
        </button>
      </div>
    </section>
  )
}

export default PricingPlansSection
