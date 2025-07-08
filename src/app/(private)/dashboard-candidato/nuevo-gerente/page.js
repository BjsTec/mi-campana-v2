// src/app/(private)/dashboard-candidato/nuevo-gerente/page.js

// ¡IMPORTANTE! Esta línea es CRÍTICA. Indica que este es un "Client Component"
// y puede usar hooks de React como useState y useEffect.
'use client'

import { useState, useEffect } from 'react'
// import Alert from '@/components/ui/Alert'; // Removido por ahora, según tu indicación

// --- DATOS MOCKEADOS PARA PAÍSES, ESTADOS Y CIUDADES ---
const PaisesMock = [
  { id: 'CO', nombre: 'Colombia' },
  { id: 'MX', nombre: 'México' },
  { id: 'AR', nombre: 'Argentina' },
]

const EstadosMock = {
  CO: [
    { id: 'CAS', nombre: 'Casanare' },
    { id: 'CUN', nombre: 'Cundinamarca' },
    { id: 'ANT', nombre: 'Antioquia' },
  ],
  MX: [
    { id: 'CDMX', nombre: 'Ciudad de México' },
    { id: 'JAL', nombre: 'Jalisco' },
    { id: 'NLE', nombre: 'Nuevo León' },
  ],
  AR: [
    { id: 'BUE', nombre: 'Buenos Aires' },
    { id: 'COR', nombre: 'Córdoba' },
  ],
}

const CiudadesMock = {
  CAS: [
    { id: 'YOP', nombre: 'Yopal' },
    { id: 'AGZ', nombre: 'Aguazul' },
    { id: 'ORC', nombre: 'Orocué' },
  ],
  CUN: [
    { id: 'BOG', nombre: 'Bogotá' },
    { id: 'CHP', nombre: 'Chía' },
  ],
  ANT: [
    { id: 'MED', nombre: 'Medellín' },
    { id: 'ENV', nombre: 'Envigado' },
  ],
  CDMX: [
    { id: 'CUAU', nombre: 'Cuauhtémoc' },
    { id: 'MH', nombre: 'Miguel Hidalgo' },
  ],
  JAL: [{ id: 'GDL', nombre: 'Guadalajara' }],
  NLE: [{ id: 'MTY', nombre: 'Monterrey' }],
  BUE: [
    { id: 'CABA', nombre: 'CABA' },
    { id: 'LP', nombre: 'La Plata' },
  ],
  COR: [{ id: 'CORC', nombre: 'Córdoba Capital' }],
}

