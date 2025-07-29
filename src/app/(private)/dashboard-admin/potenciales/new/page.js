// src/app/(private)/dashboard-admin/potenciales/new/page.js
'use client'

import React, { useState } from 'react'
import { useAuth } from '../../../../../context/AuthContext' // Ajusta la ruta si es necesario
import { useRouter } from 'next/navigation' // Para la navegación programática
import Link from 'next/link' // Para el botón de regreso

// Define function URLs from environment variables
const ADD_LEAD_URL = process.env.NEXT_PUBLIC_ADD_LEAD_URL

// Icono de regreso
const BackIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-5 w-5 mr-2"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M10 19l-7-7m0 0l7-7m-7 7h18"
    />
  </svg>
)

export default function NewLeadPage() {
  const { idToken, authLoading } = useAuth()
  const router = useRouter()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interestedIn: '',
    message: '',
    source: 'Manual (Admin)', // Default para leads creados por admin
    status: 'nuevo', // Default para estado inicial
    initialNotes: '', // Campo para notas iniciales
  })
  const [status, setStatus] = useState('') // 'success', 'error', 'loading', ''

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setStatus('loading')

    if (authLoading || !idToken) {
      setStatus('error')
      console.error('Error: No autenticado para añadir cliente potencial.')
      return
    }

    try {
      const response = await fetch(ADD_LEAD_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${idToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setStatus('success')
        // Opcional: Redirigir a la lista de leads o al detalle del lead recién creado
        setTimeout(() => router.push('/dashboard-admin/potenciales'), 1500)
      } else {
        setStatus('error')
        console.error(
          'Error al añadir cliente potencial:',
          result.message || 'Error desconocido',
        )
      }
    } catch (error) {
      console.error(
        'Error de red o inesperado al añadir cliente potencial:',
        error,
      )
      setStatus('error')
    }
  }

  // Opciones para el campo "Interesado en"
  const interestedInOptions = [
    { value: '', label: 'Selecciona una opción' },
    { value: 'presidencia', label: 'Campaña Presidencial' },
    { value: 'senado', label: 'Campaña Senatorial' },
    { value: 'gobernacion', label: 'Campaña Gubernamental' },
    { value: 'alcaldia', label: 'Campaña de Alcaldía' },
    { value: 'concejo', label: 'Campaña de Concejo' },
    { value: 'edil', label: 'Campaña de Edil' },
    { value: 'equipo_de_trabajo', label: 'Plan Equipo de Trabajo (Gratis)' },
    { value: 'consulta_general', label: 'Consulta General' },
  ]

  // Opciones para el campo "Fuente" (cómo se obtuvo el lead)
  const sourceOptions = [
    { value: 'Manual (Admin)', label: 'Manual (Admin)' },
    { value: 'referido', label: 'Referido' },
    { value: 'evento_politico', label: 'Evento Político' },
    { value: 'llamada_fria', label: 'Llamada en Frío' },
    { value: 'base_de_datos_antigua', label: 'Base de Datos Antigua' },
    { value: 'otro', label: 'Otro' },
  ]

  // Opciones para el campo "Estado Inicial"
  const statusOptions = [
    { value: 'nuevo', label: 'Nuevo' },
    { value: 'contactado', label: 'Contactado' },
    { value: 'en_seguimiento', label: 'En Seguimiento' },
    { value: 'descartado', label: 'Descartado' },
  ]

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-neutral-100 text-primary-dark">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-DEFAULT"></div>
        <p className="ml-4">Cargando...</p>
      </div>
    )
  }

  if (!idToken) {
    return (
      <div className="p-8 bg-neutral-100 min-h-screen flex items-center justify-center">
        <div className="bg-error text-white p-4 rounded-md shadow-md">
          <p>
            No autenticado. Por favor, inicia sesión para acceder a esta página.
          </p>
          <button
            onClick={() => router.push('/login')}
            className="mt-4 bg-white text-error px-4 py-2 rounded-md hover:bg-neutral-100"
          >
            Ir a Iniciar Sesión
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <div className="container mx-auto max-w-4xl bg-white rounded-lg shadow-xl p-8">
        {/* Encabezado y botón de regreso */}
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-primary-dark">
            Crear Nuevo Cliente Potencial
          </h1>
          <Link
            href="/dashboard-admin/potenciales"
            className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold transition-colors duration-200"
            style={{ backgroundColor: '#D1D5DB', color: '#1F2937' }} // Inline style for solid color
          >
            <BackIcon /> Volver a la Lista
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="name"
                className="block text-neutral-800 text-sm font-bold mb-2"
              >
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-3 px-4 text-neutral-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label
                htmlFor="email"
                className="block text-neutral-800 text-sm font-bold mb-2"
              >
                Correo Electrónico <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="shadow appearance-none border rounded w-full py-3 px-4 text-neutral-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all duration-200"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="phone"
                className="block text-neutral-800 text-sm font-bold mb-2"
              >
                Número de Teléfono (Opcional)
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-3 px-4 text-neutral-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all duration-200"
              />
            </div>
            <div>
              <label
                htmlFor="interestedIn"
                className="block text-neutral-800 text-sm font-bold mb-2"
              >
                Interesado en <span className="text-red-500">*</span>
              </label>
              <select
                id="interestedIn"
                name="interestedIn"
                value={formData.interestedIn}
                onChange={handleChange}
                required
                className="shadow border rounded w-full py-3 px-4 text-neutral-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent bg-white appearance-none transition-all duration-200"
              >
                {interestedInOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="source"
                className="block text-neutral-800 text-sm font-bold mb-2"
              >
                Fuente
              </label>
              <select
                id="source"
                name="source"
                value={formData.source}
                onChange={handleChange}
                className="shadow border rounded w-full py-3 px-4 text-neutral-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent bg-white appearance-none transition-all duration-200"
              >
                {sourceOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="status"
                className="block text-neutral-800 text-sm font-bold mb-2"
              >
                Estado Inicial
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="shadow border rounded w-full py-3 px-4 text-neutral-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent bg-white appearance-none transition-all duration-200"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="message"
              className="block text-neutral-800 text-sm font-bold mb-2"
            >
              Mensaje Inicial (Opcional)
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="3"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-neutral-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all duration-200"
              placeholder="Mensaje inicial del cliente o detalles adicionales..."
            ></textarea>
          </div>

          <div>
            <label
              htmlFor="initialNotes"
              className="block text-neutral-800 text-sm font-bold mb-2"
            >
              Notas Adicionales (Opcional)
            </label>
            <textarea
              id="initialNotes"
              name="initialNotes"
              value={formData.initialNotes}
              onChange={handleChange}
              rows="3"
              className="shadow appearance-none border rounded w-full py-3 px-4 text-neutral-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all duration-200"
              placeholder="Añade cualquier nota interna relevante al crear este cliente potencial..."
            ></textarea>
          </div>

          <div className="flex items-center justify-center pt-4">
            <button
              type="submit"
              disabled={status === 'loading'}
              className={`
                px-10 py-4 rounded-full font-bold text-lg
                hover:bg-primary-dark transition-all duration-300 shadow-xl transform hover:scale-105
                ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}
              `}
              style={{ backgroundColor: '#3084F2', color: '#FFFFFF' }} // Inline style for solid color and white text
            >
              {status === 'loading'
                ? 'Creando Cliente...'
                : 'Crear Cliente Potencial'}
            </button>
          </div>

          {status === 'success' && (
            <p className="text-success text-center mt-4 font-semibold">
              ¡Cliente potencial creado con éxito!
            </p>
          )}
          {status === 'error' && (
            <p className="text-error text-center mt-4 font-semibold">
              Hubo un error al crear el cliente potencial. Por favor, inténtalo
              de nuevo.
            </p>
          )}
        </form>
      </div>
    </div>
  )
}
