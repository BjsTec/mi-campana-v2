'use client'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react' // Añadido useCallback
import { useRouter } from 'next/navigation'
import { jwtDecode } from 'jwt-decode' // Asegúrate de que jwt-decode esté instalado

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [activeCampaign, setActiveCampaign] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [idToken, setIdToken] = useState(null) // Estado para el JWT
  const router = useRouter()

  // 1. Efecto para verificar la sesión al cargar la app o al refrescar la página.
  const initializeSession = useCallback(async () => {
    try {
      const sessionRes = await fetch('/api/get-session')
      if (sessionRes.ok) {
        const sessionData = await sessionRes.json()
        if (sessionData.user && sessionData.idToken) {
          // Asegurarse de que ambos existan
          setUser(sessionData.user)
          setIdToken(sessionData.idToken) // Guardar el token
        } else {
          // Si la respuesta es OK pero no hay usuario/token, limpiar.
          setUser(null)
          setIdToken(null)
          localStorage.removeItem('activeCampaignId') // Limpiar caché de campaña
        }
      } else {
        // Si la respuesta no es OK (ej. 401 Unauthorized), limpiar sesión.
        const errorData = await sessionRes.json()
        console.warn(
          'Error en /api/get-session:',
          errorData.error || sessionRes.statusText,
        )
        setUser(null)
        setIdToken(null)
        localStorage.removeItem('activeCampaignId')
      }
    } catch (error) {
      console.error('Error al inicializar la sesión:', error)
      setUser(null)
      setIdToken(null)
      localStorage.removeItem('activeCampaignId')
    } finally {
      setIsLoading(false)
    }
  }, []) // No hay dependencias aquí, solo se ejecuta una vez al montar

  useEffect(() => {
    initializeSession()
  }, [initializeSession])

  // 2. Efecto para cargar la campaña activa cuando el usuario o el token cambian.
  const loadActiveCampaign = useCallback(async () => {
    if (user && user.campaignMemberships?.length > 0 && idToken) {
      // Necesita el idToken para autenticar
      const savedCampaignId = localStorage.getItem('activeCampaignId')
      // Lógica para seleccionar la campaña: la guardada en localStorage o la primera
      const firstMembership = user.campaignMemberships.find(
        (m) => m.status === 'activo',
      ) // Buscar la primera activa
      const campaignIdToLoad = savedCampaignId || firstMembership?.campaignId

      if (campaignIdToLoad) {
        try {
          const getCampaignByIdUrl =
            process.env.NEXT_PUBLIC_GET_CAMPAIGN_BY_ID_URL // Asegúrate que esta URL sea correcta

          if (!getCampaignByIdUrl) {
            throw new Error(
              'La URL de la función de obtener campaña por ID no está configurada (NEXT_PUBLIC_GET_CAMPAIGN_BY_ID_URL).',
            )
          }

          // ¡¡¡CORRECCIÓN CLAVE!!!
          // Enviar el idToken en el encabezado de autorización para la API protegida
          const campaignRes = await fetch(
            `${getCampaignByIdUrl}?id=${campaignIdToLoad}`,
            {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`, // Envía el token JWT
              },
              cache: 'no-store', // Para asegurar que no se cachea la respuesta de la API
            },
          )

          if (campaignRes.ok) {
            const campaignData = await campaignRes.json()
            setActiveCampaign(campaignData)
            localStorage.setItem('activeCampaignId', campaignIdToLoad) // Asegurar que se guarde la activa
          } else {
            const errorData = await campaignRes.json()
            console.error(
              'Error al cargar la campaña activa:',
              errorData.message || campaignRes.statusText,
            )
            setActiveCampaign(null) // Limpiar si falla la carga
          }
        } catch (error) {
          console.error('Error en fetch al cargar la campaña activa:', error)
          setActiveCampaign(null)
        }
      } else {
        setActiveCampaign(null) // No hay campaña que cargar
      }
    } else {
      setActiveCampaign(null) // No hay usuario o membresías
      localStorage.removeItem('activeCampaignId') // Limpiar si ya no hay campañas
    }
  }, [user, idToken]) // Depende de user y idToken

  useEffect(() => {
    loadActiveCampaign()
  }, [loadActiveCampaign])

  // La función de login ahora actualiza activamente el estado y guarda la campaña activa.
  // Es llamada desde src/app/(public)/login/page.js
  const login = useCallback((userData, token) => {
    // 'token' es el idToken JWT
    setUser(userData)
    setIdToken(token) // Guardar el token en el estado

    // Guardar la primera campaña activa como predeterminada al iniciar sesión, si existe.
    const firstActiveMembership = userData.campaignMemberships?.find(
      (m) => m.status === 'activo',
    )
    if (firstActiveMembership) {
      localStorage.setItem('activeCampaignId', firstActiveMembership.campaignId)
    } else {
      localStorage.removeItem('activeCampaignId')
    }
    // No es necesario llamar a loadActiveCampaign aquí, el useEffect lo manejará por dependencia de user/idToken
  }, [])

  const logout = useCallback(async () => {
    setUser(null)
    setActiveCampaign(null)
    setIdToken(null) // Limpiar idToken al cerrar sesión
    localStorage.removeItem('activeCampaignId') // Limpiar caché de campaña

    try {
      await fetch('/api/logout', { method: 'POST' })
    } catch (error) {
      console.error('Error al llamar a /api/logout:', error)
    }
    router.push('/login') // Redireccionar al login
  }, [router])

  // Objeto de valor exportado por el contexto
  const value = { user, activeCampaign, isLoading, login, logout, idToken }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p>Verificando sesión...</p>
      </div>
    )
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
