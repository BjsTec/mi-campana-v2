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
import { useRouter } from 'next/navigation'

// Importar los componentes modulares
import CampaignInfoStep from '@/components/admin/campaigns/CampaignInfoStep'
import CandidateInfoStep from '@/components/admin/campaigns/CandidateInfoStep'
import MediaMessagingStep from '@/components/admin/campaigns/MediaMessagingStep'
// Importación del nuevo componente
import CampaignSuccessStep from '@/components/admin/campaigns/CampaignSuccessStep'

// Iconos SVG para la UI (usando Heroicons para consistencia)
import {
  BriefcaseIcon,
  UserIcon,
  PhotoIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline'

// Estado inicial del formulario
const initialState = {
  campaignName: '',
  type: '',
  planId: '',
  discountPercentage: '',
  candidateName: '',
  candidateCedula: '',
  candidateEmail: '',
  candidatePassword: '',
  whatsapp: '',
  phone: '',
  sexo: '',
  dateBirth: '',
  puestoVotacion: '',
  location: {
    country: 'Colombia',
    state: '',
    city: '',
  },
  candidateLocation: {
    country: 'Colombia',
    state: '',
    city: '',
  },
  contactInfo: {
    email: '',
    phone: '',
    whatsapp: '',
    web: '',
    supportEmail: '',
    supportWhatsapp: '',
  },
  socialLinks: {
    facebook: '',
    instagram: '',
    tiktok: '',
    threads: '',
    youtube: '',
    linkedin: '',
    twitter: '',
  },
  messagingOptions: {
    email: true,
    alerts: true,
    sms: false,
    whatsappBusiness: false,
  },
}

// Reducer para manejar el estado del formulario de forma organizada
function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
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
    case 'SET_FORM_DATA':
      return { ...state, ...action.payload }
    case 'RESET_FORM':
      return initialState
    default:
      return state
  }
}

