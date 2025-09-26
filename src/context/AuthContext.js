'use client'
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../lib/supabase-client'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [session, setSession] = useState(null)
  const [activeCampaign, setActiveCampaign] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // 1. Obtener la sesión inicial del usuario
    supabase.auth.getSession().then(sessionResponse => {
      const session = sessionResponse.data.session;
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // 2. Escuchar cambios en el estado de autenticación
    const authSubscription = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session)
        const currentUser = session?.user
        setUser(currentUser ?? null)
        if (!currentUser) {
          localStorage.removeItem('activeCampaignId')
          setActiveCampaign(null)
          router.push('/login')
        }
        setIsLoading(false)
      },
    )

    // Limpiar el listener al desmontar el componente
    return () => {
      if (authSubscription && authSubscription.data) {
        authSubscription.data.subscription.unsubscribe()
      }
    }
  }, [router])

  // 3. Cargar la campaña activa cuando el usuario o la sesión cambian
  const loadActiveCampaign = useCallback(async () => {
    if (user && session && user.app_metadata?.campaignMemberships?.length > 0) {
      const savedCampaignId = localStorage.getItem('activeCampaignId')
      const firstMembership = user.app_metadata.campaignMemberships.find(
        (m) => m.status === 'activo',
      )
      const campaignIdToLoad = savedCampaignId || firstMembership?.campaignId

      if (campaignIdToLoad) {
        try {
          // Usar el cliente de Supabase para obtener los datos
          const campaignResponse = await supabase
            .from('campaigns')
            .select('*')
            .eq('id', campaignIdToLoad)
            .single()

          if (campaignResponse.error) {
            console.error('Error al cargar la campaña activa:', campaignResponse.error.message)
            setActiveCampaign(null)
            if (campaignResponse.error.code === 'PGRST116') {
              // El registro no se encontró, probablemente eliminado
              localStorage.removeItem('activeCampaignId')
            }
            return
          }

          setActiveCampaign(campaignResponse.data)
          localStorage.setItem('activeCampaignId', campaignIdToLoad)
        } catch (error) {
          console.error('Error en fetch al cargar la campaña activa:', error)
          setActiveCampaign(null)
        }
      } else {
        setActiveCampaign(null)
      }
    } else {
      setActiveCampaign(null)
      localStorage.removeItem('activeCampaignId')
    }
  }, [user, session])

  useEffect(() => {
    loadActiveCampaign()
  }, [loadActiveCampaign])

  // Función de logout simplificada
  const logout = async () => {
    await supabase.auth.signOut()
    // El listener onAuthStateChange se encargará de limpiar el estado y redirigir
  }

  // El objeto de valor ahora es más simple
  const value = {
    user,
    session,
    activeCampaign,
    isLoading,
    logout,
    // La función de login ahora se maneja directamente en la página de login
    // y no necesita ser parte del contexto.
  }

  // Muestra un indicador de carga mientras se verifica la sesión
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
