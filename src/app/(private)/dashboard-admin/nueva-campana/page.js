// src/app/(private)/dashboard-admin/nueva-campana/page.js
'use client'

import React, { useState, useReducer } from 'react'
// Corregido: Se usa la ruta relativa para asegurar que el compilador encuentre el contexto.
import { useAuth } from '../../../../context/AuthContext'

// --- Iconos SVG para una UI más rica ---
const CampaignIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-2.236 9.168-5.514M15 11l-1 1"
    />
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
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
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
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
    />
  </svg>
)
const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-green-500"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
    />
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
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14 5l7 7m0 0l-7 7m7-7H3"
    />
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
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
    />
  </svg>
)

// --- Estado inicial del formulario, basado en el JSON de Postman ---
const initialState = {
  campaignName: '',
  type: 'concejo',
  scope: 'municipal',
  location: { department: 'Bogota', city: 'Bogota' },
  candidateName: '',
  candidateCedula: '',
  candidateEmail: '',
  candidatePassword: '',
  candidateLocation: { department: 'Bogota', city: 'Bogota' },
  contactInfo: { email: '', phone: '' },
  media: { logoUrl: '', bannerUrl: '' },
  socialLinks: { facebook: '', instagram: '' },
}

// --- Reducer para manejar el estado del formulario de forma organizada ---
function formReducer(state, action) {
  switch (action.type) {
    case 'UPDATE_FIELD':
      // Maneja campos anidados como "contactInfo.email"
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
    case 'RESET_FORM':
      return initialState
    default:
      return state
  }
}

