// src/app/(private)/dashboard-admin/potenciales/new/page.js
'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'

// Importamos el componente de alerta y el de botón
import Button from '@/components/ui/Button.jsx'
import Alert from '@/components/ui/Alert.js'

// Definimos la URL de la función desde las variables de entorno
const SUBMIT_CONTACT_FORM_URL = process.env.NEXT_PUBLIC_SUBMIT_CONTACT_FORM_URL

export default function NewLeadPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interestedIn: '',
    message: '',
    source: 'Manual (Admin)',
  })
  const [loading, setLoading] = useState(false)
  const [alert, setAlert] = useState({ visible: false, message: '', type: '' })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({ ...prevData, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setAlert({ visible: false, message: '', type: '' })

    if (!formData.name || !formData.email || !formData.interestedIn) {
      setAlert({
        visible: true,
        message: 'Por favor, completa todos los campos obligatorios.',
        type: 'error',
      })
      setLoading(false)
      return
    }

    try {
      const response = await fetch(SUBMIT_CONTACT_FORM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setAlert({
          visible: true,
          message: '¡Cliente potencial creado con éxito!',
          type: 'success',
        })
        setTimeout(() => router.push('/dashboard-admin/potenciales'), 1500)
      } else {
        setAlert({
          visible: true,
          message:
            result.message || 'Hubo un error al crear el cliente potencial.',
          type: 'error',
        })
        console.error('Error al añadir cliente potencial:', result)
      }
    } catch (error) {
      console.error('Error de red o inesperado:', error)
      setAlert({
        visible: true,
        message: 'Error de conexión. Por favor, inténtalo de nuevo.',
        type: 'error',
      })
    } finally {
      setLoading(false)
    }
  }

  const interestedInOptions = useMemo(
    () => [
      { value: '', label: 'Selecciona una opción' },
      { value: 'presidencia', label: 'Campaña Presidencial' },
      { value: 'senado', label: 'Campaña Senatorial' },
      { value: 'gobernacion', label: 'Campaña Gubernamental' },
      { value: 'alcaldia', label: 'Campaña de Alcaldía' },
      { value: 'concejo', label: 'Campaña de Concejo' },
      { value: 'edil', label: 'Campaña de Edil' },
      { value: 'equipo_de_trabajo', label: 'Plan Equipo de Trabajo (Gratis)' },
      { value: 'consulta_general', label: 'Consulta General' },
    ],
    [],
  )

  const sourceOptions = useMemo(
    () => [
      { value: 'Manual (Admin)', label: 'Manual (Admin)' },
      { value: 'referido', label: 'Referido' },
      { value: 'evento_politico', label: 'Evento Político' },
      { value: 'llamada_fria', label: 'Llamada en Frío' },
      { value: 'base_de_datos_antigua', label: 'Base de Datos Antigua' },
      { value: 'otro', label: 'Otro' },
    ],
    [],
  )

  return (
    <div className="min-h-screen bg-neutral-100 p-8">
      <div className="container mx-auto max-w-4xl bg-white rounded-lg shadow-xl p-8">
        <div className="flex justify-between items-center mb-6 border-b pb-4">
          <h1 className="text-3xl font-bold text-primary-dark">
            Crear Nuevo Cliente Potencial
          </h1>
          <Link
            href="/dashboard-admin/potenciales"
            className="inline-flex items-center bg-neutral-200 text-neutral-800 px-4 py-2 rounded-full text-sm font-semibold hover:bg-neutral-300 transition-colors duration-200"
          >
            <ArrowLeftIcon className="h-5 w-5 mr-2" /> Volver a la Lista
          </Link>
        </div>

        {alert.visible && (
          <Alert
            message={alert.message}
            type={alert.type}
            onClose={() => setAlert({ ...alert, visible: false })}
          />
        )}

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
                <option value="nuevo">Nuevo</option>
                <option value="contactado">Contactado</option>
                <option value="en_seguimiento">En Seguimiento</option>
                <option value="descartado">Descartado</option>
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

          <div className="mt-8 text-center">
            <div className="mt-8 text-center">
              <button
                type="submit"
                disabled={loading}
                className={`
            inline-flex items-center justify-center px-8 py-3 rounded-full font-bold text-lg
            bg-primary-DEFAULT text-white hover:bg-primary-dark
            transition-all duration-300 shadow-xl transform hover:scale-105
            ${loading ? 'opacity-70 cursor-not-allowed' : ''}
          `}
                style={{ backgroundColor: '#3084F2', color: '#FFFFFF' }}
              >
                {loading ? 'Creando Cliente...' : 'Crear Cliente Potencial'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
