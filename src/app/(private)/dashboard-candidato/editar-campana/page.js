'use client'
import { useState, useEffect, Fragment } from 'react'
import { useAuth } from '@/context/AuthContext'
import { Switch } from '@headlessui/react'

// --- INICIO: Iconos SVG para la UI ---
const ContactIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)
const SocialIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
    />
  </svg>
)
const PaletteIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
    />
  </svg>
)
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    viewBox="0 0 20 20"
    fill="currentColor"
  >
    <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
    <path
      fillRule="evenodd"
      d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
      clipRule="evenodd"
    />
  </svg>
)
const GlobeIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth={2}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2h10a2 2 0 002-2v-1a2 2 0 012-2h1.945M7.707 4.293a1 1 0 010 1.414L5.414 8h13.172a1 1 0 010 2H5.414l2.293 2.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z"
    />
  </svg>
)
// --- FIN: Iconos SVG ---

/**
 * Función utilitaria para aplanar un objeto anidado.
 * Convierte { a: { b: 'value' } } en { 'a.b': 'value' }
 * @param {object} obj - El objeto a aplanar.
 * @param {string} parentKey - Prefijo para las claves (usado en recursión).
 * @returns {object} El objeto aplanado.
 */
const flattenObject = (obj, parentKey = '') => {
  let flattened = {}
  for (let key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      const newKey = parentKey ? `${parentKey}.${key}` : key
      if (
        typeof obj[key] === 'object' &&
        obj[key] !== null &&
        !Array.isArray(obj[key])
      ) {
        Object.assign(flattened, flattenObject(obj[key], newKey))
      } else {
        flattened[newKey] = obj[key]
      }
    }
  }
  return flattened
}

/**
 * Función utilitaria para "desaplanar" un objeto.
 * Convierte { 'a.b': 'value' } en { a: { b: 'value' } }
 * @param {object} flatObject - El objeto aplanado.
 * @returns {object} El objeto anidado.
 */
const unflattenObject = (flatObject) => {
  const result = {}
  for (const key in flatObject) {
    if (Object.prototype.hasOwnProperty.call(flatObject, key)) {
      const parts = key.split('.')
      let current = result
      for (let i = 0; i < parts.length; i++) {
        const part = parts[i]
        if (i === parts.length - 1) {
          current[part] = flatObject[key]
        } else {
          if (!current[part] || typeof current[part] !== 'object') {
            current[part] = {}
          }
          current = current[part]
        }
      }
    }
  }
  return result
}

