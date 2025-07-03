import React from 'react'
import Image from 'next/image'
import testImage from '@/assets/test.jpg' // Importamos la imagen local desde la carpeta assets

// Define cuántas veces quieres que se repita la imagen para llenar la galería
const numeroDeImagenes = 9

export default function GaleriaPage() {
  return (
    <main className="bg-gray-100 min-h-screen">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight text-center mb-12">
          Mockup de Galería
        </h1>

        {/* Contenedor de la galería con un grid responsivo.
          - 1 columna en pantallas pequeñas (por defecto)
          - 2 columnas en pantallas medianas (sm:)
          - 3 columnas en pantallas grandes (md:)
        */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {/* Creamos un array vacío con el largo definido y lo mapeamos para renderizar cada imagen */}
          {Array.from({ length: numeroDeImagenes }).map((_, index) => (
            // Contenedor para cada imagen de la galería
            <div
              key={index}
              className="relative rounded-lg overflow-hidden shadow-md aspect-[5/3]"
            >
              <Image
                src={testImage} // Usamos la imagen importada
                alt={`Imagen de prueba ${index + 1}`}
                layout="fill" // La imagen llena el contenedor padre
                objectFit="cover" // Cubre todo el espacio sin deformarse
                className="transform hover:scale-105 transition-transform duration-300 ease-in-out"
              />
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
