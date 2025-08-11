// src/app/dashboard-admin/campaigns/[id]/page.js
'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import CampaignDetailHeader from '@/components/admin/campaigns/CampaignDetailHeader'
import CampaignMembersList from '@/components/admin/campaigns/CampaignMembersList'
import ConfirmModal from '@/components/ui/ConfirmModal'
import Alert from '@/components/ui/Alert'

const CampaignDetailsPage = ({ params }) => {
  const { id } = params
  const router = useRouter()
  const { idToken } = useAuth()
  const [campaign, setCampaign] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [alert, setAlert] = useState({ show: false, message: '', type: 'info' })

  // URLs de las funciones de Firebase (del .env.local)
  const GET_CAMPAIGN_BY_ID_URL = process.env.NEXT_PUBLIC_GET_CAMPAIGN_BY_ID_URL
  const UPDATE_CAMPAIGN_URL = process.env.NEXT_PUBLIC_UPDATE_CAMPAIGN_URL
  const UPDATE_CAMPAIGN_STATUS_URL =
    process.env.NEXT_PUBLIC_UPDATE_CAMPAIGN_STATUS_URL
  // NUEVA URL del backend para obtener los miembros
  const GET_CAMPAIGN_MEMBERS_URL =
    process.env.NEXT_PUBLIC_GET_CAMPAIGN_MEMBERS_URL

  const fetchCampaignData = useCallback(async () => {
    if (!idToken || !id) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      // Petición 1: Obtener los detalles de la campaña
      const campaignResponse = await fetch(
        `${GET_CAMPAIGN_BY_ID_URL}?id=${id}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        },
      )
      if (!campaignResponse.ok) {
        const errData = await campaignResponse.json()
        const errorMessage =
          errData.message || 'Error al cargar la información de la campaña.'
        console.error('Error en fetchCampaignData - Campaña:', errorMessage)
        throw new Error(errorMessage)
      }
      const campaignData = await campaignResponse.json()
      setCampaign(campaignData)

      // Petición 2: Obtener los miembros de la campaña usando la nueva API
      const membersResponse = await fetch(
        `${GET_CAMPAIGN_MEMBERS_URL}?campaignId=${id}`,
        {
          headers: { Authorization: `Bearer ${idToken}` },
        },
      )
      if (!membersResponse.ok) {
        const errData = await membersResponse.json()
        const errorMessage =
          errData.message ||
          'Error al cargar la lista de miembros de la campaña.'
        console.error('Error en fetchCampaignData - Miembros:', errorMessage)
        throw new Error(errorMessage)
      }
      const membersData = await membersResponse.json()
      setMembers(membersData.campaignMembers)
    } catch (err) {
      console.error('Error general en fetchCampaignData:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [id, idToken, GET_CAMPAIGN_BY_ID_URL, GET_CAMPAIGN_MEMBERS_URL])

  useEffect(() => {
    if (idToken && id) {
      fetchCampaignData()
    }
  }, [idToken, id, fetchCampaignData])

  const handleToggleStatus = useCallback(async () => {
    // ... (El resto de la función no necesita cambios)
  }, [campaign, idToken, id, UPDATE_CAMPAIGN_STATUS_URL])

  const handleEditCampaign = useCallback(
    async (updatedFields) => {
      // ... (El resto de la función no necesita cambios)
    },
    [campaign, idToken, id, UPDATE_CAMPAIGN_URL, fetchCampaignData],
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <Alert message={error} type="error" />
      </div>
    )
  }

  if (!campaign) {
    return <div className="p-6 text-center">Campaña no encontrada.</div>
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-neutral-100 min-h-screen">
      {alert.show && (
        <div className="fixed top-4 right-4 z-50">
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ ...alert, show: false })}
          />
        </div>
      )}

      {showConfirmModal && (
        <ConfirmModal
          title="Confirmar Cambio de Estado"
          message={`¿Estás seguro de cambiar el estado de la campaña a '${campaign.status === 'activo' ? 'inactivo' : 'activo'}'? Esta acción afectará su visibilidad.`}
          onConfirm={() => {
            setShowConfirmModal(false)
            handleToggleStatus()
          }}
          onCancel={() => setShowConfirmModal(false)}
        />
      )}

      <CampaignDetailHeader
        campaign={campaign}
        onToggleStatus={() => setShowConfirmModal(true)}
        onEditCampaign={handleEditCampaign}
        loading={loading}
      />

      <div className="mt-8">
        <CampaignMembersList members={members} loading={loading} />
      </div>
    </div>
  )
}

export default CampaignDetailsPage
