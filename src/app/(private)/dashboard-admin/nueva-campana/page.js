// src/app/(private)/dashboard-admin/nueva-campana/page.js
'use client'

import React, {
  useState,
  useReducer,
  useEffect,
  useCallback,
  useRef,
} from 'react'
import { useAuth } from '../../../../context/AuthContext'

// Importar los componentes modulares
import CampaignInfoStep from '@/components/admin/campaigns/CampaignInfoStep'
import CandidateInfoStep from '@/components/admin/campaigns/CandidateInfoStep'
import MediaMessagingStep from '@/components/admin/campaigns/MediaMessagingStep'

// --- Iconos SVG para una UI más rica ---
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
const UserIcon = () => (
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
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />{' '}
  </svg>
)
const MediaIcon = () => (
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
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />{' '}
  </svg>
)
const CheckCircleIconStep = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-green-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    {' '}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />{' '}
  </svg>
)
const ArrowRightIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 ml-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    {' '}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14 5l7 7m0 0l-7 7m7-7H3"
    />{' '}
  </svg>
)
const UploadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-gray-400"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    {' '}
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />{' '}
  </svg>
)

// --- Estado inicial del formulario, basado en el JSON de Postman y la estructura de la BD ---
const initialState = {
  campaignName: '',
  type: '', // Ahora puede ser vacío para forzar selección o tener un valor por defecto sensato
  scope: 'municipal', // Valor por defecto
  planId: '', // Este aún se usa para la selección en el frontend
  discountPercentage: 0, // Ahora es un número para el porcentaje de descuento

  // Datos del candidato (usuario)
  candidateName: '',
  candidateCedula: '',
  candidateEmail: '',
  candidatePassword: '',
  whatsapp: '', // Del usuario
  phone: '', // Del usuario
  sexo: '', // Del usuario
  dateBirth: '', // Del usuario
  puestoVotacion: '', // Del usuario

  // Ubicación de la campaña
  location: {
    country: 'Colombia', // Por defecto
    state: '', // ID del departamento
    city: '', // ID de la ciudad
  },
  // Ubicación del candidato (puede ser igual a la de la campaña o diferente)
  candidateLocation: {
    country: 'Colombia', // Por defecto
    state: '',
    city: '',
  },

  // Información de contacto de la campaña
  contactInfo: {
    email: '',
    phone: '',
    whatsapp: '',
    web: '',
    supportEmail: '',
    supportWhatsapp: '',
  },
  // Media de la campaña
  media: { logoUrl: '', bannerUrl: '' },
  // Redes sociales de la campaña
  socialLinks: {
    facebook: '',
    instagram: '',
    tiktok: '',
    threads: '',
    youtube: '',
    linkedin: '',
    twitter: '',
  },
  // Opciones de mensajería
  messagingOptions: {
    email: true,
    alerts: true,
    sms: false,
    whatsappBusiness: false,
  },
}

// --- Reducer para manejar el estado del formulario de forma organizada ---
function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      // Maneja campos anidados como "contactInfo.email" o "location.state"
      const keys = action.field.split('.')
      if (keys.length > 1) {
        return {
          ...state,
          [keys[0]]: {
            ...state[keys[0]],
            [keys[1]]: action.value,
          },
        }
      }
      return { ...state, [action.field]: action.value }
    case 'SET_FORM_DATA': // Nuevo caso para precargar todo el formulario
      return { ...state, ...action.payload }
    case 'RESET_FORM':
      return initialState
    default:
      return state
  }
}