// Componente principal de la página
export default function NuevaCampanaPage() {
  const { user, idToken } = useAuth()
  const router = useRouter()
  const [formData, dispatch] = useReducer(formReducer, initialState)
  const [currentStep, setCurrentStep] = useState(1)

  // Estados para la UI
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [validationErrors, setValidationErrors] = useState({})
  
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

  // NUEVO ESTADO: para la pantalla de éxito y los datos de la respuesta
  const [showSuccessScreen, setShowSuccessScreen] = useState(false)
  const [successData, setSuccessData] = useState({})

  // URL de tus Firebase Functions desde variables de entorno
  const CREATE_CAMPAIGN_URL = process.env.NEXT_PUBLIC_CREATE_CAMPAIGN_URL
  const GET_DEPARTMENTS_URL = process.env.NEXT_PUBLIC_GET_DEPARTMENTS_URL
  const GET_CITIES_BY_DEPARTMENT_URL =
    process.env.NEXT_PUBLIC_GET_CITIES_BY_DEPARTMENT_URL
  const GET_USER_BY_CEDULA_URL = process.env.NEXT_PUBLIC_GET_USER_BY_CEDULA_URL
  const GET_PUBLIC_CAMPAIGN_TYPES_URL =
    process.env.NEXT_PUBLIC_GET_PUBLIC_CAMPAIGN_TYPES_URL
  const GET_PUBLIC_PRICING_PLANS_URL =
    process.env.NEXT_PUBLIC_GET_PUBLIC_PRICING_PLANS_URL
  
  // Carga inicial de listas
  useEffect(() => {
    const fetchLists = async () => {
      setLoadingLists(true)
      try {
        const [departmentsRes, campaignTypesRes, pricingPlansRes] =
          await Promise.all([
            fetch(GET_DEPARTMENTS_URL),
            fetch(GET_PUBLIC_CAMPAIGN_TYPES_URL),
            fetch(GET_PUBLIC_PRICING_PLANS_URL),
          ])

        const [departmentsData, campaignTypesData, pricingPlansData] =
          await Promise.all([
            departmentsRes.json(),
            campaignTypesRes.json(),
            pricingPlansRes.json(),
          ])

        setDepartamentos(departmentsData || [])
        setCampaignTypesList(
          (campaignTypesData || []).filter((type) => type.active) || [],
        )
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
    
    dispatch({ type: 'UPDATE_FIELD', field: name, value: fieldValue })
    setValidationErrors({ ...validationErrors, [name]: '' })
  }

  // Lógica para manejar cambios en archivos
  const handleFileChange = (setter, previewSetter, file) => {
    if (file && file.type.startsWith('image/')) {
      setter(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        previewSetter(reader.result)
      }
      reader.readAsDataURL(file)
    } else {
      setter(null)
      previewSetter(null)
    }
  }

  const validateStep = () => {
    let errors = {};
    if (currentStep === 1) {
      if (!formData.campaignName) errors.campaignName = 'El nombre de la campaña es obligatorio.';
      if (!formData.type) errors.type = 'Debes seleccionar un tipo de campaña.';
      if (!formData.planId) errors.planId = 'Debes seleccionar un plan de campaña.';
      if (!formData.location.state) errors['location.state'] = 'El departamento es obligatorio.';
      if (!formData.location.city) errors['location.city'] = 'La ciudad es obligatoria.';
      if (!formData.contactInfo.email) errors['contactInfo.email'] = 'El email de contacto es obligatorio.';
      if (!formData.contactInfo.phone) errors['contactInfo.phone'] = 'El teléfono de contacto es obligatorio.';
    } else if (currentStep === 2) {
      if (!formData.candidateName) errors.candidateName = 'El nombre del candidato es obligatorio.';
      if (!formData.candidateCedula) errors.candidateCedula = 'La cédula es obligatoria.';
      if (!formData.candidateEmail) errors.candidateEmail = 'El email del candidato es obligatorio.';
      if (!formData.candidatePassword) errors.candidatePassword = 'La contraseña es obligatoria.';
      if (!formData.sexo) errors.sexo = 'El sexo es obligatorio.';
      if (!formData.dateBirth) errors.dateBirth = 'La fecha de nacimiento es obligatoria.';
      if (!formData.candidateLocation.state) errors['candidateLocation.state'] = 'El departamento es obligatorio.';
      if (!formData.candidateLocation.city) errors['candidateLocation.city'] = 'La ciudad es obligatoria.';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };
  
  const validateFinalSubmission = () => {
    let errors = {};
    // Validación del Paso 1
    if (!formData.campaignName) errors.campaignName = 'El nombre de la campaña es obligatorio.';
    if (!formData.type) errors.type = 'Debes seleccionar un tipo de campaña.';
    if (!formData.planId) errors.planId = 'Debes seleccionar un plan de campaña.';
    if (!formData.location.state) errors['location.state'] = 'El departamento es obligatorio.';
    if (!formData.location.city) errors['location.city'] = 'La ciudad es obligatoria.';
    if (!formData.contactInfo.email) errors['contactInfo.email'] = 'El email de contacto es obligatorio.';
    if (!formData.contactInfo.phone) errors['contactInfo.phone'] = 'El teléfono de contacto es obligatorio.';
    
    // Validación del Paso 2
    if (!formData.candidateName) errors.candidateName = 'El nombre del candidato es obligatorio.';
    if (!formData.candidateCedula) errors.candidateCedula = 'La cédula es obligatoria.';
    if (!formData.candidateEmail) errors.candidateEmail = 'El email del candidato es obligatorio.';
    if (!formData.candidatePassword) errors.candidatePassword = 'La contraseña es obligatoria.';
    if (!formData.sexo) errors.sexo = 'El sexo es obligatorio.';
    if (!formData.dateBirth) errors.dateBirth = 'La fecha de nacimiento es obligatoria.';
    if (!formData.candidateLocation.state) errors['candidateLocation.state'] = 'El departamento es obligatorio.';
    if (!formData.candidateLocation.city) errors['candidateLocation.city'] = 'La ciudad es obligatoria.';

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }

  const handleNextStep = () => {
    if (validateStep()) {
      setCurrentStep(currentStep + 1);
      setMessage({ text: '', type: '' });
    } else {
      setMessage({ text: 'Por favor, completa los campos obligatorios.', type: 'error' });
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
    setMessage({ text: '', type: '' });
    setValidationErrors({});
  };

  const uploadImageToStorage = async (file) => {
    console.log(`Simulando subida de ${file.name}...`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    return `https://placehold.co/1200x300/000000/FFFFFF?text=${encodeURIComponent(file.name)}`
  }

  const handleCreateAnotherCampaign = () => {
    dispatch({ type: 'RESET_FORM' });
    setLogoPreview('');
    setBannerPreview('');
    setLogoFile(null);
    setBannerFile(null);
    setCurrentStep(1);
    setShowSuccessScreen(false);
    setSuccessData({});
    setMessage({ text: '', type: '' });
  };

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault();
    }
    
    if (!validateFinalSubmission()) {
      setMessage({ text: 'Por favor, completa todos los campos obligatorios en los pasos anteriores.', type: 'error' });
      const firstErrorStep = Object.keys(validationErrors).some(k => k.startsWith('campaign')) ? 1 : Object.keys(validationErrors).some(k => k.startsWith('candidate')) ? 2 : 1;
      setCurrentStep(firstErrorStep); 
      return;
    }

    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      if (!formData.planId) {
        throw new Error('Por favor, selecciona un plan de campaña.')
      }

      const selectedPlan = pricingPlansList.find(
        (plan) => plan.id === formData.planId,
      )
      if (!selectedPlan) {
        throw new Error('El plan de campaña seleccionado no es válido.')
      }

      let logoUrl = ''
      let bannerUrl = ''
      if (logoFile) { logoUrl = await uploadImageToStorage(logoFile) }
      if (bannerFile) { bannerUrl = await uploadImageToStorage(bannerFile) }

      const finalPayload = {
        ...formData,
        planName: selectedPlan.name,
        planPrice: selectedPlan.price,
        media: { logoUrl, bannerUrl },
      }

      const createCampaignUrl = CREATE_CAMPAIGN_URL
      if (!createCampaignUrl) {
        throw new Error('La URL para crear campañas no está configurada.')
      }

      const response = await fetch(createCampaignUrl, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(finalPayload),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Ocurrió un error en el servidor al crear la campaña.')
      }

      // NUEVO: Guardamos los datos de éxito en el estado
      setSuccessData({
        campaignName: finalPayload.campaignName,
        candidateName: finalPayload.candidateName,
        candidateCedula: finalPayload.candidateCedula,
        candidatePassword: finalPayload.candidatePassword,
        candidateWhatsappLink: result.candidateWhatsappLink,
        adminWhatsappLink: result.adminWhatsappLink,
      })

      // NUEVO: Mostramos la pantalla de éxito
      setShowSuccessScreen(true)

    } catch (error) {
      console.error('Error en handleSubmit:', error)
      setMessage({ text: error.message, type: 'error' })
    } finally {
      setLoading(false)
    }
  };

  const renderStep = () => {
    // NUEVO: Si showSuccessScreen es true, renderizamos el componente de éxito
    if (showSuccessScreen) {
      return <CampaignSuccessStep 
        campaignName={successData.campaignName}
        candidateName={successData.candidateName}
        candidateCedula={successData.candidateCedula}
        candidatePassword={successData.candidatePassword}
        candidateWhatsappLink={successData.candidateWhatsappLink}
        adminWhatsappLink={successData.adminWhatsappLink}
        onReset={handleCreateAnotherCampaign}
      />
    }

    switch (currentStep) {
      case 1:
        return <CampaignInfoStep
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
          validationErrors={validationErrors}
        />
      case 2:
        return <CandidateInfoStep
          formData={formData}
          handleInputChange={handleInputChange}
          departamentos={departamentos}
          candidateCiudades={candidateCiudades}
          setCandidateCiudades={setCandidateCiudades}
          setMessage={setMessage}
          dispatch={dispatch}
          GET_CITIES_BY_DEPARTMENT_URL={GET_CITIES_BY_DEPARTMENT_URL}
          GET_USER_BY_CEDULA_URL={GET_USER_BY_CEDULA_URL}
          validationErrors={validationErrors}
        />
      case 3:
        return <MediaMessagingStep
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
      default:
        return null
    }
  };
  
  const steps = [
    { id: 1, name: 'Campaña', icon: BriefcaseIcon },
    { id: 2, name: 'Candidato', icon: UserIcon },
    { id: 3, name: 'Media', icon: PhotoIcon },
  ];

  if (!user || user.role !== 'admin') {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-md relative max-w-lg text-center" role="alert">
          <strong className="font-bold block">Acceso Denegado</strong>
          <span className="block sm:inline">No tienes los permisos necesarios para acceder a esta sección.</span>
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

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear Nueva Campaña</h1>
        <p className="text-gray-600 mb-8">Sigue los pasos para configurar todos los detalles de la campaña.</p>

        {/* Ocultar la barra de progreso si la pantalla de éxito está activa */}
        {!showSuccessScreen && (
          <nav aria-label="Progress">
            <ol role="list" className="flex items-center mb-12">
              {steps.map((step, stepIdx) => (
                <li key={step.name} className={`relative ${stepIdx !== steps.length - 1 ? 'pr-8 sm:pr-20' : ''}`}>
                  {currentStep > step.id ? (
                    <>
                      <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="h-0.5 w-full bg-blue-600" /></div>
                      <button onClick={() => setCurrentStep(step.id)} className="relative w-10 h-10 flex items-center justify-center bg-blue-600 rounded-full hover:bg-blue-700">
                        <CheckCircleIcon className="w-8 h-8 text-white" />
                        <span className="sr-only">{step.name}</span>
                      </button>
                    </>
                  ) : currentStep === step.id ? (
                    <>
                      <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="h-0.5 w-full bg-gray-200" /></div>
                      <div className="relative w-10 h-10 flex items-center justify-center bg-white border-2 border-blue-600 rounded-full" aria-current="step">
                        <span className="text-blue-600"><step.icon className="w-6 h-6" /></span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="absolute inset-0 flex items-center" aria-hidden="true"><div className="h-0.5 w-full bg-gray-200" /></div>
                      <div className="group relative w-10 h-10 flex items-center justify-center bg-white border-2 border-gray-300 rounded-full hover:border-gray-400">
                        <span className="text-gray-500 group-hover:text-gray-900"><step.icon className="w-6 h-6" /></span>
                      </div>
                    </>
                  )}
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="bg-white p-8 rounded-xl shadow-lg">
          {showSuccessScreen ? (
            <CampaignSuccessStep 
              campaignName={successData.campaignName}
              candidateName={successData.candidateName}
              candidateCedula={successData.candidateCedula}
              candidatePassword={successData.candidatePassword}
              candidateWhatsappLink={successData.candidateWhatsappLink}
              onReset={handleCreateAnotherCampaign}
            />
          ) : (
            <form onSubmit={handleSubmit}>
              {renderStep()}
              {message.text && (
                <div className={`mt-6 p-4 rounded-md text-sm font-medium ${message.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-700'}`}>
                  {message.text}
                </div>
              )}
              <div className="mt-8 pt-5">
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    disabled={currentStep === 1 || loading}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                  >
                    Anterior
                  </button>
                  {currentStep < steps.length ? (
                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Siguiente
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSubmit}
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
          )}
        </div>
      </div>
    </div>
  )
}