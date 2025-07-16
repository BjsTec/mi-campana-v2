// src/components/campaigns/CampaignDetailDisplay.js
import React from 'react'
import Image from 'next/image'
import Link from 'next/link'

// --- Iconos ---
const InfoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-neutral-500 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)
const LocationIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-neutral-500 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.828 0l-4.243-4.243m0 0A8 8 0 1121 12a8 8 0 01-3.343 4.657z"
    />
  </svg>
)
const PhoneIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-neutral-500 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
    />
  </svg>
)
const MailIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-neutral-500 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8m-2 2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v4m-2 4h18a2 2 0 002-2v-4a2 2 0 00-2-2H3a2 2 0 00-2 2v4a2 2 0 002 2z"
    />
  </svg>
)
const FacebookIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-blue-600 hover:text-blue-700"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2.046c-5.462 0-9.914 4.452-9.914 9.914 0 4.908 3.585 8.956 8.273 9.771v-6.938h-2.316v-2.833h2.316v-2.14c0-2.28 1.348-3.535 3.425-3.535 1.002 0 1.954.178 1.954.178v2.148h-1.096c-1.127 0-1.48.704-1.48 1.428v1.711h2.553l-.412 2.833h-2.141v6.938c4.688-.815 8.273-4.863 8.273-9.771 0-5.462-4.452-9.914-9.914-9.914z" />
  </svg>
)
const InstagramIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-pink-500 hover:text-pink-600"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.779 1.624 4.927 4.927.058 1.266.07 1.646.07 4.85s-.012 3.584-.07 4.85c-.149 3.252-1.624 4.779-4.927 4.927-1.266.058-1.646.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.149-4.779-1.624-4.927-4.927-.058-1.266-.07-1.646-.07-4.85s.012-3.584.07-4.85c.148-3.252 1.624-4.779 4.927-4.927 1.266-.058 1.646-.07 4.85-.07zm0 1.396c-3.136 0-3.51.012-4.755.068-2.616.12-3.86.963-4.004 3.993-.056 1.245-.068 1.618-.068 4.755s.012 3.51.068 4.755c.12 2.616.963 3.86 3.993 4.004 1.245.056 1.618.068 4.755.068s3.51-.012 4.755-.068c2.616-.12 3.86-.963 3.993-3.993.056-1.245.068-1.618.068-4.755s-.012-3.51-.068-4.755c-.12-2.616-.963-3.86-3.993-4.004-1.245-.056-1.618-.068-4.755-.068zm0 4.148c-2.342 0-4.242 1.9-4.242 4.242s1.9 4.242 4.242 4.242 4.242-1.9 4.242-4.242-1.9-4.242-4.242-4.242zm0 1.396c1.564 0 2.846 1.282 2.846 2.846s-1.282 2.846-2.846 2.846-2.846-1.282-2.846-2.846 1.282-2.846 2.846-2.846zm6.273-5.719c-.838 0-1.517.68-1.517 1.517s.68 1.517 1.517 1.517c.838 0 1.517-.68 1.517-1.517s-.679-1.517-1.517-1.517z" />
  </svg>
)
const TwitterIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-blue-400 hover:text-blue-500"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M22.46 6c-.77.34-1.6.57-2.48.69.88-.53 1.56-1.37 1.88-2.39-.83.49-1.76.85-2.75 1.05C18.23 4.2 16.94 3.5 15.48 3.5c-2.9 0-5.25 2.35-5.25 5.25 0 .41.05.81.14 1.19-4.36-.22-8.2-2.3-10.78-5.46-.45.77-.71 1.67-.71 2.64 0 1.83.93 3.45 2.34 4.4-.8-.03-1.56-.25-2.22-.6v.07c0 2.54 1.81 4.66 4.23 5.14-.44.12-.9.18-1.37.18-.33 0-.65-.03-.96-.09.67 2.09 2.61 3.61 4.9 3.65-1.78 1.4-4.03 2.25-6.49 2.25-.42 0-.84-.02-1.25-.07 2.3 1.47 5.04 2.33 7.97 2.33 9.57 0 14.79-7.95 14.79-14.77 0-.22-.01-.43-.01-.65.98-.71 1.83-1.6 2.51-2.61z" />
  </svg>
)
const EditIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 text-neutral-500 hover:text-neutral-700 cursor-pointer ml-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
)
const UsersIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-blue-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M17 20h2a2 2 0 002-2V8a2 2 0 00-2-2h-2M5 18h3.9c.038-.85.292-1.64.747-2.308m-.747 2.308c-.73-.5-1.35-1.1-1.85-1.8m1.85 1.8A5.992 5.992 0 0012 10.5a6 6 0 00-6-6H4a2 2 0 00-2 2v10a2 2 0 002 2h2m4-2a6 6 0 006-6v-2.5a2.5 2.5 0 00-2.5-2.5h-2.5a2.5 2.5 0 00-2.5 2.5V12a2.5 2.5 0 002.5 2.5z"
    />
  </svg>
) // Usando blue-600
const PhotoIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-yellow-500"
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
) // Usando yellow-500
const ActivityIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6 text-green-600"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M13 7h8m0 0v8m0-8L11 2m9 20H4a2 2 0 01-2-2V6a2 2 0 012-2h9l3 3h4a2 2 0 012 2v9a2 2 0 01-2 2z"
    />
  </svg>
)
const BellIcon = () => (
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
      d="M15 17h5l-1.405-1.405A2.003 2.003 0 0118 14.59V13a6.002 6.002 0 00-4-5.659V7a2 2 0 10-4 0v.341C7.67 8.361 6 10.932 6 13v1.59c0 .537-.213 1.055-.595 1.435L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
    />
  </svg>
)

