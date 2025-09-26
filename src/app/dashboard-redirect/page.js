// src/app/dashboard-redirect/page.js
'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Lottie from 'lottie-react'
import loginLoadingAnimation from '@/animations/loginOne.json'

export default function DashboardRedirect() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    // No redirigir si todavía está cargando la información del usuario
    if (isLoading) {
      return
    }

    // Si no hay usuario después de cargar, redirigir al login
    if (!user) {
      router.push('/login')
      return
    }

    // Mapeo de roles a rutas de dashboard
    const redirects = {
      admin: '/dashboard-admin/home-wm',
      candidato: '/dashboard-candidato',
      manager: '/dashboard-manager/panel',
      anillo: '/dashboard-anillo/panel',
      votante: '/dashboard-votante/panel',
    }

    const userRole = user.app_metadata?.role
    const targetRoute = redirects[userRole] || '/login' // Por defecto a login si el rol no existe

    // Redirigir al usuario a la ruta correspondiente
    router.replace(targetRoute)
  }, [user, isLoading, router])

  // Mientras se procesa la redirección, mostrar un indicador de carga
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <Lottie
        animationData={loginLoadingAnimation}
        loop={true}
        autoplay={true}
        style={{ width: 200, height: 200 }}
      />
      <p className="mt-4 text-lg text-gray-700">Redirigiendo a tu panel...</p>
    </div>
  )
}