// src/context/AuthContext.js
'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [activeCampaign, setActiveCampaign] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [idToken, setIdToken] = useState(null) // <--- ¡ESTA ES LA LÍNEA CLAVE A AÑADIR!
  const router = useRouter() // 1. Efecto para verificar la sesión al cargar la app o al refrescar la página.

  useEffect(() => {
    const initializeSession = async () => {
      try {
        const sessionRes = await fetch('/api/get-session')
        if (sessionRes.ok) {
          const sessionData = await sessionRes.json()
          if (sessionData.user) {
            setUser(sessionData.user)
            setIdToken(sessionData.idToken) // <--- ¡Y ESTA LÍNEA CLAVE! (Asumiendo que tu /api/get-session devuelve idToken)
          }
        }
      } catch (error) {
        console.error('Error inicializando la sesión:', error)
        setUser(null)
        setIdToken(null) // <--- Limpiar si hay error
      } finally {
        setIsLoading(false)
      }
    }
    initializeSession()
  }, []) // 2. Efecto para cargar la campaña activa cuando el usuario cambia. (Este bloque queda igual)

  useEffect(() => {
    const loadActiveCampaign = async () => {
      if (user && user.campaignMemberships?.length > 0) {
        const savedCampaignId = localStorage.getItem('activeCampaignId')
        const firstMembershipId = user.campaignMemberships[0].campaignId
        const campaignIdToLoad = savedCampaignId || firstMembershipId

        if (campaignIdToLoad) {
          try {
            const getCampaignUrl = process.env.NEXT_PUBLIC_GET_CAMPAIGN_URL
            if (!getCampaignUrl)
              throw new Error('URL de campaña no configurada.')

            const campaignRes = await fetch(
              `${getCampaignUrl}?id=${campaignIdToLoad}`,
            )
            if (campaignRes.ok) {
              const campaignData = await campaignRes.json()
              setActiveCampaign(campaignData)
            }
          } catch (error) {
            console.error('Error al cargar la campaña activa:', error)
          }
        }
      }
    }
    loadActiveCampaign()
  }, [user]) // 3. La función de login ahora actualiza activamente el estado.

  const login = (userData) => {
    // Asegúrate de que userData contenga idToken
    setUser(userData)
    setIdToken(userData.idToken) // <--- ¡Y ESTA LÍNEA CLAVE! (Asumiendo que tu login lo devuelve)
    // Guardamos la primera campaña como activa por defecto al iniciar sesión.
    const firstMembershipId = userData.campaignMemberships?.[0]?.campaignId
    if (firstMembershipId) {
      localStorage.setItem('activeCampaignId', firstMembershipId)
    }
  }

  const logout = async () => {
    setUser(null)
    setActiveCampaign(null)
    setIdToken(null) // <--- Limpiar idToken al cerrar sesión
    localStorage.removeItem('activeCampaignId')
    await fetch('/api/logout', { method: 'POST' })
    router.push('/login')
  } // <--- ¡AÑADIR idToken AL OBJETO DE VALOR EXPORTADO!

  const value = { user, activeCampaign, isLoading, login, logout, idToken }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Verificando sesión...</p>{' '}
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
