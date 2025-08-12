// src/hooks/useLeadsData.js

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useCampaignData } from '@/hooks/useCampaignData'

const API_BASE_URL = 'https://us-central1-micampanav2.cloudfunctions.net'

const fetchLeads = async (campaignId, token) => {
  const response = await fetch(
    `${API_BASE_URL}/getLeads?campaignId=${campaignId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(
      errorData.message || 'Fallo al obtener los clientes potenciales.',
    )
  }

  const data = await response.json()
  return data.leads
}

const generateShareableLink = async (campaignId, parentUid, token) => {
  const response = await fetch(
    `${API_BASE_URL}/generateQrRegistrationLink?campaignId=${campaignId}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    },
  )

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(
      errorData.message || 'Fallo al generar el link para compartir.',
    )
  }

  const data = await response.json()
  return data.qrLink
}

export function useLeadsData() {
  const { user, idToken } = useAuth()
  const { campaignId } = useCampaignData() // Asumimos que este hook ya obtiene el campaignId
  const [leads, setLeads] = useState([])
  const [shareableLink, setShareableLink] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // useEffect para cargar los leads
  useEffect(() => {
    const loadLeads = async () => {
      if (!user || !idToken || !campaignId) return
      setIsLoading(true)
      try {
        const fetchedLeads = await fetchLeads(campaignId, idToken)
        setLeads(fetchedLeads)
      } catch (err) {
        setError(err.message)
        console.error('Error al cargar los leads:', err)
      } finally {
        setIsLoading(false)
      }
    }
    loadLeads()
  }, [user, idToken, campaignId])

  // Función para generar el link
  const generateLink = async () => {
    if (!user || !idToken || !campaignId) return
    setIsLoading(true)
    try {
      const link = await generateShareableLink(campaignId, user.uid, idToken)
      setShareableLink(link)
    } catch (err) {
      setError(err.message)
      console.error('Error al generar el link:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return { leads, shareableLink, generateLink, isLoading, error }
}
