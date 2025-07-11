// src/components/admin/campaigns/CampaignInfoStep.js
import React, { useEffect, useState } from 'react'

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
}) => {
  const [campaignTypes, setCampaignTypes] = useState([]) // Nuevo estado para los tipos de campaña
  const GET_PUBLIC_CAMPAIGN_TYPES_URL =
    process.env.NEXT_PUBLIC_FN_GET_PUBLIC_CAMPAIGN_TYPES_URL // Obtener la URL de las variables de entorno

  // Cargar departamentos al inicio
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
        // Si el estado de la campaña no está precargado, selecciona el primero por defecto
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
    fetchDepartamentos()
  }, [
    GET_DEPARTMENTS_URL,
    setDepartamentos,
    setMessage,
    formData.location.state,
    dispatch,
  ])

  // Cargar ciudades para la ubicación de la campaña
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
          // Limpiar ciudad si el departamento cambia y la ciudad actual no pertenece
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

  // Cargar tipos de campaña al inicio
  useEffect(() => {
    const fetchCampaignTypes = async () => {
      try {
        if (!GET_PUBLIC_CAMPAIGN_TYPES_URL) {
          throw new Error('URL para obtener tipos de campaña no configurada.')
        }
        const response = await fetch(GET_PUBLIC_CAMPAIGN_TYPES_URL)
        if (!response.ok) {
          throw new Error('No se pudieron cargar los tipos de campaña.')
        }
        const data = await response.json()
        setCampaignTypes(data)
        // Si el tipo de campaña no está precargado, selecciona el primero activo por defecto
        if (!formData.type && data.length > 0) {
          const defaultType = data.find((type) => type.active)
          if (defaultType) {
            dispatch({
              type: 'UPDATE_FIELD',
              field: 'type',
              value: defaultType.id,
            })
          }
        }
      } catch (error) {
        console.error('Error al obtener tipos de campaña:', error)
        setMessage({
          text: `❌ Error al cargar tipos de campaña: ${error.message}`,
          type: 'error',
        })
      }
    }
    fetchCampaignTypes()
  }, [GET_PUBLIC_CAMPAIGN_TYPES_URL, setMessage, formData.type, dispatch])

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
          className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="type"
            className="block text-sm font-medium text-gray-700"
          >
            Tipo *
          </label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md text-gray-900" // Ajustado focus:ring y focus:border a primary, añadido text-gray-900
          >
            <option value="">Seleccione un tipo de campaña</option>
            {campaignTypes
              .filter((type) => type.active)
              .map(
                (
                  type, // Filtrar solo activos
                ) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ),
              )}
          </select>
        </div>
        <div>
          <label
            htmlFor="scope"
            className="block text-sm font-medium text-gray-700"
          >
            Alcance *
          </label>
          <input
            type="text"
            name="scope"
            id="scope"
            value={formData.scope}
            onChange={handleInputChange}
            required // Ahora es requerido según el JSON de Postman
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
            placeholder="Ej: municipal, departamental, nacional"
          />
        </div>
      </div>
      {/* Ubicación de la Campaña */}
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm bg-gray-50 text-gray-900" // Ajustado focus:ring y focus:border a primary, añadido text-gray-900
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
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900" // Ajustado focus:ring y focus:border a primary, añadido text-gray-900
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
            disabled={!formData.location.state}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm text-gray-900" // Ajustado focus:ring y focus:border a primary, añadido text-gray-900
          >
            <option value="">Seleccione una ciudad</option>
            {ciudades.map((ciu) => (
              <option key={ciu.id} value={ciu.id}>
                {ciu.name}
              </option>
            ))}
          </select>
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
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
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
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
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
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
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
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
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
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
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
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900" // Añadido text-gray-900
          />
        </div>
        {/* Se eliminan los campos de salesEmail y salesWhatsapp según el JSON de Postman */}
      </div>
    </div>
  )
}

export default CampaignInfoStep
