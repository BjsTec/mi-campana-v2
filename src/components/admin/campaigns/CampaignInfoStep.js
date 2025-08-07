// src/components/admin/campaigns/CampaignInfoStep.js
import React, { useEffect, useState, useMemo } from 'react'

const CampaignInfoStep = ({
  formData,
  handleInputChange,
  departamentos,
  ciudades,
  setDepartamentos,
  setCiudades,
  setMessage,
  GET_DEPARTMENTS_URL,
  GET_CITIES_BY_DEPARTMENT_URL,
  dispatch,
  campaignTypesList,
  pricingPlansList,
}) => {
  const [filteredPricingPlans, setFilteredPricingPlans] = useState([])

  useEffect(() => {
    if (formData.type && pricingPlansList) {
      const selectedType = campaignTypesList.find(t => t.id === formData.type);
      if (selectedType) {
        setFilteredPricingPlans(pricingPlansList.filter(plan => plan.typeId === selectedType.id));
      } else {
        setFilteredPricingPlans([]);
      }
    } else if (pricingPlansList) {
      setFilteredPricingPlans(pricingPlansList);
    }
    dispatch({ type: 'UPDATE_FIELD', field: 'planId', value: '' });
  }, [formData.type, pricingPlansList, dispatch, campaignTypesList]);

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
      } catch (error) {
        console.error('Error al obtener departamentos:', error)
        setMessage({
          text: `❌ Error al cargar departamentos: ${error.message}`,
          type: 'error',
        })
      }
    }
    if (departamentos.length === 0) {
      fetchDepartamentos()
    }
  }, [GET_DEPARTMENTS_URL, setDepartamentos, setMessage, departamentos.length])

  useEffect(() => {
    const fetchCiudades = async () => {
      if (formData.location.state) {
        try {
          if (!GET_CITIES_BY_DEPARTMENT_URL) {
            throw new Error('URL para obtener ciudades por departamento no configurada.')
          }
          const response = await fetch(`${GET_CITIES_BY_DEPARTMENT_URL}?departmentId=${formData.location.state}`)
          if (!response.ok) {
            throw new Error('No se pudieron cargar las ciudades de la campaña.')
          }
          const data = await response.json()
          setCiudades(data)
          if (!data.some((c) => c.id === formData.location.city)) {
            dispatch({ type: 'UPDATE_FIELD', field: 'location.city', value: '' })
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
  }, [formData.location.state, GET_CITIES_BY_DEPARTMENT_URL, setCiudades, setMessage, formData.location.city, dispatch])

  const selectedCampaignType = useMemo(() => (campaignTypesList || []).find(type => type.id === formData.type), [formData.type, campaignTypesList]);
  const scopeDescription = selectedCampaignType ? selectedCampaignType.description : 'Seleccione un tipo de campaña para ver su alcance.';

  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Información General de la Campaña
      </h3>
      <div>
        <label htmlFor="campaignName" className="block text-sm font-medium text-gray-700">
          Nombre de la Campaña <span className="text-red-500">*</span>
        </label>
        <div className="mt-1">
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
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
            Tipo de Campaña <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            >
              <option value="">Seleccione un tipo de campaña</option>
              {campaignTypesList.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="scope" className="block text-sm font-medium text-gray-700">
            Alcance <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              id="scope"
              name="scope"
              value={scopeDescription}
              disabled
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md bg-gray-100 text-gray-800"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="planId" className="block text-sm font-medium text-gray-700">
            Plan de Campaña <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="planId"
              name="planId"
              value={formData.planId}
              onChange={handleInputChange}
              required
              disabled={!formData.type || filteredPricingPlans.length === 0}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            >
              <option value="">Seleccione un plan</option>
              {filteredPricingPlans.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.name} - ${plan.price.toLocaleString('es-CO')}/mes
                </option>
              ))}
            </select>
          </div>
          {formData.type && filteredPricingPlans.length === 0 && (
            <p className="mt-1 text-sm text-red-600">
              No hay planes disponibles para este tipo de campaña.
            </p>
          )}
        </div>
        <div>
          <label htmlFor="discountPercentage" className="block text-sm font-medium text-gray-700">
            Descuento (%) (Opcional)
          </label>
          <div className="mt-1">
            <input
              type="number"
              name="discountPercentage"
              id="discountPercentage"
              value={formData.discountPercentage}
              onChange={handleInputChange}
              min="0"
              max="100"
              step="0.01"
              placeholder="Ej: 5 (para 5%)"
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            />
          </div>
        </div>
      </div>

      <h3 className="text-lg font-medium leading-6 text-gray-900 pt-4">
        Ubicación de la Campaña
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="location.country" className="block text-sm font-medium text-gray-700">
            País (Campaña) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <input
              type="text"
              name="location.country"
              id="location.country"
              value={formData.location.country}
              onChange={handleInputChange}
              required
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm sm:text-sm bg-gray-100 text-gray-900"
            />
          </div>
        </div>
        <div>
          <label htmlFor="location.state" className="block text-sm font-medium text-gray-700">
            Departamento (Campaña) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="location.state"
              name="location.state"
              value={formData.location.state}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            >
              <option value="">Seleccione un departamento</option>
              {departamentos.map(dep => (
                <option key={dep.id} value={dep.id}>{dep.name}</option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <label htmlFor="location.city" className="block text-sm font-medium text-gray-700">
            Ciudad (Campaña) <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
            <select
              id="location.city"
              name="location.city"
              value={formData.location.city}
              onChange={handleInputChange}
              required
              disabled={!formData.location.state || ciudades.length === 0}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            >
              <option value="">Seleccione una ciudad</option>
              {ciudades.map(ciu => (
                <option key={ciu.id} value={ciu.id}>{ciu.name}</option>
              ))}
            </select>
          </div>
          {formData.location.state && ciudades.length === 0 && (
            <p className="mt-1 text-sm text-red-600">
              No hay ciudades disponibles para este departamento.
            </p>
          )}
        </div>
      </div>
      <h3 className="text-lg font-medium leading-6 text-gray-900 pt-4">
        Información de Contacto de la Campaña
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contactInfo.email" className="block text-sm font-medium text-gray-700">
            Email de Contacto <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
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
        </div>
        <div>
          <label htmlFor="contactInfo.phone" className="block text-sm font-medium text-gray-700">
            Teléfono de Contacto <span className="text-red-500">*</span>
          </label>
          <div className="mt-1">
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
        </div>
        <div>
          <label htmlFor="contactInfo.whatsapp" className="block text-sm font-medium text-gray-700">
            WhatsApp de Contacto
          </label>
          <div className="mt-1">
            <input
              type="tel"
              name="contactInfo.whatsapp"
              id="contactInfo.whatsapp"
              value={formData.contactInfo.whatsapp}
              onChange={handleInputChange}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            />
          </div>
        </div>
        <div>
          <label htmlFor="contactInfo.web" className="block text-sm font-medium text-gray-700">
            Sitio Web
          </label>
          <div className="mt-1">
            <input
              type="url"
              name="contactInfo.web"
              id="contactInfo.web"
              value={formData.contactInfo.web}
              onChange={handleInputChange}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            />
          </div>
        </div>
        <div>
          <label htmlFor="contactInfo.supportEmail" className="block text-sm font-medium text-gray-700">
            Email de Soporte
          </label>
          <div className="mt-1">
            <input
              type="email"
              name="contactInfo.supportEmail"
              id="contactInfo.supportEmail"
              value={formData.contactInfo.supportEmail}
              onChange={handleInputChange}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            />
          </div>
        </div>
        <div>
          <label htmlFor="contactInfo.supportWhatsapp" className="block text-sm font-medium text-gray-700">
            WhatsApp de Soporte
          </label>
          <div className="mt-1">
            <input
              type="tel"
              name="contactInfo.supportWhatsapp"
              id="contactInfo.supportWhatsapp"
              value={formData.contactInfo.supportWhatsapp}
              onChange={handleInputChange}
              className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignInfoStep