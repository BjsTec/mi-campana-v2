// src/app/layout.js
import { Montserrat, Open_Sans } from 'next/font/google'
import './../styles/globals.css'
import { Toaster } from 'sonner' // Esto está en su package.json, está bien.

// Configuración de fuentes
const montserrat = Montserrat({
  subsets: ['latin'],
  variable: '--font-montserrat',
  display: 'swap',
})

const openSans = Open_Sans({
  subsets: ['latin'],
  variable: '--font-open-sans',
  display: 'swap',
})

export const metadata = {
  title: 'Mi Campaña V2',
  description: 'Plataforma integral para la gestión de campañas políticas.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      {/*
        ORDEN EJECUTADA:
        1. Se cambia el fondo de 'bg-neutral-lightest' (blanco) a 'bg-primary-dark' (su azul más oscuro).
        2. Se cambia el texto por defecto de 'text-neutral-darkest' (negro) a 'text-neutral-lightest' (blanco).
        Esto implementa su visión de "fondo oscuro".
      */}
      <body
        className={`${montserrat.variable} ${openSans.variable} font-sans bg-primary-dark text-neutral-lightest`}
      >
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  )
}