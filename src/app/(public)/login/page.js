// src/app/(public)/login/page.js
'use client' // Directiva esencial para un componente de cliente en Next.js App Router

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { jwtDecode } from 'jwt-decode' // Asegúrate de que jwt-decode esté instalado

import Lottie from 'lottie-react' // Para la animación de carga
import loginLoadingAnimation from '@/animations/loginOne.json' // Tu archivo de animación Lottie
import { useAuth } from '@/context/AuthContext' // Tu contexto de autenticación

// Componentes UI reutilizables
import Input from '@/components/ui/Input'
import FormGroup from '@/components/ui/FormGroup'
import Button from '@/components/ui/Button'
import BackButton from '@/components/ui/BackButton'

// Asumiendo que las imágenes están en la carpeta public/
// No es necesario importar las imágenes directamente si están en la carpeta public
// import logoAutoridad from '@/assets/logo-autoridad.png';
// import iconAutoridad from '@/assets/icon-autoridad.png';

export default function LoginPage() {
  const [cedula, setCedula] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const router = useRouter()
  const { login } = useAuth()

  const handleGoBack = () => {
    router.push('/')
  }

// En tu componente de login

const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!cedula || !password) {
        setError('Por favor, ingresa tu cédula y contraseña.');
        setLoading(false);
        return;
    }

    try {
        // ✅ Tomar la URL desde variables de entorno
        const loginFunctionUrl = process.env.NEXT_PUBLIC_LOGIN_WITH_EMAIL_URL?.trim();

        if (!loginFunctionUrl || !/^https?:\/\//.test(loginFunctionUrl)) {
            throw new Error(
                `La URL de login no está configurada correctamente: "${loginFunctionUrl}". Verifica NEXT_PUBLIC_LOGIN_WITH_EMAIL_URL en Vercel.`
            );
        }

        const response = await fetch(loginFunctionUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: cedula, clave: password }),
        });

        let data = null;

        try {
            // ✅ Intentar parsear JSON solo si hay contenido
            const text = await response.text();
            data = text ? JSON.parse(text) : null;
        } catch {
            if (!response.ok) {
                throw new Error(
                    `Error ${response.status}: El servidor devolvió una respuesta no válida.`
                );
            }
            throw new Error('Respuesta del servidor inválida. No es JSON.');
        }

        if (response.ok) {
            const { idToken } = data || {};
            if (!idToken) {
                throw new Error('El servidor no proporcionó un token de sesión.');
            }

            // ✅ Establecer cookie en backend Next.js
            const cookieResponse = await fetch('/api/set-session-cookie', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ idToken }),
            });

            if (!cookieResponse.ok) {
                const errorData = await cookieResponse.json().catch(() => ({}));
                throw new Error(
                    errorData.message || 'Error al establecer la sesión en el servidor.'
                );
            }

            // Decodificar token y manejar redirección
            const decodedUserData = jwtDecode(idToken);
            login(decodedUserData, idToken);

            const redirects = {
                admin: '/dashboard-admin/home-wm',
                candidato: '/dashboard-candidato',
                manager: '/dashboard-manager/panel',
                anillo: '/dashboard-anillo/panel',
                votante: '/dashboard-votante/panel',
            };

            window.location.href =
                redirects[decodedUserData?.role] || '/registro-exitoso';
        } else {
            throw new Error(data?.message || 'Error desconocido al iniciar sesión.');
        }
    } catch (err) {
        console.error('Error durante el proceso de login:', err);
        setError(err.message || 'Ocurrió un error inesperado.');
    } finally {
        setLoading(false);
    }
};


  return (
    <div className="flex min-h-screen bg-neutral-900 font-body">
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
      {/* Columna Izquierda: Área de Branding/Visual (Solo para Desktop) */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center bg-gradient-to-br from-primary-dark to-primary-800 p-8 relative overflow-hidden">
        {/* Fondo con formas abstractas sutiles (TU CÓDIGO SVG) */}
        <div className="absolute inset-0 z-0 opacity-10">
          <svg
            className="w-full h-full"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid slice"
            fill="none"
          >
            <circle
              cx="20"
              cy="20"
              r="15"
              fill="currentColor"
              className="text-secondary-DEFAULT opacity-20 animate-pulse-slow"
            />
            <rect
              x="70"
              y="10"
              width="15"
              height="15"
              fill="currentColor"
              className="text-secondary-DEFAULT opacity-20 animate-pulse-slow delay-1000"
            />
            <polygon
              points="50,80 60,95 40,95"
              fill="currentColor"
              className="text-secondary-DEFAULT opacity-20 animate-pulse-slow delay-2000"
            />
            <path
              d="M10 50 Q 30 30, 50 50 T 90 50"
              stroke="currentColor"
              strokeWidth="0.5"
              className="text-neutral-50 opacity-10 animate-fade-in"
            />
          </svg>
        </div>

        {/* Contenido principal de la columna izquierda (Logo y Texto Principal) */}
        <div className="relative z-10 text-white text-center flex flex-col items-center justify-center">
          <div className="mb-8">
            <img
              src="/logo.png" // Ruta directa a public/logo-autoridad.png
              alt="Autoridad Política Logo"
              className="h-32 md:h-48 lg:h-64 mx-auto" // Aumento de tamaño aplicado en la última instrucción
            />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 font-headings">
            Autoridad Política
          </h2>
          <p className="text-xl md:text-2xl leading-relaxed max-w-sm">
            La plataforma definitiva para la gestión estratégica y la victoria
            electoral.
          </p>
        </div>
      </div>
      {/* Columna Derecha: Formulario de Login (Responsive) */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 sm:p-8 bg-white relative z-20">
        <div className="rounded-xl shadow-2xl w-full max-w-md overflow-hidden">
          {' '}
          {/* Eliminamos bg-white y text-center de aquí */}
          {/* Nueva sección de cabecera azul para el logo */}
          {/* Oculta en lg (desktop) para que se vea la columna izquierda, visible en md (tablet) y sm (mobile) */}
          <div className="lg:hidden bg-primary-dark p-6 flex justify-center items-center">
            <img
              src="/logo.png" // Usamos el logo principal aquí
              alt="Autoridad Política Logo"
              className="h-20 mx-auto" // Ajusta el tamaño del logo en la cabecera responsive
            />
          </div>
          {/* El resto del formulario con fondo blanco */}
          <div className="bg-white p-6 sm:p-8 text-center">
            {' '}
            {/* Agregamos bg-white y text-center aquí */}
            <h1 className="text-3xl font-bold text-neutral-800 mb-2 font-headings">
              Bienvenido
            </h1>
            <p className="text-neutral-600 mb-8 font-body">
              Es fácil maximizar tu impacto y organización.
            </p>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de Cédula - Alineado a la izquierda */}
              <FormGroup
                label="Cédula"
                htmlFor="cedula"
                error={error && cedula === '' ? error : ''}
                labelClassName="text-neutral-700 text-left w-full"
              >
                <Input
                  id="cedula"
                  name="cedula"
                  type="number"
                  value={cedula}
                  onChange={(e) => {
                    const value = e.target.value
                    if (value === '' || /^\d+$/.test(value)) {
                      setCedula(value)
                    }
                  }}
                  required
                  placeholder="Ej: 123456789"
                  inputMode="numeric"
                  error={error && cedula === '' ? error : ''}
                />
              </FormGroup>

              {/* Campo de Contraseña - Alineado a la izquierda */}
              <FormGroup
                label="Contraseña"
                htmlFor="password"
                error={error && password === '' ? error : ''}
                labelClassName="text-neutral-700 text-left w-full"
              >
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  showPasswordToggle={true}
                  error={error && password === '' ? error : ''}
                  className="font-body"
                />
              </FormGroup>

              {/* Enlace de Olvidó Contraseña - Mantenido en azul estándar, alineado a la derecha */}
              <div className="text-right">
                <a
                  href="/forgot-password"
                  className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
                >
                  ¿Olvidaste tu contraseña?
                </a>
              </div>

              {/* Mensaje de error general del formulario */}
              {error && (
                <p
                  className="text-error-DEFAULT text-sm mt-4 font-body"
                  role="alert"
                >
                  {error}
                </p>
              )}

              {/* Botón de Iniciar Sesión - Con color de fondo sólido azul forzado */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                loading={loading}
                disabled={loading}
                size="lg"
              >
                Iniciar Sesión
              </Button>
            </form>
            {/* Sección de Registro Demo - Enlace en azul estándar */}
            <div className="mt-8 text-neutral-700 font-body">
              ¿Aún no tienes una cuenta?{' '}
              <a
                href="/registro-publico"
                className="font-medium text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                Crea una aquí (Demo)
              </a>
            </div>
            {/* Botón de Regresar - Descomentado y añadido */}
            <BackButton onClick={handleGoBack} className="w-full mt-4" />
          </div>{' '}
          {/* Fin de la sección del formulario con fondo blanco */}
        </div>{' '}
        {/* Fin del contenedor principal del formulario con sombra */}
      </div>{' '}
      {/* Fin de la Columna Derecha */}
    </div>
  )
}
