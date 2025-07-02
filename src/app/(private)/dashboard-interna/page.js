// src/app/(private)/dashboard-internal/page.js
'use client' // Necesario si vas a usar hooks o interacción con el cliente

import React from 'react'
import { useAuth } from '@/context/AuthContext' // Para acceder a los datos del usuario

export default function DashboardInternalPage() {
  const { user } = useAuth() // Accede al usuario del contexto

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">
        Bienvenido al Panel General
      </h1>
      <p className="text-gray-600 mb-4">
        Este es el dashboard principal para todos los usuarios.
      </p>
      {user && (
        <p className="text-sm text-gray-500">
          Has iniciado sesión como:{' '}
          <span className="font-semibold">{user.name}</span> (Rol:{' '}
          <span className="font-semibold">{user.role}</span>)
        </p>
      )}
    </div>
  )
}
