// src/hooks/useCampaigns.js
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/context/AuthContext'

export const useCampaigns = () => {
  const { user, idToken, isLoading: authLoading } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [campaignTypes, setCampaignTypes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const GET_CAMPAIGNS_URL = process.env.NEXT_PUBLIC_GET_CAMPAIGNS_URL
  // CORRECCIÓN: Usar el nombre de variable correcto del .env.local
  const GET_PUBLIC_CAMPAIGN_TYPES_URL =
    process.env.NEXT_PUBLIC_GET_PUBLIC_CAMPAIGN_TYPES_URL

  const fetchData = useCallback(async () => {
    if (authLoading) return
    if (!user || user.role !== 'admin' || !idToken) {
      setLoading(false)
      setError(
        'Acceso denegado: No eres un administrador o no hay token de autenticación.',
      )
      return
    }

    setLoading(true)
    setError(null)
    try {
      // Petición 1: Obtener tipos de campaña
      if (!GET_PUBLIC_CAMPAIGN_TYPES_URL) {
        // Este error ya no debería ocurrir si el .env está bien configurado
        throw new Error('URL para tipos de campaña no configurada.')
      }
      const typesResponse = await fetch(GET_PUBLIC_CAMPAIGN_TYPES_URL)
      if (!typesResponse.ok) {
        throw new Error('No se pudieron cargar los tipos de campaña.')
      }
      const typesData = await typesResponse.json()
      if (Array.isArray(typesData)) {
        setCampaignTypes(typesData.filter((type) => type.active))
      } else {
        throw new Error('Formato de datos inesperado para tipos de campaña.')
      }

      // Petición 2: Obtener campañas
      if (!GET_CAMPAIGNS_URL) {
        throw new Error('URL para campañas no configurada.')
      }
      const campaignsResponse = await fetch(GET_CAMPAIGNS_URL, {
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
      })
      if (!campaignsResponse.ok) {
        const errData = await campaignsResponse.json()
        throw new Error(errData.message || 'Error al cargar las campañas.')
      }
      const campaignsData = await campaignsResponse.json()
      if (Array.isArray(campaignsData.campaigns)) {
        setCampaigns(campaignsData.campaigns)
      } else {
        throw new Error('Formato de datos inesperado para campañas.')
      }
    } catch (err) {
      setError(err.message)
      setCampaigns([])
      setCampaignTypes([])
    } finally {
      setLoading(false)
    }
  }, [
    user,
    idToken,
    authLoading,
    GET_CAMPAIGNS_URL,
    GET_PUBLIC_CAMPAIGN_TYPES_URL,
  ])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { campaigns, campaignTypes, loading, error, refreshData: fetchData }
}
