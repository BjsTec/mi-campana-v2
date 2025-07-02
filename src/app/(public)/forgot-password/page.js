'use client' // Directiva esencial para un componente de cliente en Next.js App Router

import { useRouter } from 'next/navigation' // Importar useRouter para la navegación
import { useState } from 'react' // CORREGIDO: Importar useState de React (no '=')

export default function ForgotPasswordPage() {
  const [cedula, setCedula] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter() // Inicializar el router

  const handleSubmit = async (e) => {
    e.preventDefault() // Previene el comportamiento por defecto del formulario

    setError('') // Limpia cualquier error previo
    setSuccessMessage('') // Limpia cualquier mensaje de éxito previo
    setLoading(true) // Activa el estado de carga

    // Validación básica: asegurar que la cédula no esté vacía
    if (!cedula) {
      setError('Por favor, ingresa tu cédula para recuperar la contraseña.')
      setLoading(false)
      return
    }

    // Validación específica para la cédula (solo números)
    if (!/^\d+$/.test(cedula)) {
      setError('La cédula solo debe contener números.')
      setLoading(false)
      return
    }

    // Aquí iría la lógica para enviar la cédula a tu Firebase Function (backend)
    // para iniciar el proceso de recuperación de contraseña.
    // Por ejemplo, enviar un correo electrónico con un enlace de restablecimiento.
    try {
      console.log('Intentando recuperar contraseña para cédula:', cedula)

      // Simulación de una llamada a la API
      // REMPLAZA ESTO CON LA URL REAL DE TU ENDPOINT DE RECUPERACIÓN DE CONTRASEÑA
      // const response = await fetch('TU_FIREBASE_FUNCTION_RESET_PASSWORD_URL', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({ cedula }),
      // });

      // const data = await response.json();

      // if (!response.ok) {
      //   throw new Error(data.message || 'Error al solicitar el restablecimiento de contraseña.');
      // }

      // Simulación de éxito después de 2 segundos
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setSuccessMessage(
        'Si tu cédula está registrada, recibirás instrucciones para restablecer tu contraseña en breve.',
      )
      setCedula('') // Limpiar el campo después de un intento exitoso
    } catch (err) {
      console.error('Error durante la recuperación de contraseña:', err)
      setError(
        err.message || 'Ocurrió un error inesperado al procesar tu solicitud.',
      )
    } finally {
      setLoading(false) // Desactiva el estado de carga
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-4 sm:p-6 lg:p-8">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-sm sm:max-w-md md:max-w-lg text-center transform hover:scale-105 transition-transform duration-300 ease-in-out">
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-6 tracking-tight">
          Recuperar Contraseña
        </h1>
        <p className="text-lg text-neutral-600 mb-8">
          Ingresa tu cédula para recibir un enlace de restablecimiento.
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
              type="number" // Input numérico
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
              className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-md shadow-sm placeholder-neutral-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-base transition-all duration-200"
              placeholder="Ej: 123456789"
              aria-label="Cédula de recuperación"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </div>

          {error && (
            <p className="text-error text-sm mt-4" role="alert">
              {error}
            </p>
          )}

          {successMessage && (
            <p className="text-success text-sm mt-4" role="status">
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
              // SVG del spinner
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
              'Enviar Enlace de Recuperación'
            )}
          </button>
        </form>

        <p className="mt-8 text-sm text-neutral-600">
          ¿Recordaste tu contraseña?{' '}
          <a
            href="#" // El href="#" se mantiene para cumplir con la estructura de <a>
            onClick={() => router.push('/login')} // Usar router.push para navegar al login
            className="font-medium text-primary hover:text-primary-dark"
          >
            Volver al inicio de sesión
          </a>
        </p>
      </div>
    </div>
  )
}
