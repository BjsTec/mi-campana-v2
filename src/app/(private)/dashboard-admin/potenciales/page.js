import React from 'react'
import styles from './page.module.css'

// --- SIMULACIÓN DE DATOS ---
// En una aplicación real, estos datos vendrían de una API (fetch)
// que se conecta a tu base de datos donde se guardan los formularios.
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

// --- La Página/Componente ---
export default function ClientesPotencialesPage() {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Clientes Potenciales</h1>
      <p className={styles.subtitle}>
        Estos son los contactos recibidos desde el formulario web.
      </p>

      {/* Contenedor de la lista de clientes */}
      <div className={styles.grid}>
        {clientesPotenciales.map((cliente) => (
          <div key={cliente.id} className={styles.card}>
            <div className={styles.cardHeader}>
              <h3>{cliente.nombre}</h3>
              <span>{new Date(cliente.fecha).toLocaleDateString('es-CO')}</span>
            </div>
            <div className={styles.cardBody}>
              <p>
                <strong>Email:</strong> {cliente.email}
              </p>
              <p>
                <strong>Teléfono:</strong> {cliente.telefono}
              </p>
              <div className={styles.messageBox}>
                <p>
                  <strong>Mensaje:</strong>
                </p>
                <p>{cliente.mensaje}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
