// src/app/(private)/dashboard-candidato/editar-campana/page.js
'use client'
import React from 'react'
import { useAuth } from '@/context/AuthContext'

export default function EditarCampanaPage() {
  const { user } = useAuth()
  if (!user || user.role !== 'candidato') {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Acceso Denegado:</strong>
        <span className="block sm:inline">
          {' '}
          No tienes permisos para ver esta página.
        </span>
      </div>
    )
  }
  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold text-gray-800 mb-4">Editar Campaña</h1>
      <p className="text-gray-600 mb-4">
        Aquí podrás modificar los detalles de tu campaña.
      </p>
      {user && (
        <p className="text-sm text-gray-500">
          Logueado como: {user.name} (Rol: {user.role})
        </p>
      )}
    </div>
  )
}
