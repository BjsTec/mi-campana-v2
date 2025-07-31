// src/app/layout.js
import { Montserrat, Open_Sans } from 'next/font/google' // Importar las fuentes seleccionadas
import { AuthProvider } from '@/context/AuthContext'
import '../styles/globals.css' // Ruta corregida para globals.css

// Configura Montserrat para títulos
const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap', // Para mejor rendimiento de carga
  variable: '--font-montserrat', // Define una variable CSS para usar en Tailwind
})

// Configura Open Sans para el cuerpo del texto
const openSans = Open_Sans({
  subsets: ['latin'],
  display: 'swap', // Para mejor rendimiento de carga
  variable: '--font-open-sans', // Define una variable CSS para usar en Tailwind
})

export const metadata = {
  title: 'Autoridad Politica: El Juego de la Victoria Electoral', // Título actualizado
  description:
    'Aplicación web para la gestión eficiente de campañas electorales, organización de un equipo de trabajo politico y monitoreo de votos en tiempo real.', // Descripción más detallada para SEO

  // --- Metadatos para SEO y Redes Sociales ---
  metadataBase: new URL('https://www.autoridadpolitica.com'), // ¡TU DOMINIO AQUÍ!
  openGraph: {
    title: 'Autoridad Politica: El Juego de la Victoria Electoral',
    description:
      'Gestión estratégica y monitoreo de votos en tiempo real para la victoria electoral.',
    url: 'https://www.autoridadpolitica.com',
    siteName: 'Autoridad Politica',
    images: [
      {
        url: 'https://www.autoridadpolitica.com/og-image.jpg', // ¡REEMPLAZA ESTO! Ruta a una imagen de tu proyecto para compartir en redes
        width: 1200,
        height: 630,
        alt: 'Mi Campaña - Gestión Electoral',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: 'Mi Campaña: El Juego de la Victoria Electoral',
  //   description: 'La plataforma definitiva para la gestión de tu campaña electoral.',
  //   creator: '@tu_usuario_twitter', // ¡REEMPLAZA CON TU USUARIO DE TWITTER!
  //   images: ['https://www.autoridadpolitica.com/twitter-image.jpg'], // ¡REEMPLAZA ESTO! Ruta a una imagen para Twitter
  // },
  // --- Iconos y Manifiesto ---
  icons: {
    icon: '/favicon.ico', // Asegúrate de que favicon.ico esté en tu carpeta 'app' o 'public'
    shortcut: '/shortcut-icon.png',
    apple: '/apple-icon.png',
  },
  manifest: '/site.webmanifest', // Ruta a tu archivo webmanifest para PWA
  // --- Vista (Viewport) ---
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
  },
}

export default function RootLayout({ children }) {
  return (
    // Aplica las variables CSS de las fuentes a la etiqueta <html>
    <html lang="es" className={`${montserrat.variable} ${openSans.variable}`}>
      <head>
        {/* Aquí puedes añadir otros meta tags globales, enlaces a CDN de fuentes, etc. */}
      </head>
      <body>
        <AuthProvider>
          {children} {/* Envuelve tus children con AuthProvider */}
        </AuthProvider>
      </body>
    </html>
  )
}
