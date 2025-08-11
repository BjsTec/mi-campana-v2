// src/components/landing/ContactFormSection.js
'use client'

import React, { useState, useEffect, useCallback } from 'react'

export default function ContactFormSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interestedIn: '',
    message: '',
  })
  const [status, setStatus] = useState('') // 'success', 'error', 'loading', ''
  const [interestedInOptions, setInterestedInOptions] = useState([])
  const [loadingOptions, setLoadingOptions] = useState(true)

  const SUBMIT_CONTACT_FORM_URL =
    process.env.NEXT_PUBLIC_SUBMIT_CONTACT_FORM_URL
  const GET_PUBLIC_CAMPAIGN_TYPES_URL =
    process.env.NEXT_PUBLIC_GET_PUBLIC_CAMPAIGN_TYPES_URL

  const fetchCampaignTypes = useCallback(async () => {
    try {
      const response = await fetch(GET_PUBLIC_CAMPAIGN_TYPES_URL)
      const data = await response.json()
      if (response.ok) {
        // Mapea los datos del backend para usarlos en el select
        const options = data.map((item) => ({
          value: item.id,
          label: item.name,
        }))
        setInterestedInOptions([
          { value: '', label: 'Selecciona una opción' },
          ...options,
        ])
      } else {
        console.error('Error al cargar los tipos de campaña:', data.message)
        // Usar opciones estáticas en caso de fallo
        setInterestedInOptions([
          { value: '', label: 'Selecciona una opción' },
          { value: 'consulta_general', label: 'Consulta General' },
        ])
      }
    } catch (error) {
      console.error('Error de red al cargar opciones:', error)
      setInterestedInOptions([
        { value: '', label: 'Selecciona una opción' },
        { value: 'consulta_general', label: 'Consulta General' },
      ])
    } finally {
      setLoadingOptions(false)
    }
  }, [GET_PUBLIC_CAMPAIGN_TYPES_URL])

  useEffect(() => {
    fetchCampaignTypes()
  }, [fetchCampaignTypes])

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

    try {
      const response = await fetch(SUBMIT_CONTACT_FORM_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, source: 'Web' }),
      })

      const result = await response.json()

      if (response.ok) {
        setStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          interestedIn: '',
          message: '',
        })
      } else {
        setStatus('error')
        console.error(
          'Error al enviar el formulario:',
          result.message || 'Error desconocido',
        )
      }
    } catch (error) {
      console.error('Error de red o inesperado al enviar el formulario:', error)
      setStatus('error')
    }
  }

  return (
    <section id="contacto" className="py-20 bg-neutral-100">
      <div className="container mx-auto px-6 max-w-3xl">
        <h2 className="text-4xl font-extrabold text-primary-dark text-center mb-6">
          ¿Listo para Impulsar tu Campaña?
        </h2>
        <p className="text-xl text-neutral-600 text-center mb-12">
          Contáctanos hoy mismo para una asesoría personalizada y descubre cómo
          Autoridad Política puede ayudarte a alcanzar tus objetivos.
        </p>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-xl border border-neutral-200"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label
                htmlFor="name"
                className="block text-neutral-800 text-sm font-bold mb-2"
              >
                Nombre Completo
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
                Correo Electrónico
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                Interesado en
              </label>
              <select
                id="interestedIn"
                name="interestedIn"
                value={formData.interestedIn}
                onChange={handleChange}
                required
                disabled={loadingOptions}
                className="shadow border rounded w-full py-3 px-4 text-neutral-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent bg-white appearance-none transition-all duration-200"
              >
                {loadingOptions ? (
                  <option>Cargando opciones...</option>
                ) : (
                  interestedInOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))
                )}
              </select>
            </div>
          </div>

          <div className="mb-6">
            <label
              htmlFor="message"
              className="block text-neutral-800 text-sm font-bold mb-2"
            >
              Tu Mensaje
            </label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              required
              className="shadow appearance-none border rounded w-full py-3 px-4 text-neutral-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all duration-200"
            ></textarea>
          </div>

          <div className="flex items-center justify-center">
            <button
              type="submit"
              disabled={status === 'loading'}
              className={`
                bg-secondary-DEFAULT text-primary-dark px-12 py-4 rounded-full font-bold text-lg 
                shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105
                ${status === 'loading' ? 'opacity-70 cursor-not-allowed' : ''}
              `}
            >
              {status === 'loading' ? 'Enviando...' : 'Enviar Mensaje'}
            </button>
          </div>

          {status === 'success' && (
            <p className="text-success text-center mt-4 font-semibold">
              ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo
              pronto.
            </p>
          )}
          {status === 'error' && (
            <p className="text-error text-center mt-4 font-semibold">
              Hubo un error al enviar tu mensaje. Por favor, inténtalo de nuevo.
            </p>
          )}
        </form>
      </div>
    </section>
  )
}
