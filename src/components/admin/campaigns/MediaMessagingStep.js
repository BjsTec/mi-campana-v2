// src/components/admin/campaigns/MediaMessagingStep.js
import React from 'react'

// Iconos SVG para la UI
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

const ImageUploader = ({ label, onFileChange, preview, setPreview }) => {
  const [isDragging, setIsDragging] = React.useState(false)
  
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
  
  const handleRemovePreview = () => {
    setPreview(null);
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
          <>
            <img
              src={preview}
              alt="Preview"
              className="h-32 w-auto object-contain rounded-md"
            />
            <button
              type="button"
              onClick={handleRemovePreview}
              className="absolute top-2 right-2 rounded-full bg-red-600 text-white p-1 hover:bg-red-700"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </>
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

const MediaMessagingStep = ({
  formData,
  handleInputChange,
  setLogoFile,
  setBannerFile,
  logoPreview,
  bannerPreview,
  handleFileChange,
  setLogoPreview,
  setBannerPreview,
}) => {
  return (
    <div className="space-y-6 animate-fade-in">
      <h3 className="text-lg font-medium leading-6 text-gray-900">
        Identidad Visual y Redes
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <ImageUploader
          label="Logo de la Campaña"
          onFileChange={(file) => handleFileChange(setLogoFile, setLogoPreview, file)}
          preview={logoPreview}
          setPreview={setLogoPreview}
        />
        <ImageUploader
          label="Banner de la Campaña"
          onFileChange={(file) => handleFileChange(setBannerFile, setBannerPreview, file)}
          preview={bannerPreview}
          setPreview={setBannerPreview}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="socialLinks.facebook" className="block text-sm font-medium text-gray-700">
            URL Facebook
          </label>
          <input
            type="url"
            name="socialLinks.facebook"
            id="socialLinks.facebook"
            value={formData.socialLinks.facebook}
            onChange={handleInputChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            placeholder="https://facebook.com/..."
          />
        </div>
        <div>
          <label htmlFor="socialLinks.instagram" className="block text-sm font-medium text-gray-700">
            URL Instagram
          </label>
          <input
            type="url"
            name="socialLinks.instagram"
            id="socialLinks.instagram"
            value={formData.socialLinks.instagram}
            onChange={handleInputChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            placeholder="https://instagram.com/..."
          />
        </div>
        <div>
          <label htmlFor="socialLinks.tiktok" className="block text-sm font-medium text-gray-700">
            URL TikTok
          </label>
          <input
            type="url"
            name="socialLinks.tiktok"
            id="socialLinks.tiktok"
            value={formData.socialLinks.tiktok}
            onChange={handleInputChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            placeholder="https://tiktok.com/..."
          />
        </div>
        <div>
          <label htmlFor="socialLinks.threads" className="block text-sm font-medium text-gray-700">
            URL Threads
          </label>
          <input
            type="url"
            name="socialLinks.threads"
            id="socialLinks.threads"
            value={formData.socialLinks.threads}
            onChange={handleInputChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            placeholder="https://threads.net/..."
          />
        </div>
        <div>
          <label htmlFor="socialLinks.youtube" className="block text-sm font-medium text-gray-700">
            URL YouTube
          </label>
          <input
            type="url"
            name="socialLinks.youtube"
            id="socialLinks.youtube"
            value={formData.socialLinks.youtube}
            onChange={handleInputChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            placeholder="https://youtube.com/..."
          />
        </div>
        <div>
          <label htmlFor="socialLinks.linkedin" className="block text-sm font-medium text-gray-700">
            URL LinkedIn
          </label>
          <input
            type="url"
            name="socialLinks.linkedin"
            id="socialLinks.linkedin"
            value={formData.socialLinks.linkedin}
            onChange={handleInputChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            placeholder="https://linkedin.com/in/..."
          />
        </div>
        <div>
          <label htmlFor="socialLinks.twitter" className="block text-sm font-medium text-gray-700">
            URL Twitter
          </label>
          <input
            type="url"
            name="socialLinks.twitter"
            id="socialLinks.twitter"
            value={formData.socialLinks.twitter}
            onChange={handleInputChange}
            className="mt-1 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md text-gray-900"
            placeholder="https://twitter.com/..."
          />
        </div>
      </div>
      <div className="space-y-4">
        <h4 className="text-md font-medium text-gray-900">
          Opciones de Mensajería
        </h4>
        <div className="flex items-center">
          <input
            id="messagingOptions.email"
            name="messagingOptions.email"
            type="checkbox"
            checked={formData.messagingOptions.email}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="messagingOptions.email" className="ml-2 block text-sm text-gray-900">
            Envío de Emails a Votantes
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="messagingOptions.alerts"
            name="messagingOptions.alerts"
            type="checkbox"
            checked={formData.messagingOptions.alerts}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="messagingOptions.alerts" className="ml-2 block text-sm text-gray-900">
            Alertas Internas
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="messagingOptions.sms"
            name="messagingOptions.sms"
            type="checkbox"
            checked={formData.messagingOptions.sms}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="messagingOptions.sms" className="ml-2 block text-sm text-gray-900">
            Envío de SMS
          </label>
        </div>
        <div className="flex items-center">
          <input
            id="messagingOptions.whatsappBusiness"
            name="messagingOptions.whatsappBusiness"
            type="checkbox"
            checked={formData.messagingOptions.whatsappBusiness}
            onChange={handleInputChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="messagingOptions.whatsappBusiness" className="ml-2 block text-sm text-gray-900">
            Envío por WhatsApp Business
          </label>
        </div>
      </div>
    </div>
  )
}

export default MediaMessagingStep