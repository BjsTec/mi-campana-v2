// src/hooks/useCampaignData.js
import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

const API_BASE_URL = 'https://us-central1-micampanav2.cloudfunctions.net'

const fetchCampaigns = async (token) => {
  const response = await fetch(`${API_BASE_URL}/getCampaigns`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Fallo al obtener las campañas.')
  }

  const data = await response.json()
  return data.campaigns
}

const fetchCampaignById = async (campaignId, token) => {
  const response = await fetch(
    `${API_BASE_URL}/getCampaignById?id=${campaignId}`,
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
    if (response.status === 404) {
      throw new Error('La campaña no fue encontrada.')
    }
    throw new Error(
      errorData.message || 'Fallo al obtener los datos de la campaña.',
    )
  }

  const data = await response.json()
  return data.campaign
}

export function useCampaignData() {
  const { user, idToken } = useAuth()
  // Inicializamos el estado con una estructura de datos segura
  const [campaignData, setCampaignData] = useState({
    totalConfirmedVotes: 0,
    totalPotentialVotes: 0,
    totalPromesas: 0,
    totalOpinion: { aFavor: 0, enContra: 0, indeciso: 100 },
    departamentos: [], // Dejamos el array vacío hasta que lo llenemos de la API
  })
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadData = async () => {
      if (!user || !idToken) {
        setIsLoading(false)
        return
      }

      try {
        const campaigns = await fetchCampaigns(idToken)
        const campaignId = campaigns[0]?.id

        if (!campaignId) {
          throw new Error(
            'No se encontró una campaña asociada al usuario. Por favor, crea una o verifica la membresía.',
          )
        }

        const metrics = await fetchCampaignById(campaignId, idToken)

        // Asumimos que la API devuelve los campos totalConfirmedVotes, pyramidVotes, y totalPromesas.
        setCampaignData({
          totalConfirmedVotes: metrics.totalConfirmedVotes || 0,
          totalPotentialVotes: metrics.pyramidVotes || 0,
          totalPromesas: metrics.totalPromesas || 0,
          // La métrica de opinión y departamentos aún no viene de la API, así que usamos un valor por defecto.
          totalOpinion: { aFavor: 0, enContra: 0, indeciso: 100 },
          departamentos: [],
        })

        setIsLoading(false)
      } catch (err) {
        console.error('Error al cargar los datos de la campaña:', err)
        setError(err.message)
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, idToken])

  return { campaignData, isLoading, error }
}
