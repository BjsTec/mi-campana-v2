// src/app/(private)/dashboard-admin/lista-usuarios/page.js
'use client'

import React from 'react'

import { useAuth } from '@/context/AuthContext' // Para mostrar info del usuario logueado

// --- Datos simulados de usuarios ---
const simulatedUsers = [
  {
    id: 1,
    nombre: 'Ana García',
    ocupacion: 'Abogada',
    cedula: '1012345678',
    activo: true,
  },
  {
    id: 2,
    nombre: 'Luis Pérez',
    ocupacion: 'Ingeniero',
    cedula: '1098765432',
    activo: false,
  },
  {
    id: 3,
    nombre: 'Marta Díaz',
    ocupacion: 'Diseñadora',
    cedula: '1054321098',
    activo: true,
  },
  {
    id: 4,
    nombre: 'Pedro Gómez',
    ocupacion: 'Vendedor',
    cedula: '1087654321',
    activo: true,
  },
  {
    id: 5,
    nombre: 'Sofía Castro',
    ocupacion: 'Contadora',
    cedula: '1023456789',
    activo: false,
  },
  {
    id: 6,
    nombre: 'Juan Latorre',
    ocupacion: 'Médico',
    cedula: '1000000001',
    activo: true,
  },
  {
    id: 7,
    nombre: 'Elena Ramírez',
    ocupacion: 'Arquitecta',
    cedula: '1000000002',
    activo: false,
  },
  {
    id: 8,
    nombre: 'Carlos Ortiz',
    ocupacion: 'Programador',
    cedula: '1000000003',
    activo: true,
  },
]

// --- Definición de colores pastel ---
const pastelColors = [
  'bg-blue-50', // Azul pastel
  'bg-green-50', // Verde pastel
  'bg-yellow-50', // Amarillo pastel
  'bg-pink-50', // Rosa pastel
  'bg-purple-50', // Morado pastel
]

export default function ListaUsuariosPage() {
  const { user } = useAuth() // Obtiene el usuario logueado del contexto

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Lista de Usuarios Simulados
      </h1>
      <p className="text-gray-600 mb-6">
        Aquí puedes ver una simulación de los usuarios registrados en el
        sistema.
      </p>

      {user && user.role === 'admin' ? (
        // Contenedor para las tarjetas, usando un grid responsivo
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {' '}
          {/* SOLO LAYOUT DE GRID AQUÍ */}
          {simulatedUsers.map(
            (
              usuario,
              index, // <-- El map correcto con 'index'
            ) => (
              <div
                key={usuario.id}
                // Aquí aplicamos el color pastel y las clases de la tarjeta individual
                className={`${pastelColors[index % pastelColors.length]} rounded-lg shadow-lg p-6 transform hover:scale-105 transition duration-300 ease-in-out border border-gray-200`}
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {usuario.nombre}
                  </h2>
                  {/* Icono de estado Activo/Inactivo */}
                  <div
                    className={`w-4 h-4 rounded-full ${
                      usuario.activo ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    title={usuario.activo ? 'Activo' : 'Inactivo'}
                  />
                </div>
                <p className="text-gray-700 mb-2">
                  <span className="font-medium">Ocupación:</span>{' '}
                  {usuario.ocupacion}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Cédula:</span> {usuario.cedula}
                </p>
              </div>
            ),
          )}
        </div>
      ) : (
        // Mensaje si el usuario no es admin o no está logueado
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
      )}

      {/* Muestra información del usuario logueado (para depuración) */}
      {user && (
        <p className="mt-8 text-sm text-gray-500 text-center">
          Actualmente logueado como:{' '}
          <span className="font-semibold">{user.name}</span> (Rol:{' '}
          <span className="font-semibold">{user.role}</span>)
        </p>
      )}
    </div>
  )
}
