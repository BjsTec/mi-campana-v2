// src/components/landing/ContactFormSection.js
'use client' // Este componente usará useState para manejar el formulario

import React, { useState } from 'react'

export default function ContactFormSection() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interestedIn: '',
    message: '',
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

    try {
      // Aquí iría la lógica para enviar el formulario.
      // Por ahora, simularemos una llamada a una API.
      // En el futuro, podrías enviar esto a una Firebase Function o a un servicio de email.
      console.log('Datos del formulario:', formData)

      // Simular un envío exitoso
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setStatus('success')
      setFormData({
        name: '',
        email: '',
        phone: '',
        interestedIn: '',
        message: '',
      }) // Limpiar formulario
    } catch (error) {
      console.error('Error al enviar el formulario:', error)
      setStatus('error')
    }
  }

  // Opciones para el campo "Interesado en" (puedes cargar esto dinámicamente si lo necesitas)
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
                bg-primary-DEFAULT text-neutral-50 px-10 py-4 rounded-full font-bold text-lg 
                hover:bg-primary-dark transition-all duration-300 shadow-xl transform hover:scale-105
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
