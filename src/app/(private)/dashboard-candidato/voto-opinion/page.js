import React from 'react'

// --- SIMULACIÓN DE DATOS ---
const clientesPotenciales = [
  {
    id: 'cli-001',
    nombre: 'Ana García',
    email: 'ana.garcia@email.com',
    telefono: '310 123 4567',
    mensaje:
      'Hola, estoy interesada en sus servicios de rotulación de vehículos. ¿Podrían darme más información sobre los precios?',
    fecha: '2025-07-03',
  },
  {
    id: 'cli-002',
    nombre: 'Carlos Martinez',
    email: 'c.martinez@empresa.co',
    telefono: '320 987 6543',
    mensaje:
      'Necesito una cotización para 1000 tarjetas de presentación y 5 pendones. Gracias.',
    fecha: '2025-07-02',
  },
  {
    id: 'cli-003',
    nombre: 'Sofía Rodríguez',
    email: 'sofia.r@dominio.com',
    telefono: '300 555 8899',
    mensaje:
      'Quisiera saber si ofrecen diseño de sitios web para pequeñas empresas. Me gustaría ver su portafolio.',
    fecha: '2025-07-01',
  },
  {
    id: 'cli-004',
    nombre: 'Javier Gómez',
    email: 'javier.gomez@email.net',
    telefono: '315 222 1133',
    mensaje: 'Información sobre impresión en gorras y camisetas por favor.',
    fecha: '2025-06-30',
  },
]

export default function ClientesPotencialesPage() {
  return (
    // Contenedor principal con fondo gris claro y padding
    <main className="bg-gray-100 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 border-b-2 border-gray-200 pb-3 mb-2">
          Clientes Potenciales
        </h1>
        <p className="text-md text-gray-600 mb-8">
          Contactos recibidos desde el formulario web.
        </p>

        {/* Grid responsive para las tarjetas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientesPotenciales.map((cliente) => (
            // Tarjeta de cliente
            <div
              key={cliente.id}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col"
            >
              {/* Encabezado de la tarjeta */}
              <div className="flex justify-between items-center p-4 border-b border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  {cliente.nombre}
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                  {new Date(cliente.fecha).toLocaleDateString('es-CO')}
                </span>
              </div>

              {/* Cuerpo de la tarjeta */}
              <div className="p-4 flex-grow">
                <p className="text-sm text-gray-700 mb-2">
                  <strong className="font-medium text-gray-800">Email:</strong>{' '}
                  {cliente.email}
                </p>
                <p className="text-sm text-gray-700 mb-4">
                  <strong className="font-medium text-gray-800">
                    Teléfono:
                  </strong>{' '}
                  {cliente.telefono}
                </p>

                {/* Caja para el mensaje */}
                <div className="mt-2 p-3 bg-gray-50 rounded-md border border-gray-200 h-full">
                  <p className="text-sm font-medium text-gray-800">Mensaje:</p>
                  <p className="text-sm text-gray-600 italic mt-1">
                    {cliente.mensaje}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