const CampaignDetailDisplay = ({
  campaign,
  isAdminEditable = false,
  onEditCampaignName,
}) => {
  if (!campaign) {
    return (
      <div className="text-center py-8 text-neutral-600">
        No se encontraron datos de la campaña.
      </div>
    )
  }

  const planType = campaign.planType || 'Básico' // Placeholder para planType
  const campaignSlogan = '¡Únete a nuestra causa y haz la diferencia!' // Mockup para eslogan

  return (
    // Se eliminó max-w-6xl mx-auto my-8 de aquí para que el padre controle el ancho
    <div className="bg-neutral-50 rounded-lg shadow-lg border border-neutral-200 overflow-hidden">
      {/* --- Sección Hero / Banner --- */}
      <div className="relative w-full h-48 sm:h-64 lg:h-80 bg-gray-300 flex items-center justify-center">
        {campaign.media?.bannerUrl ? (
          <Image
            src={campaign.media.bannerUrl}
            alt={`Banner de ${campaign.campaignName}`}
            fill // Usar 'fill' para cubrir el contenedor
            style={{ objectFit: 'cover' }}
            className="filter brightness-75" // Ligero oscurecimiento para mejor contraste de texto
          />
        ) : (
          <div className="absolute inset-0 bg-primary-dark opacity-80 flex items-center justify-center">
            <span className="text-white text-xl sm:text-2xl font-bold">
              Banner de Campaña
            </span>
          </div>
        )}
        {/* Contenido superpuesto al banner */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4 text-center">
          <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-full border-4 border-white shadow-xl bg-neutral-200 flex items-center justify-center mb-4">
            {campaign.media?.logoUrl ? (
              <Image
                src={campaign.media.logoUrl}
                alt={`Logo de ${campaign.campaignName}`}
                width={144}
                height={144}
                className="rounded-full object-contain"
              />
            ) : (
              <span className="text-neutral-500 text-base sm:text-lg font-semibold">
                Logo
              </span>
            )}
          </div>
          <div className="flex items-center justify-center flex-wrap">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight drop-shadow-md">
              {campaign.campaignName}
            </h1>
            {isAdminEditable && (
              <button
                onClick={onEditCampaignName}
                className="p-1 rounded-full hover:bg-white/20 transition-colors duration-200 ml-2"
                aria-label="Editar nombre de la campaña"
              >
                <EditIcon className="text-white hover:text-gray-200" />{' '}
                {/* Ícono blanco en el banner */}
              </button>
            )}
          </div>
          <p className="text-lg sm:text-xl lg:text-2xl mt-2 drop-shadow-md font-light italic">
            {campaignSlogan}
          </p>
        </div>
      </div>

      <div className="p-4 sm:p-6 lg:p-8">
        {/* --- Información Principal de la Campaña y del Candidato --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Detalles de la Campaña */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-800 mb-4">
              Detalles de la Campaña
            </h2>
            <div className="space-y-3 text-sm text-neutral-700">
              <p className="flex items-center">
                <InfoIcon />
                <span className="font-semibold text-neutral-800">
                  Tipo:
                </span>{' '}
                {campaign.type}
              </p>
              <p className="flex items-center">
                <InfoIcon />
                <span className="font-semibold text-neutral-800">
                  Alcance:
                </span>{' '}
                {campaign.scope}
              </p>
              <p className="flex items-center">
                <InfoIcon />
                <span className="font-semibold text-neutral-800">
                  Estado:
                </span>{' '}
                <span
                  className={`font-semibold ml-1 ${campaign.status === 'activo' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {campaign.status.charAt(0).toUpperCase() +
                    campaign.status.slice(1)}
                </span>
              </p>
              <p className="flex items-center">
                <InfoIcon />
                <span className="font-semibold text-neutral-800">
                  Estado de Pago:
                </span>{' '}
                <span
                  className={`font-semibold ml-1 ${campaign.paymentStatus === 'pagado' ? 'text-green-600' : 'text-red-600'}`}
                >
                  {campaign.paymentStatus.charAt(0).toUpperCase() +
                    campaign.paymentStatus.slice(1)}
                </span>
              </p>
              <p className="flex items-center">
                <InfoIcon />
                <span className="font-semibold text-neutral-800">
                  Plan:
                </span>{' '}
                {planType}
              </p>
            </div>
          </div>

          {/* Información Rápida del Candidato */}
          <div className="bg-white p-6 rounded-lg shadow-md border border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-800 mb-4">
              Candidato
            </h2>
            <div className="space-y-3 text-sm text-neutral-700">
              <p>
                <span className="font-semibold text-neutral-800">Nombre:</span>{' '}
                {campaign.candidateName}
              </p>
              <p className="flex items-center">
                <MailIcon />
                {campaign.contactInfo?.email || 'N/A'}
              </p>
              <p className="flex items-center">
                <PhoneIcon />
                {campaign.contactInfo?.phone || 'N/A'}
              </p>
              <p className="flex items-center">
                <LocationIcon />
                <span className="font-medium">Ubicación:</span>{' '}
                {campaign.location?.city || 'N/A'},{' '}
                {campaign.location?.department || 'N/A'}
              </p>
            </div>
          </div>
        </div>

        {/* --- Métricas Clave de la Campaña --- */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4 text-center">
            Actividad de la Campaña
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-primary-50 p-6 rounded-lg shadow-md border border-primary-100 text-center flex flex-col items-center">
              <UsersIcon className="h-12 w-12 mb-2" />
              <p className="text-4xl font-bold text-blue-600">1.250</p>{' '}
              {/* Usando blue-600 */}
              <p className="text-sm text-neutral-700 mt-1">
                Usuarios Registrados
              </p>
            </div>
            <div className="bg-secondary-50 p-6 rounded-lg shadow-md border border-secondary-100 text-center flex flex-col items-center">
              <ActivityIcon className="h-12 w-12 mb-2" />
              <p className="text-4xl font-bold text-yellow-600">5.320</p>{' '}
              {/* Usando yellow-600 */}
              <p className="text-sm text-neutral-700 mt-1">
                Interacciones Totales
              </p>
            </div>
            <div className="bg-green-50 p-6 rounded-lg shadow-md border border-green-100 text-center flex flex-col items-center">
              <PhotoIcon className="h-12 w-12 mb-2" />
              <p className="text-4xl font-bold text-green-600">387</p>
              <p className="text-sm text-neutral-700 mt-1">Fotos en Galería</p>
            </div>
          </div>
        </div>

        {/* --- Acciones y Notificaciones (Botones) --- */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-neutral-800 mb-4 text-center">
            Acciones Rápidas
          </h2>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href={`/dashboard-admin/campaigns/${campaign.id}/gallery`} // Ruta de mockup para la galería
              className="w-full sm:w-auto px-6 py-3 bg-blue-600 text-white rounded-md shadow-md hover:bg-blue-700 transition-colors duration-200 flex items-center justify-center text-lg font-medium" // Usando blue-600
            >
              <PhotoIcon className="h-6 w-6 text-white mr-2" /> Ir a la Galería
            </Link>
            <Link
              href={`/dashboard-admin/campaigns/${campaign.id}/notifications`} // Ruta de mockup para notificaciones
              className="w-full sm:w-auto px-6 py-3 bg-yellow-500 text-white rounded-md shadow-md hover:bg-yellow-600 transition-colors duration-200 flex items-center justify-center text-lg font-medium relative" // Usando yellow-500
            >
              <BellIcon className="h-6 w-6 text-white mr-2" /> Ver
              Notificaciones
              {/* Mockup de contador de notificaciones */}
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center border-2 border-white">
                7
              </span>
            </Link>
          </div>
        </div>

        {/* --- Enlaces Sociales --- */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-800 mb-3">
            Redes Sociales
          </h3>
          <div className="flex flex-wrap gap-6 items-center">
            {campaign.socialLinks?.facebook && (
              <Link
                href={campaign.socialLinks.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-neutral-700 hover:text-blue-600 transition-colors duration-200"
              >
                <FacebookIcon className="mr-2" /> Facebook
              </Link>
            )}
            {campaign.socialLinks?.instagram && (
              <Link
                href={campaign.socialLinks.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-neutral-700 hover:text-pink-500 transition-colors duration-200"
              >
                <InstagramIcon className="mr-2" /> Instagram
              </Link>
            )}
            {campaign.socialLinks?.twitter && (
              <Link
                href={campaign.socialLinks.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center text-sm text-neutral-700 hover:text-blue-400 transition-colors duration-200"
              >
                <TwitterIcon className="mr-2" /> Twitter
              </Link>
            )}
            {!campaign.socialLinks?.facebook &&
              !campaign.socialLinks?.instagram &&
              !campaign.socialLinks?.twitter && (
                <p className="text-sm text-neutral-500">
                  No hay enlaces de redes sociales registrados.
                </p>
              )}
          </div>
        </div>

        {/* --- Paleta de Colores de la Campaña --- */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-800 mb-3">
            Paleta de Colores
          </h3>
          <div className="flex flex-wrap gap-6 items-center">
            {campaign.colors?.primary && (
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full border border-neutral-300 mr-2"
                  style={{ backgroundColor: campaign.colors.primary }}
                ></div>
                <span className="text-sm text-neutral-700">
                  Primario: {campaign.colors.primary}
                </span>
              </div>
            )}
            {campaign.colors?.accent && (
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full border border-neutral-300 mr-2"
                  style={{ backgroundColor: campaign.colors.accent }}
                ></div>
                <span className="text-sm text-neutral-700">
                  Acento: {campaign.colors.accent}
                </span>
              </div>
            )}
            {!campaign.colors?.primary && !campaign.colors?.accent && (
              <p className="text-sm text-neutral-500">
                No hay colores personalizados registrados.
              </p>
            )}
          </div>
        </div>

        {/* --- Información Adicional --- */}
        <div className="mt-6 bg-white p-6 rounded-lg shadow-md border border-neutral-200">
          <h3 className="text-lg font-semibold text-neutral-800 mb-3">
            Información Adicional
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-neutral-700">
            <p>
              <span className="font-medium">Slug de Registro:</span>{' '}
              {campaign.registrationSlug || 'N/A'}
            </p>
            <p>
              <span className="font-medium">Fecha de Creación:</span>{' '}
              {campaign.createdAt
                ? new Date(campaign.createdAt).toLocaleDateString('es-CO')
                : 'N/A'}
            </p>
            <p>
              <span className="font-medium">Creado Por:</span>{' '}
              {campaign.createdBy || 'N/A'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CampaignDetailDisplay
