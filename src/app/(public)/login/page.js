'use client' // Directiva esencial para un componente de cliente en Next.js App Router

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import BackButton from '@/components/ui/BackButton'
import Lottie from 'lottie-react'
import loginLoadingAnimation from '@/animations/loginOne.json'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  // --- CORRECCIÓN 2: Renombrar 'email' a 'cedula' para mayor claridad ---
  const [cedula, setCedula] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const router = useRouter()
  const { login } = useAuth()

  const handleGoBack = () => {
    router.push('/')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setLoading(true)

    if (!cedula || !password) {
      setError('Por favor, ingresa tu cédula y contraseña.')
      setLoading(false)
      return
    }

    try {
      // --- CORRECCIÓN 1: Llamar directamente a la Cloud Function de Firebase ---
      // Asegúrate de añadir esta variable de entorno en tu archivo .env.local
      // NEXT_PUBLIC_LOGIN_FUNCTION_URL=https://loginwithemail-sfa54lzvpa-uc.a.run.app
      const loginFunctionUrl = process.env.NEXT_PUBLIC_LOGIN_FUNCTION_URL

      if (!loginFunctionUrl) {
        throw new Error('La URL de la función de login no está configurada.')
      }

      const response = await fetch(loginFunctionUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // El backend espera el campo 'email', por eso enviamos la cédula en ese campo.
        body: JSON.stringify({ email: cedula, clave: password }),
      })

      const data = await response.json()

      if (response.ok) {
        const {
          idToken,
          firebaseAuthUid,
          name,
          role,
          email: userEmailFromResponse,
        } = data

        if (!idToken) {
          throw new Error('El servidor no proporcionó un token de sesión.')
        }

        // 2. Llamar al Route Handler local para establecer la cookie de sesión segura
        const cookieResponse = await fetch('/api/set-session-cookie', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ idToken }), // Envía solo el token
        })

        if (!cookieResponse.ok) {
          const errorData = await cookieResponse.json()
          throw new Error(
            errorData.message || 'Error al establecer la sesión del servidor.',
          )
        }

        // 3. Almacenar datos del usuario en el contexto y redirigir
        login({
          firebaseAuthUid,
          email: userEmailFromResponse,
          name,
          role,
        })

        setSuccessMessage(data.message || '¡Inicio de sesión exitoso!')

        if (data.role === 'admin') {
          router.push('/dashboard-admin/nueva-campana')
        } else if (data.role === 'candidato') {
          router.push('/dashboard-candidato')
        } else {
          router.push('/dashboard-internal')
        }
      } else {
        // Si la respuesta no es OK, lanza un error con el mensaje del backend
        throw new Error(data.message || 'Error desconocido al iniciar sesión.')
      }
    } catch (err) {
      console.error('Error durante el proceso de login:', err)
      setError(err.message || 'Ocurrió un error inesperado.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-primary-dark p-4">
      {loading && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50 backdrop-blur-sm">
          <Lottie
            animationData={loginLoadingAnimation}
            loop={true}
            autoplay={true}
            style={{ width: 200, height: 200 }}
          />
        </div>
      )}
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md text-center transform hover:scale-105 transition-transform duration-300">
        <h1 className="text-4xl font-extrabold text-neutral-800 mb-6">
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
              className="mt-1 block w-full px-4 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
              placeholder="Ej: 123456789"
              inputMode="numeric"
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
                className="block w-full px-4 py-2 border border-neutral-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary pr-10"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-600 hover:text-primary"
                aria-label={
                  showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'
                }
              >
                {/* SVG para el icono del ojo (visible/oculto) */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  {showPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.622A8.967 8.967 0 00.995 12c0 1.92.707 3.743 1.98 5.176l7.346-7.346a3.007 3.007 0 014.252-4.252l2.28-2.28A8.967 8.967 0 0012 4.5c-2.126 0-4.08.736-5.614 1.978l-2.396 2.144zM12 15a3 3 0 100-6 3 3 0 000 6z"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178zM15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  )}
                </svg>
              </button>
            </div>
          </div>

          {error && (
            <p className="text-red-600 text-sm mt-4" role="alert">
              {error}
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
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-8 space-y-4">
          <p className="text-sm text-neutral-800">
            ¿Olvidaste tu contraseña?{' '}
            <a
              href="/forgot-password"
              className="font-medium text-primary hover:text-primary-dark"
            >
              Click aquí
            </a>
          </p>
          <BackButton onClick={handleGoBack} className="w-full" />
        </div>
      </div>
    </div>
  )
}
