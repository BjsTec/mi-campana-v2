import { Inter } from 'next/font/google'

import { AuthProvider } from '@/context/AuthContext'
import '../styles/globals.css' // ¡RUTA CORREGIDA para globals.css!

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
  title: 'La Campaña', // Título general de la aplicación
  description: 'Aplicación web para La Campaña.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <head>
        {/* Aquí puedes añadir otros meta tags globales, enlaces a CDN de fuentes, etc. */}
      </head>
      <body className={inter.className}>
        <AuthProvider>
          {/* Envuelve tus children con AuthProvider */}
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
