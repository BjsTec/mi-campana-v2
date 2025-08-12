import React from 'react'
import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-primary-dark text-neutral-50 py-12">
      <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
        {/* Columna 1: Logo y Descripción */}
        <div className="text-center md:text-left flex flex-col items-center md:items-start">
          <Link href="/" className="inline-block mb-4">
            <Image
              src="/logo.png"
              alt="Autoridad Política Logo"
              width={150}
              height={50}
              className="transition-transform duration-300 hover:scale-105"
            />
          </Link>
          <p className="mt-2 text-neutral-300 max-w-sm leading-relaxed">
            La plataforma líder para la gestión estratégica de campañas
            políticas. Optimiza tu alcance, organiza tu equipo y maximiza tu
            impacto.
          </p>
        </div>

        {/* Columna 2: Enlaces Rápidos */}
        <div className="text-center md:text-left mt-8 md:mt-0">
          <h3 className="text-xl font-semibold mb-4 text-neutral-50">
            Enlaces Rápidos
          </h3>
          <ul className="space-y-2 text-neutral-300">
            <li>
              <Link
                href="#inicio"
                className="hover:text-secondary-DEFAULT transition-colors duration-200"
              >
                Inicio
              </Link>
            </li>
            <li>
              <Link
                href="#caracteristicas"
                className="hover:text-secondary-DEFAULT transition-colors duration-200"
              >
                Características
              </Link>
            </li>
            <li>
              <Link
                href="#planes"
                className="hover:text-secondary-DEFAULT transition-colors duration-200"
              >
                Planes y Precios
              </Link>
            </li>
            <li>
              <Link
                href="#app-movil"
                className="hover:text-secondary-DEFAULT transition-colors duration-200"
              >
                App Móvil
              </Link>
            </li>
            <li>
              <Link
                href="#contacto"
                className="hover:text-secondary-DEFAULT transition-colors duration-200"
              >
                Contacto
              </Link>
            </li>
            <li>
              <Link
                href="/politica-privacidad"
                className="hover:text-secondary-DEFAULT transition-colors duration-200"
              >
                Política de Privacidad
              </Link>
            </li>
            <li>
              <Link
                href="/terminos-servicio"
                className="hover:text-secondary-DEFAULT transition-colors duration-200"
              >
                Términos de Servicio
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Contacto y Redes Sociales */}
        <div className="text-center md:text-left mt-8 md:mt-0">
          <h3 className="text-xl font-semibold mb-4 text-neutral-50">
            Contáctanos
          </h3>
          <p className="text-neutral-300 mb-2">
            Email:{' '}
            <a
              href="mailto:info@autoridadpolitica.com"
              className="hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              info@autoridadpolitica.com
            </a>
          </p>
          <p className="text-neutral-300 mb-6">
            Teléfono:{' '}
            <a
              href="tel:+573001234567"
              className="hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              +57 300 123 4567
            </a>{' '}
            (Ejemplo)
          </p>

          {/* Iconos de Redes Sociales */}
          <div className="flex justify-center md:justify-start space-x-4">
            {/* Facebook Icon */}
            <a
              href="https://facebook.com/autoridadpolitica"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Síguenos en Facebook"
              className="text-neutral-50 hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm3 8h-1.5c-.828 0-1.5.672-1.5 1.5V12h3l-.5 3h-2.5v7h-3v-7h-2v-3h2v-2c0-1.657 1.343-3 3-3h3V8z" />
              </svg>
            </a>
            {/* Instagram Icon */}
            <a
              href="https://instagram.com/autoridadpolitica"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Síguenos en Instagram"
              className="text-neutral-50 hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 2.16c3.15 0 3.53.012 4.77.072 1.2.06 1.83.25 2.22.408.4.168.66.36.9.6.24.24.432.5.6.9.168.4.348 1.02.408 2.22.06 1.24.072 1.62.072 4.77s-.012 3.53-.072 4.77c-.06 1.2-.25 1.83-.408 2.22-.168.4-.36.66-.6.9-.24.24-.5.432-.9.6-.4.168-1.02.348-2.22.408-1.24.06-1.62.072-4.77.072s-3.53-.012-4.77-.072c-1.2-.06-1.83-.25-2.22-.408-.4-.168-.66-.36-.9-.6-.24-.24-.5-.432-.9-.6-.168-.4-.348-1.02-.408-2.22-.06-1.24-.072-1.62-.072-4.77s.012-3.53.072-4.77c.06-1.2.25-1.83.408-2.22.168-.4.36-.66.6-.9.24-.24.5-.432.9-.6.4-.168 1.02-.348 2.22-.408C8.47 2.172 8.85 2.16 12 2.16zm0 3.6c-3.46 0-6.26 2.8-6.26 6.26s2.8 6.26 6.26 6.26 6.26-2.8 6.26-6.26-2.8-6.26-6.26-6.26zm0 2.1c2.3 0 4.16 1.86 4.16 4.16s-1.86 4.16-4.16 4.16-4.16-1.86-4.16-4.16 1.86-4.16 4.16-4.16zm5.25-5.25c.57 0 1.03.46 1.03 1.03s-.46 1.03-1.03 1.03-1.03-.46-1.03-1.03.46-1.03 1.03-1.03z" />
              </svg>
            </a>
            {/* TikTok Icon */}
            <a
              href="https://www.tiktok.com/@autoridadpolitica"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Síguenos en TikTok"
              className="text-neutral-50 hover:text-secondary-DEFAULT transition-colors duration-200"
            >
              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525 3.085c.319.055.65.086.988.086C17.59 3.171 21 6.58 21 11.101c0 4.52-3.41 7.93-7.485 8.03-3.19.078-6.13-2.122-6.434-5.314-.028-.298-.014-.597.04-.886.075-.29.164-.58.265-.872a.816.816 0 00-.733-.651c-2.072.23-4.144-.61-5.748-2.071-.39-.29-.66-.683-.76-1.102-.024-.093-.01-.186.014-.279l.154-1.07c.196-1.368 1.202-2.415 2.535-2.535 1.329-.119 2.48-.905 2.599-2.234.02-.22-.007-.44-.04-.659-.047-.28-.135-.54-.255-.778a.795.795 0 00.684-.575c.226-.346.39-.727.46-1.134.027-.164.04-.328.04-.492 0-.164-.013-.328-.04-.492-.069-.407-.26-.775-.57-1.092-1.154-1.11-2.553-.836-3.49-.23-.937.607-1.39 1.76-1.023 2.71a9.358 9.358 0 001.655 2.197c.31.27.65.503 1.005.695.142.073.286.14.43.203.29.123.6.184.91.184.31 0 .62-.06.91-.184a1.021 1.021 0 00.43-.203 9.358 9.358 0 001.655-2.197c.367-.95 1.807-1.44 2.96-1.023 1.154.407 2.553.68 3.49 1.297.32.286.51.654.57 1.092.027.164.04.328.04.492 0 .164-.013.328-.04.492-.07.407-.234.788-.46 1.134a.795.795 0 00-.684.575c-.12.238-.208.498-.255.778-.033.22-.06.44-.04.659.12.328 1.271 1.352 2.599 1.234 1.333-.12 2.339-1.167 2.535-2.535l.154-1.07c.024-.093.037-.186.014-.279-.1-.419-.37-.812-.76-1.102a8.175 8.175 0 00-2.614-1.39.816.816 0 00-.733.651c.101.292.19.582.265.872.054.29.068.589.04.886-.305 3.192-3.243 5.392-6.434 5.314-4.075-.101-7.485-4.51-7.485-9.03 0-4.52 3.41-7.929 7.485-7.929.338 0 .669.031.988.086z" />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-neutral-400 text-sm">
        &copy; {new Date().getFullYear()} Autoridad Política. Todos los derechos
        reservados.
      </div>
    </footer>
  )
}
