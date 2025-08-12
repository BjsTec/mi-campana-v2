// src/hooks/useTeamData.js

import { useState, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

const API_BASE_URL = 'https://us-central1-micampanav2.cloudfunctions.net'

// Se mantiene la función de obtener campañas, ya que es la forma de saber el ID.
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

// Esta es la función clave. Ahora hace la llamada real a la API.
const fetchTeamMembers = async (campaignId, token) => {
  const response = await fetch(
    `${API_BASE_URL}/getSecureUsers?campaignId=${campaignId}`,
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
      errorData.message || 'Fallo al obtener los miembros del equipo.',
    )
  }

  const data = await response.json()
  // La API devuelve un array de usuarios, los filtramos por membresía de campaña
  const members = data.data.filter((user) =>
    user.campaignMemberships.some(
      (membership) => membership.campaignId === campaignId,
    ),
  )

  // Mapeamos la respuesta para que encaje con la estructura que el componente espera
  return members.map((member) => ({
    id: member.uid,
    nombre: member.name,
    rol: member.role,
    votosTotal: member.pyramidVotes || 0,
    ciudad: member.location?.city || 'No definida',
  }))
}

export function useTeamData() {
  const { user, idToken } = useAuth()
  const [team, setTeam] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const loadTeam = async () => {
      if (!user || !idToken) {
        setIsLoading(false)
        return
      }
      try {
        // Paso 1: Obtener el ID de la campaña
        const campaigns = await fetchCampaigns(idToken)
        const campaignId = campaigns[0]?.id

        if (!campaignId) {
          throw new Error('No se encontró una campaña asociada al usuario.')
        }

        // Paso 2: Obtener los miembros del equipo de esa campaña de forma real
        const members = await fetchTeamMembers(campaignId, idToken)
        setTeam(members)
      } catch (err) {
        setError(err.message)
        console.error('Error al cargar el equipo:', err)
      } finally {
        setIsLoading(false)
      }
    }

    loadTeam()
  }, [user, idToken])

  return { team, isLoading, error }
}
