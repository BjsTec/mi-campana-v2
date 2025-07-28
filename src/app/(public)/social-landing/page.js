// src/app/(public)/social-landing/page.js
'use client' // Este componente usará useState para manejar el formulario y Link

import React, { useState } from 'react'
import Link from 'next/link'

export default function SocialLandingPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    interestedIn: '',
    message: '',
    source: '', // Reincorporado el campo 'source'
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
      // URL de tu Firebase Function submitContactForm
      const response = await fetch(
        'https://us-central1-micampanav2.cloudfunctions.net/submitContactForm',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          // Enviamos los datos del formulario, incluyendo 'source'
          body: JSON.stringify(formData),
        },
      )

      const result = await response.json()

      if (response.ok) {
        setStatus('success')
        setFormData({
          name: '',
          email: '',
          phone: '',
          interestedIn: '',
          message: '',
          source: '',
        }) // Limpiar formulario
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

  // Opciones para el campo "Cómo nos conoció"
  const sourceOptions = [
    { value: '', label: '¿Cómo nos conoció? (Opcional)' }, // Etiqueta para indicar que es opcional
    { value: 'redes_sociales', label: 'Redes Sociales' },
    { value: 'busqueda_google', label: 'Búsqueda en Google' },
    { value: 'referido', label: 'Referido' },
    { value: 'evento_politico', label: 'Evento Político' },
    { value: 'publicidad_online', label: 'Publicidad Online' },
    { value: 'otro', label: 'Otro' },
  ]

  return (
    <div className="min-h-screen bg-primary-dark text-neutral-50 flex flex-col items-center">
      {' '}
      {/* Eliminado py-12 */}
      {/* Header minimalista: solo logo y enlaces discretos */}
      <header className="w-full max-w-6xl flex justify-between items-center py-6 px-4">
        {' '}
        {/* Ajustado py */}
        <div className="text-3xl font-bold text-neutral-50">
          <Link href="/">Autoridad Política</Link>
        </div>
        <nav className="hidden md:flex space-x-6 text-neutral-50 text-sm">
          <Link
            href="https://www.youtube.com/watch?v=2Qxy_x0CTmw"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-secondary-DEFAULT transition-colors duration-200"
          >
            Nuestro Proceso
          </Link>
          {/* <Link href="#contacto-form" className="hover:text-secondary-DEFAULT transition-colors duration-200">Contacto</Link> */}
        </nav>
      </header>
      {/* Contenido principal: Estructura de dos columnas */}
      <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12 p-4 md:p-8 flex-grow">
        {' '}
        {/* Añadido flex-grow */}
        {/* Columna Izquierda: Información y Proceso */}
        <div className="text-neutral-50">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold mb-6 leading-tight">
            Contáctanos
          </h1>
          <p className="text-lg sm:text-xl opacity-90 mb-8 max-w-md">
            ¿Buscas un aliado estratégico para tu campaña? Estás en el lugar
            correcto.
          </p>

          <div className="bg-primary-DEFAULT p-6 rounded-lg shadow-lg mb-8">
            <h2
              id="proceso"
              className="text-2xl font-bold mb-4 text-neutral-50"
            >
              ¿Cuál será el siguiente paso?
            </h2>
            <p className="text-lg opacity-90 mb-6">
              Estás a un paso de construir tu producto político perfecto.
            </p>
            <ol className="space-y-4 text-lg">
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-secondary-DEFAULT text-primary-dark font-bold mr-3">
                  1
                </span>
                <div>
                  <h3 className="font-semibold text-neutral-50">
                    Prepararemos una propuesta
                  </h3>
                  <p className="text-neutral-300 text-sm">
                    Analizaremos tus necesidades y te enviaremos una propuesta
                    personalizada en menos de 24 horas.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-secondary-DEFAULT text-primary-dark font-bold mr-3">
                  2
                </span>
                <div>
                  <h3 className="font-semibold text-neutral-50">
                    Lo discutiremos juntos
                  </h3>
                  <p className="text-neutral-300 text-sm">
                    Revisaremos la propuesta, ajustaremos detalles y
                    responderemos todas tus preguntas.
                  </p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-secondary-DEFAULT text-primary-dark font-bold mr-3">
                  3
                </span>
                <div>
                  <h3 className="font-semibold text-neutral-50">
                    Comenzaremos a construir
                  </h3>
                  <p className="text-neutral-300 text-sm">
                    Una vez aprobada, tu campaña estará en marcha con el soporte
                    de Autoridad Política.
                  </p>
                </div>
              </li>
            </ol>
          </div>

          {/* Botón de Más Información / Ver Plataforma Completa */}
          <div className="text-center lg:text-left mt-8">
            <Link
              href="/"
              className="bg-neutral-50 text-primary-dark px-8 py-3 rounded-full font-bold text-lg 
                shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-105"
            >
              Ver la Plataforma Completa
            </Link>
          </div>
        </div>
        {/* Columna Derecha: Formulario de Contacto */}
        <div
          className="bg-white text-primary-dark p-8 md:p-12 rounded-lg shadow-2xl border border-neutral-200"
          id="contacto-form"
        >
          <div className="flex items-center justify-center mb-6">
            <svg
              className="w-12 h-12 text-primary-DEFAULT mr-3"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </svg>
            <p className="text-lg sm:text-xl text-neutral-600 font-semibold">
              Cuéntanos sobre tu proyecto y te prepararemos una propuesta en 24
              horas.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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

            {/* Nuevo campo: Cómo nos conoció (opcional) */}
            <div>
              <label
                htmlFor="source"
                className="block text-neutral-800 text-sm font-bold mb-2"
              >
                ¿Cómo nos conoció? (Opcional)
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
                rows="4"
                required
                className="shadow appearance-none border rounded w-full py-3 px-4 text-neutral-800 leading-tight focus:outline-none focus:ring-2 focus:ring-primary-DEFAULT focus:border-transparent transition-all duration-200"
              ></textarea>
            </div>

            <div className="flex items-center justify-center pt-4">
              <button
                type="submit"
                disabled={status === 'loading'}
                className={`
                  bg-secondary-DEFAULT text-primary-dark px-10 py-3 rounded-full font-bold text-lg w-full sm:w-auto
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
                Hubo un error al enviar tu mensaje. Por favor, inténtalo de
                nuevo.
              </p>
            )}
          </form>
        </div>
      </main>
      {/* Footer simplificado */}
      <footer className="mt-8 text-center text-neutral-400 text-sm w-full">
        {' '}
        {/* Ajustado mt y añadido w-full */}
        <div className="flex justify-center space-x-4 mb-4">
          <a
            href="https://facebook.com/autoridadpolitica"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-neutral-50 transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3 8h-1.5c-.828 0-1.5.672-1.5 1.5V12h3l-.5 3h-2.5v7h-3v-7h-2v-3h2v-2c0-1.657 1.343-3 3-3h3V8z" />
            </svg>
          </a>
          <a
            href="https://twitter.com/autoridadpolitic"
            target="_blank"
            rel="noopener noreferrer"
            className="text-neutral-400 hover:text-neutral-50 transition-colors duration-200"
          >
            <svg
              className="w-6 h-6"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm6.5 6.5c-.5.2-1 .3-1.5.3.6-.4 1-.9 1.2-1.5-.5.3-1.1.5-1.7.6-.5-.5-1.2-.8-1.9-.8-1.5 0-2.7 1.2-2.7 2.7 0 .2 0 .4.1.6-2.2-.1-4.2-1.2-5.5-3-.2.4-.3.9-.3 1.4 0 .9.5 1.7 1.2 2.2-.4 0-.9-.1-1.2-.3v.1c0 1.3.9 2.3 2.1 2.6-.2.1-.5.1-.7.1-.2 0-.4 0-.6-.1.3 1.1 1.3 1.9 2.4 1.9-1 .8-2.2 1.3-3.6 1.3-.2 0-.4 0-.7 0C6.5 18.2 8 18.7 9.5 18.7c10.2 0 15.7-8.5 15.7-15.7 0-.2 0-.5-.1-.7.7-.5 1.2-1.1 1.6-1.8z" />
            </svg>
          </a>
        </div>
        &copy; {new Date().getFullYear()} Autoridad Política. Todos los derechos
        reservados.
      </footer>
    </div>
  )
}
