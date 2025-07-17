import { useState } from 'react' // Asegúrate de importar useState directamente
import Image from 'next/image' // Importar el componente Image de Next.js
import Link from 'next/link' // Importar el componente Link de Next.js
import { PencilIcon } from '@heroicons/react/24/solid' // Para el ícono de edición
import {
  MapPinIcon,
  UserIcon,
  EnvelopeIcon,
  PhoneIcon,
  GlobeAltIcon,
  TagIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  IdentificationIcon,
  BuildingOfficeIcon,
  MegaphoneIcon,
  BanknotesIcon, // Usamos BanknotesIcon para el descuento (se parece a billetes/dinero)
  CameraIcon, // Para la sección de actividad
} from '@heroicons/react/24/outline' // Iconos adicionales

// Función de utilidad para formatear moneda (puedes ajustarla según tu región, ej. COP)
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP', // Moneda de Colombia
    minimumFractionDigits: 0, // No mostrar decimales si es un número entero
    maximumFractionDigits: 0,
  }).format(amount)
}

export default function CampaignDetailDisplay({
  campaign,
  isAdminEditable,
  onEditCampaignName,
  onEditPlanPrice,
  onToggleCampaignStatus,
  actionLoading,
  isEditingName, // Recibido de CampaignDetailPage
  isEditingPlanPrice, // Recibido de CampaignDetailPage
}) {
  // === CORRECCIÓN CLAVE: Mover los useState AL PRINCIPIO del componente ===
  // Estados para controlar si las imágenes han fallado
  // Esto es crucial para evitar el bucle de re-renderizado en caso de error de carga de imagen.
  const [bannerError, setBannerError] = useState(false)
  const [logoError, setLogoError] = useState(false)
  // ======================================================================

  // La comprobación condicional va DESPUÉS de la declaración de todos los hooks
  if (!campaign) {
    return (
      <div className="text-center py-8 text-neutral-500">
        No hay datos de campaña para mostrar.
      </div>
    )
  }

  const currentStatusText = campaign.status === 'activo' ? 'Activo' : 'Inactivo'
  const toggleButtonText =
    campaign.status === 'activo' ? 'Desactivar Campaña' : 'Activar Campaña'
  const toggleButtonClass =
    campaign.status === 'activo'
      ? 'bg-red-500 hover:bg-red-600'
      : 'bg-green-500 hover:bg-green-600'

  return (
    // AJUSTE DE ESPACIADO: Eliminamos el 'max-w-6xl' para que el componente se extienda
    // Ocupará todo el ancho de su contenedor padre (que ahora es w-full)
    // Los px-4 sm:px-6 lg:px-8 ya proporcionan el espaciado lateral deseado.
    <div className="space-y-6 w-full mx-auto px-4 sm:px-6 lg:px-8">
      {/* Banner de la Campaña */}
      {/* El w-full en este div asegura que el banner ocupe todo el ancho disponible */}
      <div className="relative w-full h-48 sm:h-64 bg-neutral-200 rounded-lg overflow-hidden shadow-md flex items-center justify-center">
        {/* Lógica para mostrar la imagen o el placeholder en caso de error/ausencia */}
        {campaign.media?.bannerUrl && !bannerError ? (
          <Image
            src={campaign.media.bannerUrl}
            alt={`Banner de ${campaign.campaignName}`}
            fill
            style={{ objectFit: 'cover' }}
            className="transition-opacity duration-300"
            onError={() => setBannerError(true)} // Si falla la carga, setea el estado de error
          />
        ) : (
          // Muestra el placeholder estático (PNG) si hay error o no hay URL
          <Image
            src="https://placehold.co/1200x300.png?text=Banner+no+disponible&bg=CCCCCC&font=FFFFFF"
            alt="Banner no disponible"
            fill
            style={{ objectFit: 'cover' }}
            className="transition-opacity duration-300"
          />
        )}
        {/* Logo de la Campaña */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full shadow-lg border-4 border-white flex items-center justify-center">
          {campaign.media?.logoUrl && !logoError ? (
            <Image
              src={campaign.media.logoUrl}
              alt={`Logo de ${campaign.campaignName}`}
              width={120} // Ajusta el tamaño según tu diseño
              height={120} // Ajusta el tamaño según tu diseño
              className="rounded-full object-cover"
              onError={() => setLogoError(true)} // Si falla la carga, setea el estado de error
            />
          ) : (
            // Muestra el placeholder estático (PNG) si hay error o no hay URL
            <Image
              src="https://placehold.co/120x120.png?text=Logo&bg=CCCCCC&font=FFFFFF"
              alt="Logo Campaña"
              width={120}
              height={120}
              className="rounded-full object-cover"
            />
          )}
        </div>
      </div>

      {/* Nombre de la Campaña y Mensaje */}
      {/* AJUSTE DE ESPACIADO: Eliminamos el 'max-w-4xl' para que se expanda también */}
      <div className="text-center mt-12 bg-white p-6 rounded-lg shadow-md w-full mx-auto relative">
        <h1 className="text-3xl font-bold text-neutral-800 break-words flex items-center justify-center gap-2">
          {campaign.campaignName}
          {isAdminEditable && !isEditingName && (
            <button
              onClick={onEditCampaignName}
              className="text-blue-500 hover:text-blue-700 transition-colors"
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          )}
        </h1>
        <p className="text-neutral-600 mt-2 italic">
          {campaign.messagingOptions?.slogan ||
            '¡Únete a nuestra causa y haz la diferencia!'}
        </p>
      </div>

      {/* Secciones de Detalles y Candidato */}
      {/* Estas secciones ya están diseñadas para ocupar el 100% de su padre (w-full y grid) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Detalles de la Campaña */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-neutral-700 mb-4 flex items-center gap-2">
            <MegaphoneIcon className="h-6 w-6 text-blue-500" /> Detalles de la
            Campaña
          </h2>
          <ul className="space-y-3 text-neutral-700">
            <li className="flex items-center gap-2">
              <TagIcon className="h-5 w-5 text-neutral-500" />{' '}
              <strong>Tipo:</strong> {campaign.type || 'N/A'}
            </li>
            <li className="flex items-center gap-2">
              <MapPinIcon className="h-5 w-5 text-neutral-500" />{' '}
              <strong>Alcance:</strong> {campaign.scope || 'N/A'}
            </li>
            <li className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-neutral-500" />{' '}
              <strong>Estado:</strong>
              <span
                className={`font-semibold ${campaign.status === 'activo' ? 'text-green-600' : 'text-red-600'}`}
              >
                {currentStatusText}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5 text-neutral-500" />{' '}
              <strong>Estado de Pago:</strong>
              <span
                className={`font-semibold ${campaign.paymentStatus === 'pagado' ? 'text-green-600' : 'text-orange-600'}`}
              >
                {campaign.paymentStatus || 'Pendiente'}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <BuildingOfficeIcon className="h-5 w-5 text-neutral-500" />{' '}
              <strong>Plan:</strong>
              {campaign.planName || 'Básico'}
            </li>
            <li className="flex items-center gap-2">
              <CurrencyDollarIcon className="h-5 w-5 text-neutral-500" />{' '}
              <strong>Precio del Plan:</strong>
              <span className="flex items-center gap-1">
                {formatCurrency(campaign.planPrice || 0)}
                {isAdminEditable && !isEditingPlanPrice && (
                  <button
                    onClick={onEditPlanPrice}
                    className="text-blue-500 hover:text-blue-700 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                )}
              </span>
            </li>
            <li className="flex items-center gap-2">
              <BanknotesIcon className="h-5 w-5 text-neutral-500" />{' '}
              <strong>Descuento:</strong> {campaign.discountPercentage}%
            </li>
          </ul>

          {isAdminEditable && (
            <button
              onClick={() => onToggleCampaignStatus(campaign.status)}
              disabled={actionLoading}
              className={`mt-6 w-full py-2 rounded-md text-white font-semibold transition-colors ${toggleButtonClass} disabled:opacity-50`}
            >
              {actionLoading ? 'Procesando...' : toggleButtonText}
            </button>
          )}
        </div>

        {/* Información del Candidato */}
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col">
          <h2 className="text-xl font-semibold text-neutral-700 mb-4 flex items-center gap-2">
            <UserIcon className="h-6 w-6 text-blue-500" /> Candidato
          </h2>
          {campaign.candidateProfile ? (
            <>
              <ul className="space-y-3 text-neutral-700 flex-grow">
                <li className="flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-neutral-500" />{' '}
                  <strong>Nombre:</strong>{' '}
                  {campaign.candidateProfile.name || 'N/A'}
                </li>
                <li className="flex items-center gap-2">
                  <EnvelopeIcon className="h-5 w-5 text-neutral-500" />{' '}
                  <strong>Email:</strong>{' '}
                  {campaign.candidateProfile.email || 'N/A'}
                </li>
                <li className="flex items-center gap-2">
                  <PhoneIcon className="h-5 w-5 text-neutral-500" />{' '}
                  <strong>Teléfono:</strong>{' '}
                  {campaign.candidateProfile.phone || 'N/A'}
                </li>
                <li className="flex items-center gap-2">
                  <MapPinIcon className="h-5 w-5 text-neutral-500" />{' '}
                  <strong>Ubicación:</strong>{' '}
                  {campaign.candidateProfile.location?.city || 'N/A'},{' '}
                  {campaign.candidateProfile.location?.state || 'N/A'}
                </li>
              </ul>
              {/* Botón para ver detalles del candidato */}
              <div className="mt-6">
                <Link
                  href={`/dashboard-admin/users/${campaign.candidateProfile.id}`}
                >
                  <button className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-semibold">
                    Ver Detalles del Candidato
                  </button>
                </Link>
              </div>
            </>
          ) : (
            <p className="text-neutral-500">
              No hay información de candidato disponible.
            </p>
          )}
        </div>
      </div>

      {/* Sección de Actividad (tal como la tenías, con Placeholders) */}
      <div className="bg-white p-6 rounded-lg shadow-md text-center">
        <h2 className="text-2xl font-bold text-neutral-700 mb-6">
          Actividad de la Campaña
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="flex flex-col items-center p-4 bg-blue-50 rounded-lg shadow-sm">
            <UserIcon className="h-10 w-10 text-blue-600 mb-2" />
            <p className="text-3xl font-bold text-blue-700">1.250</p>
            <p className="text-neutral-600 mt-1">Usuarios Registrados</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-green-50 rounded-lg shadow-sm">
            <MegaphoneIcon className="h-10 w-10 text-green-600 mb-2" />
            <p className="text-3xl font-bold text-green-700">5.320</p>
            <p className="text-neutral-600 mt-1">Interacciones Totales</p>
          </div>
          <div className="flex flex-col items-center p-4 bg-purple-50 rounded-lg shadow-sm">
            <CameraIcon className="h-10 w-10 text-purple-600 mb-2" />
            <p className="text-3xl font-bold text-purple-700">387</p>
            <p className="text-neutral-600 mt-1">Fotos en Galería</p>
          </div>
        </div>
      </div>
    </div>
  )
}