// Componente de la página para gestionar la campaña
export default function ManageCampaignPage() {
  const { user, activeCampaign, campaignLoading, refreshActiveCampaign } =
    useAuth()

  const [formData, setFormData] = useState({})
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // CONSOLE.LOG 1: Estado inicial del usuario y carga de campaña
  useEffect(() => {
    console.log('--- Estado Inicial de ManageCampaignPage ---')
    console.log('Usuario (user):', user)
    console.log('Cargando Campaña (campaignLoading):', campaignLoading)
    console.log('Campaña Activa (activeCampaign):', activeCampaign)
  }, [user, campaignLoading, activeCampaign])

  // Efecto para rellenar el formulario cuando la campaña activa (del contexto) cambia
  useEffect(() => {
    if (activeCampaign) {
      console.log(
        'activeCampaign detectada, rellenando formData:',
        activeCampaign,
      )
      // Usar flattenObject para inicializar formData con la estructura de puntos
      const initialFormData = {
        ...flattenObject(activeCampaign.contactInfo || {}),
        ...flattenObject(activeCampaign.socialLinks || {}),
        ...flattenObject(activeCampaign.media || {}), // Asegúrate de incluir media si se va a editar
        ...flattenObject(activeCampaign.colors || {}), // Asegúrate de incluir colors si se va a editar
        status: activeCampaign.status || 'privado',
        campaignName: activeCampaign.campaignName || '', // Añadir campaignName
        scope: activeCampaign.scope || '', // Añadir scope
        'location.country': activeCampaign.location?.country || 'Colombia', // Añadir location
        'location.state': activeCampaign.location?.state || '',
        'location.city': activeCampaign.location?.city || '',
        // Añadir otros campos editables si los hay, como messagingOptions
        'messagingOptions.email':
          activeCampaign.messagingOptions?.email ?? true,
        'messagingOptions.alerts':
          activeCampaign.messagingOptions?.alerts ?? true,
        'messagingOptions.sms': activeCampaign.messagingOptions?.sms ?? false,
        'messagingOptions.whatsappBusiness':
          activeCampaign.messagingOptions?.whatsappBusiness ?? false,
      }
      setFormData(initialFormData)
      console.log('formData después de rellenar:', initialFormData)
    } else {
      console.log(
        'activeCampaign es null o undefined. No se puede rellenar formData.',
      )
      setFormData({}) // Limpiar formData si no hay campaña activa
    }
  }, [activeCampaign]) // Dependencia: activeCampaign

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    console.log(`Campo cambiado: ${name}, Nuevo valor: ${value}`)
  }

  const handleStatusChange = (newStatus) => {
    setFormData((prev) => ({
      ...prev,
      status: newStatus ? 'publico' : 'privado',
    }))
    console.log(
      'Estado de campaña cambiado a:',
      newStatus ? 'publico' : 'privado',
    )
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError('')
    setSuccess('')

    console.log('Iniciando handleSubmit...')
    console.log('Datos a enviar (formData):', formData)
    console.log('ID de Campaña:', activeCampaign?.id)
    console.log('UID de Usuario:', user?.uid)

    try {
      const updateCampaignUrl = process.env.NEXT_PUBLIC_UPDATE_CAMPAIGN_URL
      if (!updateCampaignUrl) {
        console.error('Error: URL de actualización no configurada.')
        throw new Error('URL de actualización no configurada.')
      }
      console.log('URL de actualización:', updateCampaignUrl)

      // Transformar formData a la estructura anidada esperada por el backend
      const updatesPayload = unflattenObject(formData)
      console.log('Updates Payload (después de unflatten):', updatesPayload)

      const payload = {
        campaignId: activeCampaign.id,
        // El backend ya extrae el userUid del token, no es necesario enviarlo explícitamente en el body
        // callingUserUid: user.uid, // Eliminar esta línea
        updates: updatesPayload, // Usar el objeto transformado
      }
      console.log('Payload final enviado a la API:', payload)

      const response = await fetch(updateCampaignUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.idToken}`, // Asegúrate de enviar el token de autorización
        },
        body: JSON.stringify(payload),
      })

      const result = await response.json()
      console.log('Respuesta de la API:', result)

      if (!response.ok) {
        console.error('Error en la respuesta de la API:', result.message)
        throw new Error(result.message || 'Error al actualizar la campaña.')
      }

      setSuccess('¡Perfil actualizado!')
      console.log('Actualización exitosa. Refrescando campaña...')
      await refreshActiveCampaign() // Avisa al contexto que recargue los datos
      setIsEditing(false)
    } catch (err) {
      console.error('Error durante el submit:', err.message)
      setError(err.message)
    } finally {
      setIsSubmitting(false)
      console.log('handleSubmit finalizado.')
    }
  }

  if (campaignLoading) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Cargando perfil de la campaña...</p>
      </div>
    )
  }

  if (!activeCampaign) {
    return (
      <div
        className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 rounded-md"
        role="alert"
      >
        <p className="font-bold">Información</p>
        <p>
          No tienes una campaña activa o no se pudo cargar. Por favor,
          selecciona una campaña o contacta a soporte.
        </p>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      {isEditing ? (
        <EditView
          formData={formData}
          handleInputChange={handleInputChange}
          handleStatusChange={handleStatusChange}
          handleSubmit={handleSubmit}
          setIsEditing={setIsEditing}
          loading={isSubmitting}
          success={success}
          error={error}
        />
      ) : (
        <ProfileView campaign={activeCampaign} setIsEditing={setIsEditing} />
      )}
    </div>
  )
}

// --- Componente para la VISTA DE PERFIL ---
function ProfileView({ campaign, setIsEditing }) {
  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="h-48 md:h-64 bg-gray-200 rounded-lg shadow-inner overflow-hidden">
          {campaign.media?.bannerUrl ? (
            <img
              src={campaign.media.bannerUrl}
              alt="Banner de la campaña"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-gray-300 to-gray-400"></div>
          )}
        </div>
        <div className="absolute bottom-0 left-8 transform translate-y-1/2 flex items-end gap-4">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-white rounded-full shadow-lg border-4 border-white overflow-hidden">
            {campaign.media?.logoUrl ? (
              <img
                src={campaign.media.logoUrl}
                alt="Logo de la campaña"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-500 text-4xl font-bold">
                ?
              </div>
            )}
          </div>
          <div>
            <h1 className="text-2xl md:text-4xl font-bold text-gray-800">
              {campaign.campaignName}
            </h1>
            <p className="text-md text-gray-500 capitalize">
              {campaign.type} - {campaign.location?.city}
            </p>
          </div>
        </div>
      </div>
      <div className="pt-20">
        <div className="text-right">
          <button
            onClick={() => setIsEditing(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <EditIcon />
            Editar Perfil
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <ContactIcon />
            Contacto y Redes
          </h3>
          <dl className="space-y-2">
            <div className="flex justify-between">
              <dt className="font-medium text-gray-500">Email</dt>
              <dd className="text-gray-900">
                {campaign.contactInfo?.email || 'No especificado'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-500">Teléfono</dt>
              <dd className="text-gray-900">
                {campaign.contactInfo?.phone || 'No especificado'}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-500">Facebook</dt>
              <dd>
                <a
                  href={campaign.socialLinks?.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {campaign.socialLinks?.facebook
                    ? 'Visitar'
                    : 'No especificado'}
                </a>
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="font-medium text-gray-500">Twitter</dt>
              <dd>
                <a
                  href={campaign.socialLinks?.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline"
                >
                  {campaign.socialLinks?.twitter
                    ? 'Visitar'
                    : 'No especificado'}
                </a>
              </dd>
            </div>
          </dl>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <PaletteIcon />
              Marca
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Color Primario
                </p>
                <div
                  className="w-full h-10 rounded-md mt-1 border"
                  style={{
                    backgroundColor: campaign.colors?.primary || '#3B82F6',
                  }}
                ></div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Color de Acento
                </p>
                <div
                  className="w-full h-10 rounded-md mt-1 border"
                  style={{
                    backgroundColor: campaign.colors?.accent || '#FFFFFF',
                  }}
                ></div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <GlobeIcon />
              Estado
            </h3>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${campaign.status === 'publico' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}
            >
              {campaign.status === 'publico' ? 'Público' : 'Privado'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// --- Componente para la VISTA DE EDICIÓN ---
function EditView({
  formData,
  handleInputChange,
  handleStatusChange,
  handleSubmit,
  setIsEditing,
  loading,
  success,
  error,
}) {
  const isPublic = formData['status'] === 'publico'

  return (
    <form onSubmit={handleSubmit} className="space-y-10">
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
          <GlobeIcon />
          Estado de la Campaña
        </h2>
        <Switch.Group as="div" className="flex items-center justify-between">
          <span className="flex-grow flex flex-col">
            <Switch.Label
              as="span"
              className="text-sm font-medium text-gray-900"
              passive
            >
              Perfil Público
            </Switch.Label>
            <Switch.Description as="span" className="text-sm text-gray-500">
              Permite que tu campaña sea visible para visitantes externos.
            </Switch.Description>
          </span>
          <Switch
            checked={isPublic}
            onChange={handleStatusChange}
            className={`${isPublic ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            <span
              aria-hidden="true"
              className={`${isPublic ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
            />
          </Switch>
        </Switch.Group>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
          <ContactIcon />
          Información de Contacto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="contactInfo.email"
              className="block text-sm font-medium text-gray-700"
            >
              Email de Contacto
            </label>
            <input
              type="email"
              name="contactInfo.email"
              id="contactInfo.email"
              value={formData['contactInfo.email'] || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="contactInfo.phone"
              className="block text-sm font-medium text-gray-700"
            >
              Teléfono
            </label>
            <input
              type="tel"
              name="contactInfo.phone"
              id="contactInfo.phone"
              value={formData['contactInfo.phone'] || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <b className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
          <SocialIcon />
          Redes Sociales
        </b>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="socialLinks.facebook"
              className="block text-sm font-medium text-gray-700"
            >
              Facebook URL
            </label>
            <input
              type="url"
              name="socialLinks.facebook"
              id="socialLinks.facebook"
              value={formData['socialLinks.facebook'] || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="socialLinks.twitter"
              className="block text-sm font-medium text-gray-700"
            >
              Twitter URL
            </label>
            <input
              type="url"
              name="socialLinks.twitter"
              id="socialLinks.twitter"
              value={formData['socialLinks.twitter'] || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
          <PaletteIcon />
          Colores de la Campaña
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
          <div>
            <label
              htmlFor="colors.primary"
              className="block text-sm font-medium text-gray-700"
            >
              Color Primario
            </label>
            <input
              type="color"
              name="colors.primary"
              id="colors.primary"
              value={formData['colors.primary'] || '#3084F2'}
              onChange={handleInputChange}
              className="mt-1 block w-full h-12 border-gray-300 rounded-md shadow-sm cursor-pointer"
            />
          </div>
          <div>
            <label
              htmlFor="colors.accent"
              className="block text-sm font-medium text-gray-700"
            >
              Color de Acento (Texto)
            </label>
            <input
              type="color"
              name="colors.accent"
              id="colors.accent"
              value={formData['colors.accent'] || '#FFFFFF'}
              onChange={handleInputChange}
              className="mt-1 block w-full h-12 border-gray-300 rounded-md shadow-sm cursor-pointer"
            />
          </div>
        </div>
      </div>
      {/* Nuevos campos de Campaña (campaignName, scope, location) */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
          <GlobeIcon />{' '}
          {/* Reutilizando el icono, puedes crear uno específico si quieres */}
          Información General de la Campaña
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label
              htmlFor="campaignName"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre de la Campaña
            </label>
            <input
              type="text"
              name="campaignName"
              id="campaignName"
              value={formData['campaignName'] || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="scope"
              className="block text-sm font-medium text-gray-700"
            >
              Alcance (Scope)
            </label>
            <input
              type="text"
              name="scope"
              id="scope"
              value={formData['scope'] || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="location.country"
              className="block text-sm font-medium text-gray-700"
            >
              País
            </label>
            <input
              type="text"
              name="location.country"
              id="location.country"
              value={formData['location.country'] || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="location.state"
              className="block text-sm font-medium text-gray-700"
            >
              Departamento
            </label>
            <input
              type="text"
              name="location.state"
              id="location.state"
              value={formData['location.state'] || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label
              htmlFor="location.city"
              className="block text-sm font-medium text-gray-700"
            >
              Ciudad
            </label>
            <input
              type="text"
              name="location.city"
              id="location.city"
              value={formData['location.city'] || ''}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
      {/* Nuevos campos de Opciones de Mensajería */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-5 flex items-center">
          <ContactIcon />{' '}
          {/* Reutilizando el icono, puedes crear uno específico si quieres */}
          Opciones de Mensajería
        </h2>
        <div className="space-y-4">
          <Switch.Group as="div" className="flex items-center justify-between">
            <span className="flex-grow flex flex-col">
              <Switch.Label
                as="span"
                className="text-sm font-medium text-gray-900"
                passive
              >
                Email
              </Switch.Label>
              <Switch.Description as="span" className="text-sm text-gray-500">
                Permitir envío de correos electrónicos.
              </Switch.Description>
            </span>
            <Switch
              checked={formData['messagingOptions.email'] ?? false}
              onChange={(checked) =>
                handleInputChange({
                  target: { name: 'messagingOptions.email', value: checked },
                })
              }
              className={`${(formData['messagingOptions.email'] ?? false) ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                aria-hidden="true"
                className={`${(formData['messagingOptions.email'] ?? false) ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </Switch.Group>

          <Switch.Group as="div" className="flex items-center justify-between">
            <span className="flex-grow flex flex-col">
              <Switch.Label
                as="span"
                className="text-sm font-medium text-gray-900"
                passive
              >
                Alertas
              </Switch.Label>
              <Switch.Description as="span" className="text-sm text-gray-500">
                Permitir envío de alertas en la aplicación.
              </Switch.Description>
            </span>
            <Switch
              checked={formData['messagingOptions.alerts'] ?? false}
              onChange={(checked) =>
                handleInputChange({
                  target: { name: 'messagingOptions.alerts', value: checked },
                })
              }
              className={`${(formData['messagingOptions.alerts'] ?? false) ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                aria-hidden="true"
                className={`${(formData['messagingOptions.alerts'] ?? false) ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </Switch.Group>

          <Switch.Group as="div" className="flex items-center justify-between">
            <span className="flex-grow flex flex-col">
              <Switch.Label
                as="span"
                className="text-sm font-medium text-gray-900"
                passive
              >
                SMS
              </Switch.Label>
              <Switch.Description as="span" className="text-sm text-gray-500">
                Permitir envío de mensajes SMS.
              </Switch.Description>
            </span>
            <Switch
              checked={formData['messagingOptions.sms'] ?? false}
              onChange={(checked) =>
                handleInputChange({
                  target: { name: 'messagingOptions.sms', value: checked },
                })
              }
              className={`${(formData['messagingOptions.sms'] ?? false) ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                aria-hidden="true"
                className={`${(formData['messagingOptions.sms'] ?? false) ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </Switch.Group>

          <Switch.Group as="div" className="flex items-center justify-between">
            <span className="flex-grow flex flex-col">
              <Switch.Label
                as="span"
                className="text-sm font-medium text-gray-900"
                passive
              >
                WhatsApp Business
              </Switch.Label>
              <Switch.Description as="span" className="text-sm text-gray-500">
                Permitir comunicación a través de WhatsApp Business.
              </Switch.Description>
            </span>
            <Switch
              checked={formData['messagingOptions.whatsappBusiness'] ?? false}
              onChange={(checked) =>
                handleInputChange({
                  target: {
                    name: 'messagingOptions.whatsappBusiness',
                    value: checked,
                  },
                })
              }
              className={`${(formData['messagingOptions.whatsappBusiness'] ?? false) ? 'bg-blue-600' : 'bg-gray-200'} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
            >
              <span
                aria-hidden="true"
                className={`${(formData['messagingOptions.whatsappBusiness'] ?? false) ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
              />
            </Switch>
          </Switch.Group>
        </div>
      </div>
      <div className="flex items-center justify-end gap-4">
        {error && <p className="text-red-600 text-sm font-medium">{error}</p>}
        {success && (
          <p className="text-green-600 text-sm font-medium">{success}</p>
        )}
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="py-2 px-6 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>
    </form>
  )
}
