// src/app/(private)/dashboard-test/page.js
'use client' // Componente de cliente para usar hooks

import { useAuth } from '@/context/AuthContext' // Asegúrate que esta importación sea correcta
import { useEffect } from 'react'

export default function DashboardTestPage() {
  const { user, loading: authLoading } = useAuth() // Accede a los datos del usuario del contexto

  useEffect(() => {
    // Loguea los datos del usuario en la consola del navegador
    console.log('DashboardTestPage: Datos del usuario desde AuthContext:', user)
    console.log(
      'DashboardTestPage: Estado de carga de autenticación:',
      authLoading,
    )
  }, [user, authLoading])

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-50 text-neutral-800">
        Cargando sesión...
      </div>
    )
  }

  if (!user) {
    // Si no hay usuario (ej. no logueado), esto no debería pasar si el middleware funciona,
    // pero es una salvaguarda.
    return (
      <div className="min-h-screen flex items-center justify-center bg-error-50 text-error-800">
        <p>Acceso denegado o sesión no iniciada.</p>
        <p>Revisa la consola para más detalles si esperabas estar logueado.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-green-50 text-green-800 p-4">
      <h1 className="text-3xl font-bold mb-4">¡Login Exitoso!</h1>
      <p className="text-lg">
        Usuario: <span className="font-semibold">{user.name || 'N/A'}</span>
      </p>
      <p className="text-lg">
        Rol: <span className="font-semibold">{user.role || 'N/A'}</span>
      </p>
      <p className="mt-4 text-sm">
        Revisa la consola de tu navegador (F12) para ver los datos completos del
        usuario.
      </p>
    </div>
  )
}
