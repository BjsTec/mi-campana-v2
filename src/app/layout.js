// src/app/layout.js
import { Montserrat, Open_Sans } from 'next/font/google'
import './../styles/globals.css' // Ruta a su globals.css corregido
import { Toaster } from 'sonner' 

// Configuración de fuentes para que coincidan con su intención
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat', // Variable CSS para títulos
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans', // Variable CSS para el cuerpo
  display: 'swap',
})

export const metadata = {
  title: 'Mi Campaña V2',
  description: 'Plataforma integral para la gestión de campañas políticas.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/* Se aplican las variables de fuente y las clases de Tailwind base.
        - bg-neutral-lightest: (Casi blanco) para el fondo.
        - text-neutral-darkest: (Casi negro) para el texto por defecto.
        - font-sans: Usa Open Sans por defecto.
      */}
      <body
        className={`${montserrat.variable} ${openSans.variable} font-sans bg-neutral-lightest text-neutral-darkest`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}