// --- Componente principal de la página ---
export default function NuevaCampanaPage() {
  const { user, idToken } = useAuth()
  const [formData, dispatch] = useReducer(formReducer, initialState)
  const [currentStep, setCurrentStep] = useState(1)

  // Estados para la UI
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })

  // Estados para previsualización de imágenes
  const [logoPreview, setLogoPreview] = useState('')
  const [bannerPreview, setBannerPreview] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)

  // Estados para datos de ubicación
  const [departamentos, setDepartamentos] = useState([])
  const [ciudades, setCiudades] = useState([])
  const [candidateCiudades, setCandidateCiudades] = useState([])

  // Estados para listas de tipos de campaña y planes de precios
  const [campaignTypesList, setCampaignTypesList] = useState([])
  const [pricingPlansList, setPricingPlansList] = useState([])
  const [loadingLists, setLoadingLists] = useState(true)

  // Estados para la búsqueda de usuario por cédula
  const [foundUser, setFoundUser] = useState(null)
  const [isSearching, setIsSearching] = useState(false)
  const debounceTimeoutRef = useRef(null)

  // URL de tus Firebase Functions desde variables de entorno
  const CREATE_CAMPAIGN_URL = process.env.NEXT_PUBLIC_CREATE_CAMPAIGN_URL
  const GET_DEPARTMENTS_URL = process.env.NEXT_PUBLIC_GET_DEPARTMENTS_URL
  const GET_CITIES_BY_DEPARTMENT_URL =
    process.env.NEXT_PUBLIC_GET_CITIES_BY_DEPARTMENT_URL
  const GET_USER_BY_CEDULA_URL = process.env.NEXT_PUBLIC_GET_USER_BY_CEDULA_URL
  const GET_PUBLIC_CAMPAIGN_TYPES_URL =
    process.env.NEXT_PUBLIC_FN_GET_PUBLIC_CAMPAIGN_TYPES_URL
  const GET_PUBLIC_PRICING_PLANS_URL =
    process.env.NEXT_PUBLIC_FN_GET_PUBLIC_PRICING_PLANS_URL

  // --- Carga inicial de listas de departamentos, tipos de campaña y planes de precios ---
  useEffect(() => {
    const fetchLists = async () => {
      setLoadingLists(true)
      try {
        // Fetch Departamentos
        if (!GET_DEPARTMENTS_URL)
          throw new Error('URL para departamentos no configurada.')
        const departmentsRes = await fetch(GET_DEPARTMENTS_URL)
        if (!departmentsRes.ok)
          throw new Error('Error al cargar departamentos.')
        const departmentsData = await departmentsRes.json()
        setDepartamentos(departmentsData)

        // Fetch Tipos de Campaña
        if (!GET_PUBLIC_CAMPAIGN_TYPES_URL)
          throw new Error('URL para tipos de campaña no configurada.')
        const campaignTypesRes = await fetch(GET_PUBLIC_CAMPAIGN_TYPES_URL)
        if (!campaignTypesRes.ok)
          throw new Error('Error al cargar tipos de campaña.')
        const campaignTypesData = await campaignTypesRes.json()
        setCampaignTypesList(
          campaignTypesData.filter((type) => type.active) || [],
        )

        // Fetch Planes de Precios
        if (!GET_PUBLIC_PRICING_PLANS_URL)
          throw new Error('URL para planes de precios no configurada.')
        const pricingPlansRes = await fetch(GET_PUBLIC_PRICING_PLANS_URL)
        if (!pricingPlansRes.ok)
          throw new Error('Error al cargar planes de precios.')
        const pricingPlansData = await pricingPlansRes.json()
        setPricingPlansList(pricingPlansData || [])
      } catch (err) {
        setMessage({
          text: `Error al cargar listas: ${err.message}`,
          type: 'error',
        })
        console.error('Error fetching initial lists:', err)
      } finally {
        setLoadingLists(false)
      }
    }

    fetchLists()
  }, [
    GET_DEPARTMENTS_URL,
    GET_PUBLIC_CAMPAIGN_TYPES_URL,
    GET_PUBLIC_PRICING_PLANS_URL,
  ])

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    const fieldValue =
      type === 'checkbox'
        ? checked
        : type === 'number'
          ? parseFloat(value)
          : value

    dispatch({
      type: 'UPDATE_FIELD',
      field: name,
      value: fieldValue,
    })

    if (name === 'candidateCedula') {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current)
      }
      debounceTimeoutRef.current = setTimeout(() => {
        if (value.trim().length >= 7) {
          handleCedulaSearch(value.trim())
        } else {
          setFoundUser(null)
          setIsSearching(false)
          setMessage({ text: '', type: '' })
        }
      }, 500)
    }
  }

  const handleCedulaSearch = useCallback(
    async (cedula) => {
      setIsSearching(true)
      setFoundUser(null)
      setMessage({ text: '', type: '' })

      try {
        if (!GET_USER_BY_CEDULA_URL) {
          throw new Error('URL para buscar usuario por cédula no configurada.')
        }
        const response = await fetch(
          `${GET_USER_BY_CEDULA_URL}?cedula=${cedula}`,
        )
        if (!response.ok) {
          throw new Error('Error al buscar usuario por cédula.')
        }
        const result = await response.json()

        if (result.user) {
          setFoundUser(result.user)
          setMessage({
            text: `✅ Usuario encontrado: ${result.user.name} (${result.user.email}).`,
            type: 'success',
          })
        } else {
          setMessage({
            text: 'ℹ️ No se encontró ningún usuario con esa cédula. Puedes registrar uno nuevo.',
            type: 'info',
          })
        }
      } catch (error) {
        console.error('Error en handleCedulaSearch:', error)
        setMessage({
          text: `❌ Error al buscar usuario: ${error.message}`,
          type: 'error',
        })
      } finally {
        setIsSearching(false)
      }
    },
    [GET_USER_BY_CEDULA_URL],
  )

  const handlePreloadUser = useCallback(() => {
    if (foundUser) {
      dispatch({
        type: 'SET_FORM_DATA',
        payload: {
          ...formData,
          candidateName: foundUser.name || '',
          candidateEmail: foundUser.email || '',
          whatsapp: foundUser.whatsapp || '',
          phone: foundUser.phone || '',
          sexo: foundUser.sexo || '',
          dateBirth: foundUser.dateBirth
            ? foundUser.dateBirth.split('T')[0]
            : '',
          candidateLocation: {
            country: foundUser.location?.country || 'Colombia',
            state: foundUser.location?.state || '',
            city: foundUser.location?.city || '',
          },
          puestoVotacion: foundUser.location?.votingStation || '',
        },
      })
      setMessage({
        text: '✅ Datos del usuario precargados. Revisa y completa la información.',
        type: 'success',
      })
      setFoundUser(null)
    }
  }, [foundUser, formData])

  const handleFileChange = (setter, previewSetter, file) => {
    if (file && file.type.startsWith('image/')) {
      setter(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        previewSetter(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImageToStorage = async (file) => {
    console.log(`Simulando subida de ${file.name}...`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return `https://placehold.co/1200x300/000000/FFFFFF?text=${encodeURIComponent(file.name)}`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      // 1. Validar que planId ha sido seleccionado
      if (!formData.planId) {
        throw new Error('Por favor, selecciona un plan de campaña.')
      }

      // --- NUEVA LÓGICA AQUÍ: Obtener nombre y precio del plan seleccionado ---
      const selectedPlan = pricingPlansList.find(
        (plan) => plan.id === formData.planId,
      )
      if (!selectedPlan) {
        throw new Error('El plan de campaña seleccionado no es válido.')
      }
      const planNameToSend = selectedPlan.name
      const planPriceToSend = selectedPlan.price
      // --- FIN NUEVA LÓGICA ---

      // 2. Subir imágenes si existen
      let logoUrl = ''
      let bannerUrl = ''
      if (logoFile) {
        logoUrl = await uploadImageToStorage(logoFile)
      }
      if (bannerFile) {
        bannerUrl = await uploadImageToStorage(bannerFile)
      }

      // 3. Preparar el payload final para la API
      const finalPayload = {
        campaignName: formData.campaignName,
        type: formData.type,
        scope: formData.scope,
        // ¡CAMBIO AQUÍ! Enviar planName y planPrice en lugar de planId
        planName: planNameToSend,
        planPrice: planPriceToSend,
        discountPercentage: formData.discountPercentage,

        candidateName: formData.candidateName,
        candidateCedula: formData.candidateCedula,
        candidateEmail: formData.candidateEmail,
        candidatePassword: formData.candidatePassword,
        whatsapp: formData.whatsapp,
        phone: formData.phone,
        sexo: formData.sexo,
        dateBirth: formData.dateBirth,
        puestoVotacion: formData.puestoVotacion,

        location: {
          country: formData.location.country,
          state: formData.location.state,
          city: formData.location.city,
        },
        candidateLocation: {
          country: formData.candidateLocation.country,
          state: formData.candidateLocation.state,
          city: formData.candidateLocation.city,
        },
        contactInfo: {
          email: formData.contactInfo.email,
          phone: formData.contactInfo.phone,
          whatsapp: formData.contactInfo.whatsapp,
          web: formData.contactInfo.web,
          supportEmail: formData.contactInfo.supportEmail,
          supportWhatsapp: formData.contactInfo.supportWhatsapp,
        },
        media: {
          logoUrl: logoUrl,
          bannerUrl: bannerUrl,
        },
        socialLinks: {
          facebook: formData.socialLinks.facebook,
          instagram: formData.socialLinks.instagram,
          tiktok: formData.socialLinks.tiktok,
          threads: formData.socialLinks.threads,
          youtube: formData.socialLinks.youtube,
          linkedin: formData.socialLinks.linkedin,
          twitter: formData.socialLinks.twitter,
        },
        messagingOptions: {
          email: formData.messagingOptions.email,
          alerts: formData.messagingOptions.alerts,
          sms: formData.messagingOptions.sms,
          whatsappBusiness: formData.messagingOptions.whatsappBusiness,
        },
      }

      const createCampaignUrl = CREATE_CAMPAIGN_URL
      if (!createCampaignUrl) {
        throw new Error(
          'La URL para crear campañas no está configurada en las variables de entorno.',
        )
      }

      const response = await fetch(createCampaignUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalPayload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(
          result.message ||
            'Ocurrió un error en el servidor al crear la campaña.',
        )
      }

      setMessage({
        text: `¡Éxito! Campaña "${finalPayload.campaignName}" creada.`,
        type: 'success',
      })
      dispatch({ type: 'RESET_FORM' })
      setLogoPreview('')
      setBannerPreview('')
      setLogoFile(null)
      setBannerFile(null)
      setCurrentStep(1)
    } catch (error) {
      console.error('Error en handleSubmit:', error)
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  const nextStep = () => setCurrentStep((prev) => prev + 1)
  const prevStep = () => setCurrentStep((prev) => prev - 1)

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative max-w-lg text-center"
          role="alert"
        >
          <strong className="font-bold block">Acceso Denegado</strong>
          <span className="block sm:inline">
            No tienes los permisos necesarios para acceder a esta sección.
          </span>
        </div>
      </div>
    )
  }

  if (loadingLists) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-700">Cargando datos iniciales...</p>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <CampaignInfoStep
            formData={formData}
            handleInputChange={handleInputChange}
            departamentos={departamentos}
            ciudades={ciudades}
            setDepartamentos={setDepartamentos}
            setCiudades={setCiudades}
            setMessage={setMessage}
            dispatch={dispatch}
            GET_DEPARTMENTS_URL={GET_DEPARTMENTS_URL}
            GET_CITIES_BY_DEPARTMENT_URL={GET_CITIES_BY_DEPARTMENT_URL}
            campaignTypesList={campaignTypesList}
            pricingPlansList={pricingPlansList}
          />
        )
      case 2:
        return (
          <CandidateInfoStep
            formData={formData}
            handleInputChange={handleInputChange}
            departamentos={departamentos}
            candidateCiudades={candidateCiudades}
            setCandidateCiudades={setCandidateCiudades}
            setMessage={setMessage}
            dispatch={dispatch}
            GET_CITIES_BY_DEPARTMENT_URL={GET_CITIES_BY_DEPARTMENT_URL}
            GET_USER_BY_CEDULA_URL={GET_USER_BY_CEDULA_URL}
            foundUser={foundUser}
            isSearching={isSearching}
            handleCedulaSearch={handleCedulaSearch}
            handlePreloadUser={handlePreloadUser}
          />
        )
      case 3:
        return (
          <MediaMessagingStep
            formData={formData}
            handleInputChange={handleInputChange}
            setLogoFile={setLogoFile}
            setBannerFile={setBannerFile}
            logoPreview={logoPreview}
            bannerPreview={bannerPreview}
            handleFileChange={handleFileChange}
            setLogoPreview={setLogoPreview}
            setBannerPreview={setBannerPreview}
          />
        )
      default:
        return null
    }
  }

  const steps = [
    { id: 1, name: 'Campaña', icon: CampaignIcon },
    { id: 2, name: 'Candidato', icon: UserIcon },
    { id: 3, name: 'Media', icon: MediaIcon },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Crear Nueva Campaña
        </h1>
        <p className="text-gray-600 mb-8">
          Sigue los pasos para configurar todos los detalles de la campaña.
        </p>

        {/* --- Indicador de Pasos (Stepper) --- */}
        <nav aria-label="Progress">
          <ol role="list" className="flex items-center mb-12">
            {steps.map((step, stepIdx) => (
              <li
                key={step.name}
                className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}
              >
                {currentStep > step.id ? (
                  <>
                    <div
                      className="absolute inset-0 flex items-center"
                      aria-hidden="true"
                    >
                      <div className="h-0.5 w-full bg-blue-600" />
                    </div>
                    <button
                      onClick={() => setCurrentStep(step.id)}
                      className="relative w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full hover:bg-blue-700"
                    >
                      <CheckCircleIconStep className="w-8 h-8 text-white" />
                      <span className="sr-only">{step.name}</span>
                    </button>
                  </>
                ) : currentStep === step.id ? (
                  <>
                    <div
                      className="absolute inset-0 flex items-center"
                      aria-hidden="true"
                    >
                      <div className="h-0.5 w-full bg-gray-200" />
                    </div>
                    <div
                      className="relative w-10 h-10 flex items-center justify-center bg-white border-2 border-blue-600 rounded-full"
                      aria-current="step"
                    >
                      <span className="text-blue-600">
                        <step.icon />
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div
                      className="absolute inset-0 flex items-center"
                      aria-hidden="true"
                    >
                      <div className="h-0.5 w-full bg-gray-200" />
                    </div>
                    <div className="group relative w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full hover:border-gray-400">
                      <span className="text-gray-500 group-hover:text-gray-900">
                        <step.icon />
                      </span>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="bg-white p-8 rounded-xl shadow-lg">
          <form onSubmit={handleSubmit}>
            {renderStep()}

            {/* --- Notificaciones --- */}
            {message.text && (
              <div
                className={`mt-6 p-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}
              >
                {message.text}
              </div>
            )}

            {/* --- Botones de Navegación --- */}
            <div className="mt-8 pt-5">
              <div className="flex justify-between">
                <button
                  type="button"
                  onClick={prevStep}
                  disabled={currentStep === 1 || loading}
                  className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={nextStep}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Siguiente
                    <ArrowRightIcon />
                  </button>
                ) : (
                  <button
                    type="submit"
                    disabled={loading}
                    className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:bg-green-400"
                  >
                    {loading
                      ? 'Creando Campaña...'
                      : 'Finalizar y Crear Campaña'}
                  </button>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
