'use client' // Directiva esencial para un componente de cliente en Next.js App Router

import { useRouter } from 'next/navigation' // 1. Primero Next.js
// eslint-disable-next-line import/order
import { useState } from 'react' // 2. Luego React (sin línea vacía entre ellos ahora)

// eslint-disable-next-line import/order
import BackButton from '@/components/ui/BackButton' // 3. Luego componentes locales (sin línea vacía entre ellos ahora)

export default function LoginPage() {
  const [cedula, setCedula] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('') // Estado para mensajes de éxito
  const [loading, setLoading] = useState(false) // Estado de carga para el botón
  const [showPassword, setShowPassword] = useState(false) // Estado para alternar visibilidad de contraseña

  const router = useRouter() // Inicializa el router para la navegación

  // Función para manejar el regreso a la página principal
  const handleGoBack = () => {
    router.push('/') // Navega directamente a la página de inicio
  }

  const handleSubmit = async (e) => {
    e.preventDefault() // Previene el comportamiento por defecto del formulario

    setError('') // Limpia cualquier error previo
    setSuccessMessage('') // Limpia cualquier mensaje de éxito previo
    setLoading(true) // Activa el estado de carga

    // Validaciones básicas antes de enviar
    if (!cedula || !password) {
      setError('Por favor, ingresa tu cédula y contraseña.')
      setLoading(false)
      return
    }

    // Validación específica para la cédula (asegurarse de que sean solo números)
    if (!/^\d+$/.test(cedula)) {
      setError('La cédula solo debe contener números.')
      setLoading(false)
      return
    }

    // Aquí iría la lógica para enviar los datos a tu Firebase Function (backend)
    // Por ahora, solo simularemos una llamada a la API
    try {
      console.log('Intentando iniciar sesión con:', { cedula, password })
      // Simulación de una llamada a la API con un retardo de 2 segundos
      await new Promise((resolve) => setTimeout(resolve, 2000))
      console.log('¡Inicio de sesión exitoso simulado!')
      setSuccessMessage('¡Inicio de sesión exitoso!') // Mensaje de éxito en la UI
      // Redirigir al usuario o manejar el estado de autenticación aquí
    } catch (err) {
      console.error('Error durante el inicio de sesión:', err)
      setError(err.message || 'Ocurrió un error inesperado.')
    } finally {
      setLoading(false) // Desactiva el estado de carga
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg text-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-6 tracking-tight">
          Bienvenido
        </h1>
        <p className="text-lg text-neutral-800 mt-4 mb-8">
          Panel de control La Campaña
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="cedula"
              className="block text-left text-sm font-medium text-neutral-600 mb-1"
            >
              Cédula
            </label>
            <input
              type="number"
              id="cedula"
              name="cedula"
              value={cedula}
              onChange={(e) => {
                const value = e.target.value
                if (value === '' || /^\d+$/.test(value)) {
                  setCedula(value)
                }
              }}
              required
              className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-base transition-all duration-200 text-neutral-800"
              placeholder="Ej: 123456789"
              aria-label="Cédula"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-left text-sm font-medium text-neutral-600 mb-1"
            >
              Contraseña
            </label>
            <div className="relative mt-1">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full px-4 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-base transition-all duration-200 pr-10 text-neutral-800"
                placeholder="••••••••"
                aria-label="Contraseña"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-600 hover:text-primary focus:outline-none focus:text-primary"
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {showPassword ? (
                  // Icono de ojo tachado (oculto)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.622A8.967 8.967 0 00.995 12c0 1.92.707 3.743 1.98 5.176l7.346-7.346z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 15a3 3 0 100-6 3 3 0 000 6z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15.75 6.096a9.006 9.006 0 014.24 7.64c-.933 1.762-2.617 3.167-4.529 3.86L15.75 6.096z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12c0-1.03.187-2.023.535-2.946l9.661 9.661c-.446.446-.913.824-1.402 1.139a9.006 9.006 0 01-4.24-7.64c.933-1.762 2.617-3.167 4.529-3.86L2.25 12z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 12c0 1.03-.187 2.023-.535 2.946l-9.661-9.661c.446-.446.913-.824 1.402-1.139a9.006 9.006 0 014.24 7.64c-.933 1.762-2.617 3.167-4.529 3.86L19.5 12z"
                    />
                  </svg>
                ) : (
                  // Icono de ojo (visible)
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {error && (
            <p className="text-error text-sm mt-4" role="alert">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="text-secondary text-sm mt-4" role="status">
              {successMessage}
            </p>
          )}

          <button
            type="submit"
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-semibold text-white transition-all duration-300 ${
              loading
                ? 'bg-primary-light cursor-not-allowed'
                : 'bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
            }`}
            disabled={loading}
          >
            {loading ? (
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth={4}
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        {/* Agrupar los enlaces y los textos finales */}
        <div className="mt-8 space-y-4">
          {/* Enlace para 'Olvidaste tu contraseña' */}
          <p className="text-sm text-neutral-800">
            ¿Olvidaste tu contraseña?{' '}
            <a
              href="/forgot-password" // Ruta explícita para recuperación de contraseña
              className="font-medium text-primary hover:text-primary-dark"
            >
              Click aquí
            </a>
          </p>

          <p className="text-lg text-neutral-800 mt-6">
            Consolida tu potencial electoral.
            <br />
            Consolida tu equipo de trabajo.
          </p>

          {/* Botón de BackButton para regresar al inicio */}
          <BackButton onClick={handleGoBack} className="w-full" />
        </div>
      </div>
    </div>
  )
}
