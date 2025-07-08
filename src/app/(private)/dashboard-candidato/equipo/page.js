// src/app/(private)/dashboard-candidato/equipo/page.js

'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

// --- DATOS MOCKEADOS DE PERSONAS PARA LA LISTA (se mantiene igual) ---
const personasEquipoMock = [
  {
    id: 'p001',
    nombre: 'Ana María Gómez',
    cedula: '101010101',
    rol: 'Gerente',
    whatsapp: '+573101234567',
    pais: 'Colombia',
    ciudad: 'Bogotá',
    votosTotal: 750,
  },
  {
    id: 'p002',
    nombre: 'Carlos López',
    cedula: '202020202',
    rol: 'Anillo',
    whatsapp: '+573119876543',
    pais: 'Colombia',
    ciudad: 'Medellín',
    votosTotal: 420,
  },
  {
    id: 'p003',
    nombre: 'Sofía Pérez',
    cedula: '303030303',
    rol: 'Gerente',
    whatsapp: '+525512345678',
    pais: 'México',
    ciudad: 'Ciudad de México',
    votosTotal: 910,
  },
  {
    id: 'p004',
    nombre: 'Diego Ramírez',
    cedula: '404040404',
    rol: 'Anillo',
    whatsapp: '+5491123456789',
    pais: 'Argentina',
    ciudad: 'Buenos Aires',
    votosTotal: 150,
  },
  {
    id: 'p005',
    nombre: 'Laura Martínez',
    cedula: '505050505',
    rol: 'Anillo',
    whatsapp: '+573151122334',
    pais: 'Colombia',
    ciudad: 'Yopal',
    votosTotal: 680,
  },
  {
    id: 'p006',
    nombre: 'Juan David Olarte',
    cedula: '606060606',
    rol: 'Gerente',
    whatsapp: '+573201122334',
    pais: 'Colombia',
    ciudad: 'Cali',
    votosTotal: 890,
  },
  {
    id: 'p007',
    nombre: 'Valeria Serna',
    cedula: '707070707',
    rol: 'Anillo',
    whatsapp: '+573009988776',
    pais: 'Colombia',
    ciudad: 'Barranquilla',
    votosTotal: 345,
  },
]

export default function EquipoPage() {
  const [equipo, setEquipo] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const fetchEquipo = async () => {
      try {
        setCargando(true)
        await new Promise((resolve) => setTimeout(resolve, 1500))
        setEquipo(personasEquipoMock)
      } catch (err) {
        console.error('Error al cargar el equipo:', err)
        setError('No se pudo cargar la lista del equipo.')
      } finally {
        setCargando(false)
      }
    }

    fetchEquipo()
  }, [])

  if (cargando) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-xl text-neutral-600">Cargando equipo...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-neutral-100 flex items-center justify-center">
        <p className="text-xl text-error">{error}</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-4 sm:p-8">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-5xl mx-auto transform transition-all duration-300 hover:scale-[1.005]">
        <h2 className="text-4xl font-extrabold text-primary.dark mb-8 text-center tracking-tight">
          Nuestro Equipo de Trabajo
        </h2>

        {equipo.length === 0 ? (
          <p className="text-center text-neutral-600 text-lg">
            No hay personas registradas en el equipo.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {equipo.map((persona) => (
              <div
                key={persona.id}
                className="bg-white rounded-xl shadow-lg p-6 border border-neutral-200 transform transition-all duration-300 hover:shadow-xl hover:scale-[1.02] flex flex-col justify-between"
              >
                {/* Eliminado: El contenedor del avatar */}
                <div className="mb-4">
                  <h3 className="text-xl font-bold text-neutral-800 tracking-tight">
                    {persona.nombre}
                  </h3>
                  <p
                    className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      persona.rol === 'Gerente'
                        ? 'bg-success/10 text-success'
                        : 'bg-secondary.light text-secondary.dark'
                    } mt-1`}
                  >
                    {persona.rol}
                  </p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm text-neutral-600 flex items-center">
                    {/* Eliminado: Icono how_to_vote */}
                    <strong className="text-neutral-800">
                      Votos Totales:
                    </strong>{' '}
                    <span className="font-extrabold text-xl text-primary.DEFAULT ml-2">
                      {persona.votosTotal || 0}
                    </span>
                  </p>
                  <p className="text-sm text-neutral-600 flex items-center">
                    {/* Eliminado: Icono location_on */}
                    <strong className="text-neutral-800">Ciudad:</strong>{' '}
                    {persona.ciudad}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Botón para volver al formulario de registro */}
        <div className="mt-10 text-center">
          <Link
            href="/dashboard-candidato/nuevo-gerente"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg shadow-md text-white bg-primary.DEFAULT hover:bg-primary.dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary.DEFAULT transition-all duration-200 ease-in-out transform hover:-translate-y-1"
          >
            Volver al Registro
          </Link>
        </div>
      </div>
    </div>
  )
}
