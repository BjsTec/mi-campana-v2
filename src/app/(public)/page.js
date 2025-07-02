// src/app/(public)/page.js
// Este es un Server Component por defecto, no necesita 'use client' a menos que uses hooks.

import Link from 'next/link' // Importa el componente Link de Next.js

export default function HomePage() {
  return (
    <div
      className="p-10 text-center bg-gray-50 min-h-screen flex flex-col justify-center items-center"
      // Equivalente a:
      // padding: '40px',          -> p-10 (40px)
      // textAlign: 'center',      -> text-center
      // backgroundColor: '#f9f9f9', -> bg-gray-50 (tono de gris muy claro de Tailwind)
      // minHeight: '100vh',       -> min-h-screen
      // display: 'flex',          -> flex
      // flexDirection: 'column',  -> flex-col
      // justifyContent: 'center', -> justify-center
      // alignItems: 'center',     -> items-center
    >
      <h1 className="text-5xl font-extrabold text-gray-800 mb-5">
        {/* Equivalente a: fontSize: '3rem' (48px) -> text-5xl, color: '#333' -> text-gray-800 */}
        ¡Bienvenido a La Campaña!
      </h1>
      <p className="text-xl text-gray-600">
        {/* Equivalente a: fontSize: '1.2rem' (19.2px) -> text-xl, color: '#666' -> text-gray-600 */}
        Descubre lo que La Campaña tiene para ofrecerte.
      </p>
      <p className="mt-8">
        {/* Equivalente a: marginTop: '20px' -> mt-8 */}
        <Link
          href="/login"
          className="text-primary-dark hover:text-primary-light font-bold text-lg px-6 py-3 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          // Equivalente a:
          // textDecoration: 'none',   -> (implícito con botones/links modernos)
          // color: '#0070f3',         -> text-primary-dark (usando tu color primario)
          // fontWeight: 'bold',       -> font-bold
          // (Añadí estilos de botón para un mejor CTA, usando tus colores primarios)
        >
          Ir a Iniciar Sesión
        </Link>
      </p>
    </div>
  )
}