// --- Componente para subir imágenes con Drag-and-Drop y previsualización ---
function ImageUploader({ label, onFileChange, preview }) {
  const [isDragging, setIsDragging] = useState(false)

  const handleDragEnter = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }
  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }
  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
  }
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      onFileChange(e.dataTransfer.files[0])
      e.dataTransfer.clearData()
    }
  }

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileChange(e.target.files[0])
    }
  }

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} border-dashed rounded-md transition-colors duration-200`}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-32 w-auto object-contain rounded-md"
          />
        ) : (
          <div className="space-y-1 text-center">
            <UploadIcon />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor={`file-upload-${label}`}
                className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
              >
                <span>Sube un archivo</span>
                <input
                  id={`file-upload-${label}`}
                  name={`file-upload-${label}`}
                  type="file"
                  className="sr-only"
                  onChange={handleFileChange}
                  accept="image/*"
                />
              </label>
              <p className="pl-1">o arrástralo aquí</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF hasta 10MB</p>
          </div>
        )}
      </div>
    </div>
  )
}

// --- Componente principal de la página ---
export default function NuevaCampanaPage() {
  const { user } = useAuth()
  const [formData, dispatch] = useReducer(formReducer, initialState)
  const [currentStep, setCurrentStep] = useState(1)

  // Estados para la UI
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' }) // 'success' o 'error'

  // Estados para previsualización de imágenes
  const [logoPreview, setLogoPreview] = useState('')
  const [bannerPreview, setBannerPreview] = useState('')
  const [logoFile, setLogoFile] = useState(null)
  const [bannerFile, setBannerFile] = useState(null)

  const handleInputChange = (e) => {
    dispatch({
      type: 'UPDATE_FIELD',
      field: e.target.name,
      value: e.target.value,
    })
  }

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
    // IMPORTANTE: Aquí debes implementar tu lógica real para subir la imagen a Firebase Storage.
    // 1. Obtener una referencia en Storage: ref(storage, `campaign_images/${Date.now()}_${file.name}`)
    // 2. Subir el archivo: uploadBytes(storageRef, file)
    // 3. Obtener la URL de descarga: getDownloadURL(snapshot.ref)
    console.log(`Simulando subida de ${file.name}...`)
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // Esta es una URL de ejemplo. Debes reemplazarla con la URL real de Firebase.
    return `https://firebasestorage.googleapis.com/v0/b/micampanav2.appspot.com/o/images%2Fplaceholder.jpg?alt=media`
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMessage({ text: '', type: '' })

    try {
      // 1. Subir imágenes si existen
      let logoUrl = ''
      let bannerUrl = ''
      if (logoFile) {
        logoUrl = await uploadImageToStorage(logoFile)
      }
      if (bannerFile) {
        bannerUrl = await uploadImageToStorage(bannerFile)
      }

      // 2. Preparar el payload final para la API
      const finalPayload = {
        ...formData,
        media: {
          logoUrl: logoUrl,
          bannerUrl: bannerUrl,
        },
      }

      // 3. Obtener la URL de la función desde las variables de entorno
      const createCampaignUrl = process.env.NEXT_PUBLIC_CREATE_CAMPAIGN_URL
      if (!createCampaignUrl) {
        throw new Error(
          'La URL para crear campañas no está configurada en las variables de entorno.',
        )
      }

      // 4. Enviar los datos a la Cloud Function
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

      // 5. Éxito
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

  // --- Renderizado condicional basado en permisos ---
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

  const renderStep = () => {
    switch (currentStep) {
      case 1:
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
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
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
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="concejo">Concejo</option>
                  <option value="senado">Senado</option>
                  <option value="alcaldia">Alcaldía</option>
                  <option value="gobernacion">Gobernación</option>
                </select>
              </div>
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
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
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
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        )
      case 2:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Datos del Candidato
            </h3>
            <div>
              <label
                htmlFor="candidateName"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre Completo del Candidato *
              </label>
              <input
                type="text"
                name="candidateName"
                id="candidateName"
                value={formData.candidateName}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="candidateCedula"
                  className="block text-sm font-medium text-gray-700"
                >
                  Cédula del Candidato *
                </label>
                <input
                  type="text"
                  name="candidateCedula"
                  id="candidateCedula"
                  value={formData.candidateCedula}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label
                  htmlFor="candidateEmail"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email del Candidato (para login) *
                </label>
                <input
                  type="email"
                  name="candidateEmail"
                  id="candidateEmail"
                  value={formData.candidateEmail}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                />
              </div>
            </div>
            <div>
              <label
                htmlFor="candidatePassword"
                className="block text-sm font-medium text-gray-700"
              >
                Contraseña Inicial para el Candidato *
              </label>
              <input
                type="password"
                name="candidatePassword"
                id="candidatePassword"
                value={formData.candidatePassword}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        )
      case 3:
        return (
          <div className="space-y-6 animate-fade-in">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Identidad Visual y Redes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <ImageUploader
                label="Logo de la Campaña"
                onFileChange={(file) =>
                  handleFileChange(setLogoFile, setLogoPreview, file)
                }
                preview={logoPreview}
              />
              <ImageUploader
                label="Banner de la Campaña"
                onFileChange={(file) =>
                  handleFileChange(setBannerFile, setBannerPreview, file)
                }
                preview={bannerPreview}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="socialLinks.facebook"
                  className="block text-sm font-medium text-gray-700"
                >
                  URL Facebook
                </label>
                <input
                  type="url"
                  name="socialLinks.facebook"
                  id="socialLinks.facebook"
                  value={formData.socialLinks.facebook}
                  onChange={handleInputChange}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://facebook.com/..."
                />
              </div>
              <div>
                <label
                  htmlFor="socialLinks.instagram"
                  className="block text-sm font-medium text-gray-700"
                >
                  URL Instagram
                </label>
                <input
                  type="url"
                  name="socialLinks.instagram"
                  id="socialLinks.instagram"
                  value={formData.socialLinks.instagram}
                  onChange={handleInputChange}
                  className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  placeholder="https://instagram.com/..."
                />
              </div>
            </div>
          </div>
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
                      <CheckCircleIcon className="w-8 h-8 text-white" />
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
