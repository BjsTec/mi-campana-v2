'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  // Renombramos a 'loading' para mayor claridad
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  // --- INICIO DE LA CORRECCIÓN ---
  // Este useEffect se ejecuta UNA SOLA VEZ para verificar la sesión del lado del servidor
  useEffect(() => {
    async function checkUserSession() {
      try {
        // Hacemos una petición a nuestra API para ver si hay una sesión activa en la cookie
        const response = await fetch('/api/get-session')

        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            // Si el servidor confirma la sesión, establecemos el usuario
            setUser(data.user)
            console.log('Sesión restablecida desde la cookie HttpOnly.')
          }
        }
      } catch (error) {
        // Si hay un error de red o la API falla, no hacemos nada y el usuario sigue como null
        console.error('No se pudo verificar la sesión del usuario', error)
      } finally {
        // Cuando la verificación termina (con o sin éxito), dejamos de cargar
        setLoading(false)
      }
    }

    checkUserSession()
  }, []) // El array vacío [] asegura que esto solo se ejecute al montar el componente
  // --- FIN DE LA CORRECCIÓN ---

  // La función de login simplemente actualiza el estado en el cliente.
  // La cookie ya fue establecida en la página de login.
  const login = (userData) => {
    setUser(userData)
  }

  // La función de logout debe limpiar el estado y la cookie del servidor
  const logout = async () => {
    setUser(null) // Limpia el estado del usuario inmediatamente
    try {
      // Llama a una API para que borre la cookie HttpOnly del lado del servidor
      await fetch('/api/logout', { method: 'POST' })
    } catch (error) {
      console.error('Error al intentar cerrar la sesión del servidor:', error)
    }
    // Redirige al login después de cerrar sesión
    router.push('/login')
  }

  const value = { user, login, logout, loading }

  // Muestra un loader mientras se verifica el estado inicial de autenticación
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-gray-700">Verificando sesión...</p>
      </div>
    )
  }

  // Una vez que la carga ha terminado, proporciona el contexto a los hijos
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook personalizado para usar el contexto de autenticación fácilmente
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}