export default function Page() {
  const [formData, setFormData] = useState({
    nombre: '',
    cedula: '',
    whatsapp: '',
    telefono: '',
    pais: '',
    estado: '',
    ciudad: '',
    puestoVotacion: '',
    fechaNacimiento: '',
    sexo: '',
  })

  const [mensaje, setMensaje] = useState('')
  const [cargando, setCargando] = useState(false)
  const [estadosDisponibles, setEstadosDisponibles] = useState([])
  const [ciudadesDisponibles, setCiudadesDisponibles] = useState([])

  // Actualiza los estados disponibles cuando cambia el país seleccionado
  useEffect(() => {
    if (formData.pais) {
      setEstadosDisponibles(EstadosMock[formData.pais] || [])
      setFormData((prev) => ({ ...prev, estado: '', ciudad: '' }))
    } else {
      setEstadosDisponibles([])
    }
  }, [formData.pais])

  // Actualiza las ciudades disponibles cuando cambia el estado seleccionado
  useEffect(() => {
    if (formData.estado) {
      setCiudadesDisponibles(CiudadesMock[formData.estado] || [])
      setFormData((prev) => ({ ...prev, ciudad: '' }))
    } else {
      setCiudadesDisponibles([])
    }
  }, [formData.estado])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setCargando(true)
    setMensaje('') // Limpiar mensaje anterior

    // Validación básica antes de simular envío
    if (
      !formData.nombre ||
      !formData.cedula ||
      !formData.pais ||
      !formData.estado ||
      !formData.ciudad ||
      !formData.fechaNacimiento ||
      !formData.sexo
    ) {
      setMensaje(
        '❌ Por favor, completa todos los campos requeridos (marcados con *).',
      )
      setCargando(false)
      return
    }

    // --- NUEVOS DATOS SIMULADOS PARA EL BACKEND ---
    const datosAdicionalesBackend = {
      fechaCreacion: new Date().toISOString(),
      identificacionCreador: 'USR-001-ADMIN',
      identificacionCampaña: 'CMP-2025-ABCD',
      status: 'activo',
      verificado: false,
      verificadoPor: null,
      rating: (Math.random() * 4 + 1).toFixed(1),
      votosTotal: Math.floor(Math.random() * 1000),
      votosPromesa: Math.floor(Math.random() * 500),
      votosPotenciales: Math.floor(Math.random() * 200),
      votosReales: Math.floor(Math.random() * 100),
    }

    const datosParaBackend = {
      ...formData,
      ...datosAdicionalesBackend,
    }

    console.log(
      'Datos COMPLETOS del formulario a enviar (simulado al backend):',
      datosParaBackend,
    )

    // --- SIMULACIÓN DE ENVÍO AL BACKEND ---
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000))

      setMensaje(
        '� ¡Registro creado con éxito! (Simulado al backend con datos adicionales)',
      )
      setFormData({
        nombre: '',
        cedula: '',
        whatsapp: '',
        telefono: '',
        pais: '',
        estado: '',
        ciudad: '',
        puestoVotacion: '',
        fechaNacimiento: '',
        sexo: '',
      })
    } catch (error) {
      console.error('Error al enviar el formulario:', error)
      setMensaje('❌ Ocurrió un error inesperado al crear el registro.')
    } finally {
      setCargando(false)
    }
  }

  // --- HANDLERS PARA LOS NUEVOS BOTONES ---
  const handleGerenteClick = () => {
    console.log('¡Botón "Gerente" presionado!')
    setMensaje('Has presionado el botón "Gerente".')
  }

  const handleAnilloClick = () => {
    console.log('¡Botón "Anillo" presionado!')
    setMensaje('Has presionado el botón "Anillo".')
  }

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-2xl">
        {/* --- NUEVOS BOTONES --- */}
        <div className="flex justify-center gap-4 mb-8">
          <button
            onClick={handleGerenteClick}
            className="px-6 py-3 bg-green-600 text-white font-bold rounded-md shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-150 ease-in-out"
          >
            Gerente
          </button>
          <button
            onClick={handleAnilloClick}
            className="px-6 py-3 bg-purple-600 text-white font-bold rounded-md shadow-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-150 ease-in-out"
          >
            Anillo
          </button>
        </div>
        {/* --- FIN NUEVOS BOTONES --- */}

        <h2 className="text-3xl font-extrabold text-gray-900 mb-6 text-center">
          Registro de Nueva Persona
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Información Personal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="nombre"
                className="block text-sm font-medium text-gray-700"
              >
                Nombre Completo <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                id="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="cedula"
                className="block text-sm font-medium text-gray-700"
              >
                Cédula / Identificación <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="cedula"
                id="cedula"
                value={formData.cedula}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Contacto */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="whatsapp"
                className="block text-sm font-medium text-gray-700"
              >
                WhatsApp
              </label>
              <input
                type="tel"
                name="whatsapp"
                id="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Ej: +57 3XX YYY ZZZZ"
              />
            </div>
            <div>
              <label
                htmlFor="telefono"
                className="block text-sm font-medium text-gray-700"
              >
                Teléfono Fijo
              </label>
              <input
                type="tel"
                name="telefono"
                id="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Ubicación */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label
                htmlFor="pais"
                className="block text-sm font-medium text-gray-700"
              >
                País <span className="text-red-500">*</span>
              </label>
              <select
                name="pais"
                id="pais"
                value={formData.pais}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Seleccione un país</option>
                {PaisesMock.map((pais) => (
                  <option key={pais.id} value={pais.id}>
                    {pais.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="estado"
                className="block text-sm font-medium text-gray-700"
              >
                Estado / Departamento <span className="text-red-500">*</span>
              </label>
              <select
                name="estado"
                id="estado"
                value={formData.estado}
                onChange={handleChange}
                disabled={
                  !formData.pais
                } /* Deshabilitado si no hay país seleccionado */
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Seleccione un estado</option>
                {estadosDisponibles.map((estado) => (
                  <option key={estado.id} value={estado.id}>
                    {estado.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="ciudad"
                className="block text-sm font-medium text-gray-700"
              >
                Ciudad <span className="text-red-500">*</span>
              </label>
              <select
                name="ciudad"
                id="ciudad"
                value={formData.ciudad}
                onChange={handleChange}
                disabled={
                  !formData.estado
                } /* Deshabilitado si no hay estado seleccionado */
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                <option value="">Seleccione una ciudad</option>
                {ciudadesDisponibles.map((ciudad) => (
                  <option key={ciudad.id} value={ciudad.id}>
                    {ciudad.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="puestoVotacion"
                className="block text-sm font-medium text-gray-700"
              >
                Puesto de Votación
              </label>
              <input
                type="text"
                name="puestoVotacion"
                id="puestoVotacion"
                value={formData.puestoVotacion}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="fechaNacimiento"
                className="block text-sm font-medium text-gray-700"
              >
                Fecha de Nacimiento <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                id="fechaNacimiento"
                value={formData.fechaNacimiento}
                onChange={handleChange}
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Sexo */}
          <div>
            <label
              htmlFor="sexo"
              className="block text-sm font-medium text-gray-700"
            >
              Sexo <span className="text-red-500">*</span>
            </label>
            <select
              name="sexo"
              id="sexo"
              value={formData.sexo}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            >
              <option value="">Seleccione</option>
              <option value="M">Masculino</option>
              <option value="F">Femenino</option>
              <option value="O">Otro</option>
            </select>
          </div>

          {/* Mensajes de Estado */}
          {mensaje && (
            <p
              className={`text-center font-semibold ${mensaje.includes('éxito') ? 'text-green-600' : 'text-red-600'}`}
            >
              {mensaje}
            </p>
          )}

          {/* Botón de Envío */}
          <div>
            <button
              type="submit"
              disabled={cargando}
              className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${cargando ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'}`}
            >
              {cargando ? 'Registrando Persona...' : 'Registrar Persona'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
