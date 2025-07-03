'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

// Componente de la página para editar la campaña
export default function EditCampaignPage() {
  const { user } = useAuth()
  const [campaign, setCampaign] = useState(null)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Efecto para cargar los datos de la campaña cuando el componente se monta
  useEffect(() => {
    if (user && user.campaignMemberships) {
      const activeCampaign = user.campaignMemberships.find(
        (m) => m.role === 'candidato',
      )

      if (activeCampaign) {
        const fetchCampaignData = async () => {
          try {
            // --- CORRECCIÓN: Usar la URL desde las variables de entorno ---
            const getCampaignUrl = process.env.NEXT_PUBLIC_GET_CAMPAIGN_URL
            if (!getCampaignUrl) {
              throw new Error(
                'La URL para obtener la campaña no está configurada.',
              )
            }

            const response = await fetch(
              `${getCampaignUrl}?id=${activeCampaign.campaignId}`,
            )

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(
                errorData.message ||
                  'No se pudo cargar la información de la campaña.',
              )
            }

            const data = await response.json()
            setCampaign(data)
            // Inicializa el formulario con los datos existentes
            setFormData({
              'contactInfo.email': data.contactInfo?.email || '',
              'contactInfo.phone': data.contactInfo?.phone || '',
              'socialLinks.facebook': data.socialLinks?.facebook || '',
              'socialLinks.twitter': data.socialLinks?.twitter || '',
              'colors.primary': data.colors?.primary || '#0D47A1',
              'colors.accent': data.colors?.accent || '#FFFFFF',
            })
          } catch (err) {
            setError(err.message)
          } finally {
            setLoading(false)
          }
        }
        fetchCampaignData()
      } else {
        setError('No se encontró una campaña de la cual seas candidato.')
        setLoading(false)
      }
    } else if (!user) {
      // Si el usuario aún no ha cargado, no hagas nada todavía.
      // El layout se encargará de redirigir si es necesario.
    } else {
      // El usuario está cargado pero no tiene membresías
      setError('No tienes membresías de campaña asociadas.')
      setLoading(false)
    }
  }, [user])

  // Manejador para cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  // Manejador para enviar el formulario
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      // --- CORRECCIÓN: Usar la URL desde las variables de entorno ---
      const updateCampaignUrl = process.env.NEXT_PUBLIC_UPDATE_CAMPAIGN_URL
      if (!updateCampaignUrl) {
        throw new Error(
          'La URL para actualizar la campaña no está configurada.',
        )
      }

      const response = await fetch(updateCampaignUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId: campaign.id,
          callingUserUid: user.uid, // Usamos el UID del token decodificado en el contexto
          updates: formData,
        }),
      })

      const result = await response.json()
      if (!response.ok) {
        throw new Error(result.message || 'Error al actualizar la campaña.')
      }

      setSuccess('¡Campaña actualizada exitosamente!')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <p>Cargando información de la campaña...</p>
  }

  if (error) {
    return <p className="text-red-500">Error: {error}</p>
  }

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        Gestionar Campaña: {campaign?.campaignName}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Sección de Información de Contacto */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">
            Información de Contacto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                value={formData['contactInfo.email']}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
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
                value={formData['contactInfo.phone']}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Sección de Redes Sociales */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Redes Sociales</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                value={formData['socialLinks.facebook']}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
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
                value={formData['socialLinks.twitter']}
                onChange={handleInputChange}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Sección de Personalización de Colores */}
        <div className="p-6 border rounded-lg">
          <h2 className="text-xl font-semibold mb-4">Colores de la Campaña</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                value={formData['colors.primary']}
                onChange={handleInputChange}
                className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm"
              />
            </div>
            <div>
              <label
                htmlFor="colors.accent"
                className="block text-sm font-medium text-gray-700"
              >
                Color de Acento
              </label>
              <input
                type="color"
                name="colors.accent"
                id="colors.accent"
                value={formData['colors.accent']}
                onChange={handleInputChange}
                className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm"
              />
            </div>
          </div>
        </div>

        {/* Botón de Guardar */}
        <div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400"
          >
            {loading ? 'Guardando...' : 'Guardar Cambios'}
          </button>
        </div>

        {success && <p className="text-green-600 mt-4">{success}</p>}
      </form>
    </div>
  )
}
