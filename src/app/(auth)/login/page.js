// src/app/(auth)/login/page.js
// Esta es la página de inicio de sesión básica para los usuarios.

'use client' // Directiva esencial para un componente de cliente en Next.js App Router.
// Permite el uso de hooks como useState, useEffect y maneja la interactividad.

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-4">
          Iniciar Sesión
        </h1>
        <p className="text-gray-600">¡Página de login básica funcionando!</p>
        <p className="text-gray-600">
          Aquí irá tu formulario de inicio de sesión.
        </p>
      </div>
    </div>
  )
}
