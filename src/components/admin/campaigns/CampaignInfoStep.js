// src/components/admin/campaigns/CampaignInfoStep.js
import React, { useEffect, useState } from 'react'

const CampaignInfoStep = ({
  formData,
  handleInputChange,
  departamentos,
  ciudades,
  setDepartamentos, // Se mantiene si todavía hay lógica de `setDepartamentos` aquí para ubicaciones de campaña
  setCiudades, // Se mantiene si todavía hay lógica de `setCiudades` aquí para ubicaciones de campaña
  setMessage,
  GET_DEPARTMENTS_URL,
  GET_CITIES_BY_DEPARTMENT_URL,
  dispatch,
  campaignTypesList, // Recibe la lista de tipos de campaña desde el padre
  pricingPlansList, // Recibe la lista de planes de precios desde el padre
}) => {
  const [filteredPricingPlans, setFilteredPricingPlans] = useState([]) // Estado para planes filtrados

  // Efecto para actualizar los planes de precios disponibles cuando cambia el tipo de campaña
  useEffect(() => {
    // ¡CORRECCIÓN AQUÍ! Ahora se muestra toda la lista de planes, sin filtrar por typeId.
    if (pricingPlansList) {
      setFilteredPricingPlans(pricingPlansList)
    } else {
      setFilteredPricingPlans([])
    }
    // Reinicia el planId si el tipo de campaña cambia
    dispatch({ type: 'UPDATE_FIELD', field: 'planId', value: '' })
  }, [formData.type, pricingPlansList, dispatch]) // formData.type ya no afecta el filtro directamente

  // Cargar departamentos al inicio (se mantiene la lógica)
  useEffect(() => {
    const fetchDepartamentos = async () => {
      try {
        if (!GET_DEPARTMENTS_URL) {
          throw new Error('URL para obtener departamentos no configurada.')
        }
        const response = await fetch(GET_DEPARTMENTS_URL)
        if (!response.ok) {
          throw new Error('No se pudieron cargar los departamentos.')
        }
        const data = await response.json()
        setDepartamentos(data)
        if (!formData.location.state && data.length > 0) {
          dispatch({
            type: 'UPDATE_FIELD',
            field: 'location.state',
            value: data[0].id,
          })
        }
      } catch (error) {
        console.error('Error al obtener departamentos:', error)
        setMessage({
          text: `❌ Error al cargar departamentos: ${error.message}`,
          type: 'error',
        })
      }
    }
    // Solo llamar si departamentos está vacío para evitar llamadas repetidas innecesarias
    if (departamentos.length === 0) {
      fetchDepartamentos()
    }
  }, [
    GET_DEPARTMENTS_URL,
    setDepartamentos,
    setMessage,
    formData.location.state,
    dispatch,
    departamentos.length, // Añadido para evitar bucle si seDepartamentos causa re-render
  ])

  // Cargar ciudades para la ubicación de la campaña (se mantiene la lógica)
  useEffect(() => {
    const fetchCiudades = async () => {
      if (formData.location.state) {
        try {
          if (!GET_CITIES_BY_DEPARTMENT_URL) {
            throw new Error(
              'URL para obtener ciudades por departamento no configurada.',
            )
          }
          const response = await fetch(
            `${GET_CITIES_BY_DEPARTMENT_URL}?departmentId=${formData.location.state}`,
          )
          if (!response.ok) {
            throw new Error('No se pudieron cargar las ciudades de la campaña.')
          }
          const data = await response.json()
          setCiudades(data)
          if (!data.some((c) => c.id === formData.location.city)) {
            dispatch({
              type: 'UPDATE_FIELD',
              field: 'location.city',
              value: '',
            })
          }
        } catch (error) {
          console.error('Error al obtener ciudades de la campaña:', error)
          setMessage({
            text: `❌ Error al cargar ciudades de la campaña: ${error.message}`,
            type: 'error',
          })
        }
      } else {
        setCiudades([])
        dispatch({ type: 'UPDATE_FIELD', field: 'location.city', value: '' })
      }
    }
    fetchCiudades()
  }, [
    formData.location.state,
    GET_CITIES_BY_DEPARTMENT_URL,
    setCiudades,
    setMessage,
    formData.location.city,
    dispatch,
  ])

  // Lógica para obtener la descripción del alcance basada en el tipo de campaña
  const selectedCampaignType = (campaignTypesList || []).find(
    (type) => type.id === formData.type,
  )
  const scopeDescription = selectedCampaignType
    ? selectedCampaignType.description
    : 'Seleccione un tipo de campaña para ver su alcance.'

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Información General de la Campaña
      </h3>
      <div>
        <label
          htmlFor="campaignName"
          className="block text-sm font-medium text-gray-700"
        >
          Nombre de la Campaña *
        </label>
        <input
          type="text"
          name="campaignName"
          id="campaignName"
          value={formData.campaignName}
          onChange={handleInputChange}
          required
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700"
          >
            Tipo de Campaña *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-gray-900"
          >
            <option value="">Seleccione un tipo de campaña</option>
            {/* Usar campaignTypesList directamente */}
            {(campaignTypesList || [])
              .filter((type) => type.active) // Filtrar solo activos
              .map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="scope"
            className="block text-sm font-medium text-gray-700"
          >
            Alcance *
          </label>
          {/* Ahora es un input de solo lectura para mantener la consistencia del formulario */}
          <input
            type="text"
            id="scope"
            name="scope"
            value={scopeDescription}
            disabled // Hace el campo no editable
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-100 text-gray-800"
          />
        </div>
      </div>

      {/* NUEVOS CAMPOS: PLAN DE CAMPAÑA Y DESCUENTO */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="planId"
            className="block text-sm font-medium text-gray-700"
          >
            Plan de Campaña *
          </label>
          <select
            id="planId"
            name="planId"
            value={formData.planId}
            onChange={handleInputChange}
            required
            disabled={!formData.type || filteredPricingPlans.length === 0} // Deshabilitar si no hay tipo o planes
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-gray-900"
          >
            <option value="">Seleccione un plan</option>
            {filteredPricingPlans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} - ${plan.price.toLocaleString('es-CO')} / mes
              </option>
            ))}
          </select>
          {formData.type && filteredPricingPlans.length === 0 && (
            <p className="mt-1 text-sm text-red-600">
              No hay planes disponibles para este tipo de campaña.
            </p>
          )}
        </div>
        <div>
          <label
            htmlFor="discountPercentage"
            className="block text-sm font-medium text-gray-700"
          >
            Descuento (%) (Opcional)
          </label>
          <input
            type="number"
            name="discountPercentage"
            id="discountPercentage"
            value={formData.discountPercentage}
            onChange={handleInputChange}
            min="0"
            max="100"
            step="0.01"
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            placeholder="Ej: 5 (para 5%)"
          />
        </div>
      </div>

      {/* Ubicación de la Campaña */}
      <h3 className="text-lg font-medium leading-6 text-gray-900 pt-4">
        Ubicación de la Campaña
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label
            htmlFor="location.country"
            className="block text-sm font-medium text-gray-700"
          >
            País (Campaña) *
          </label>
          <select
            name="location.country"
            id="location.country"
            value={formData.location.country}
            onChange={handleInputChange}
            required
            disabled // Por ahora, solo Colombia
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 text-gray-900"
          >
            <option value="Colombia">Colombia</option>
          </select>
        </div>
        <div>
          <label
            htmlFor="location.state"
            className="block text-sm font-medium text-gray-700"
          >
            Departamento (Campaña) *
          </label>
          <select
            name="location.state"
            id="location.state"
            value={formData.location.state}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900"
          >
            <option value="">Seleccione un departamento</option>
            {departamentos.map((dep) => (
              <option key={dep.id} value={dep.id}>
                {dep.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label
            htmlFor="location.city"
            className="block text-sm font-medium text-gray-700"
          >
            Ciudad (Campaña) *
          </label>
          <select
            name="location.city"
            id="location.city"
            value={formData.location.city}
            onChange={handleInputChange}
            required
            disabled={!formData.location.state || ciudades.length === 0}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900"
          >
            <option value="">Seleccione una ciudad</option>
            {ciudades.map((ciu) => (
              <option key={ciu.id} value={ciu.id}>
                {ciu.name}
              </option>
            ))}
          </select>
          {formData.location.state && ciudades.length === 0 && (
            <p className="mt-1 text-sm text-red-600">
              No hay ciudades disponibles para este departamento.
            </p>
          )}
        </div>
      </div>
      {/* Información de contacto de la Campaña */}
      <h3 className="text-lg font-medium leading-6 text-gray-900 pt-4">
        Información de Contacto de la Campaña
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="contactInfo.email"
            className="block text-sm font-medium text-gray-700"
          >
            Email de Contacto *
          </label>
          <input
            type="email"
            name="contactInfo.email"
            id="contactInfo.email"
            value={formData.contactInfo.email}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
          />
        </div>
        <div>
          <label
            htmlFor="contactInfo.phone"
            className="block text-sm font-medium text-gray-700"
          >
            Teléfono de Contacto *
          </label>
          <input
            type="tel"
            name="contactInfo.phone"
            id="contactInfo.phone"
            value={formData.contactInfo.phone}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
          />
        </div>
        <div>
          <label
            htmlFor="contactInfo.whatsapp"
            className="block text-sm font-medium text-gray-700"
          >
            WhatsApp de Contacto
          </label>
          <input
            type="tel"
            name="contactInfo.whatsapp"
            id="contactInfo.whatsapp"
            value={formData.contactInfo.whatsapp}
            onChange={handleInputChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
          />
        </div>
        <div>
          <label
            htmlFor="contactInfo.web"
            className="block text-sm font-medium text-gray-700"
          >
            Sitio Web
          </label>
          <input
            type="url"
            name="contactInfo.web"
            id="contactInfo.web"
            value={formData.contactInfo.web}
            onChange={handleInputChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
          />
        </div>
        <div>
          <label
            htmlFor="contactInfo.supportEmail"
            className="block text-sm font-medium text-gray-700"
          >
            Email de Soporte
          </label>
          <input
            type="email"
            name="contactInfo.supportEmail"
            id="contactInfo.supportEmail"
            value={formData.contactInfo.supportEmail}
            onChange={handleInputChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
          />
        </div>
        <div>
          <label
            htmlFor="contactInfo.supportWhatsapp"
            className="block text-sm font-medium text-gray-700"
          >
            WhatsApp de Soporte
          </label>
          <input
            type="tel"
            name="contactInfo.supportWhatsapp"
            id="contactInfo.supportWhatsapp"
            value={formData.contactInfo.supportWhatsapp}
            onChange={handleInputChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
          />
        </div>
        {/* Se eliminan los campos de salesEmail y salesWhatsapp según el JSON de Postman */}
      </div>
    </div>
  )
}

export default CampaignInfoStep
