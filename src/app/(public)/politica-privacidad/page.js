import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'

const PoliticaDePrivacidadPage = () => {
  return (
    <>
      <Head>
        <title>Política de Privacidad - Autoridad Política</title>
        <meta
          name="description"
          content="Política de privacidad de la plataforma Mi Campaña v2."
        />
      </Head>

      <div className="min-h-screen bg-gray-50 text-gray-800">
        {/* Encabezado con Logo y Botón de Retorno */}
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 transition-transform duration-300 hover:scale-105"
            >
              <Image
                src="/icon-autoridad.png"
                alt="Autoridad Política Logo"
                width={120}
                height={20}
              />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-dark hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-DEFAULT transition-colors"
            >
              <ChevronLeftIcon className="h-4 w-4 mr-2" aria-hidden="true" />
              <span>Volver a la Página de Inicio</span>
            </Link>
          </div>
        </header>

        {/* Contenido Principal */}
        <main className="container mx-auto px-6 py-12 md:py-16">
          <div className="max-w-4xl mx-auto bg-white p-8 md:p-12 rounded-lg shadow-lg">
            <h1 className="text-4xl font-bold text-center text-primary-dark mb-6">
              Política de Privacidad
            </h1>
            <p className="text-center text-gray-500 mb-12">
              Última actualización: 11 de Agosto de 2025
            </p>

            {/* Sección 1: Información que Recopilamos */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-DEFAULT mb-3">
                1. Información que Recopilamos
              </h2>
              <p className="leading-relaxed mb-4">
                Recopilamos información para proporcionar y mejorar nuestros
                servicios de gestión de campañas electorales. El tipo de
                información recopilada depende de su rol en la Plataforma:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>
                  **Datos de Registro:** Cuando se registra, solicitamos
                  información como su nombre, correo electrónico, número de
                  cédula, teléfono, y una contraseña. [cite_start]Estos datos
                  son almacenados en Firestore y autenticados con Firebase
                  Authentication[cite: 9, 11, 24].
                </li>
                <li>
                  [cite_start]**Datos de Campaña:** Para los Candidatos,
                  recopilamos detalles de la campaña, tipo, plan de precios y
                  fecha de elección[cite: 37, 426].
                </li>
                <li>
                  [cite_start]**Datos de Pirámide:** La Plataforma almacena la
                  estructura jerárquica, vinculando a los usuarios con un
                  "padre" en la pirámide (`parentUid`)[cite: 59, 265].
                </li>
                <li>
                  **Geolocalización y Fotografía:** Para el módulo de
                  escrutinio, recopilamos datos de geolocalización y fotografías
                  como evidencia de los resultados de votación. [cite_start]Esta
                  información es crucial para la integridad del escrutinio[cite:
                  11111111111111111111111111111111, 523, 526].
                </li>
                <li>
                  **Datos de Uso:** Utilizamos herramientas para monitorear cómo
                  interactúa con la Plataforma, con el fin de optimizar el
                  rendimiento y la experiencia del usuario.
                </li>
              </ul>
            </div>

            {/* Sección 2: Uso de la Información */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-DEFAULT mb-3">
                2. Uso de la Información
              </h2>
              <p className="leading-relaxed">
                La información que recopilamos se utiliza para:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>
                  [cite_start]Gestionar su campaña electoral y la estructura de
                  la pirámide[cite: 3, 59].
                </li>
                <li>
                  [cite_start]Autenticar a los usuarios y garantizar el acceso
                  seguro a la Plataforma[cite: 11, 13, 19].
                </li>
                <li>
                  [cite_start]Proporcionar métricas y resultados en tiempo real
                  para la toma de decisiones[cite: 4,
                  11111111111111111111111111111111].
                </li>
                <li>
                  Comunicarnos con usted sobre actualizaciones, funcionalidades
                  y soporte.
                </li>
                <li>
                  [cite_start]Analizar y mejorar la funcionalidad y el
                  rendimiento de la Plataforma[cite: 5].
                </li>
              </ul>
            </div>

            {/* Sección 3: Compartir y Divulgar la Información */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-DEFAULT mb-3">
                3. Compartir y Divulgar la Información
              </h2>
              <p className="leading-relaxed">
                No vendemos ni alquilamos su información personal a terceros.
                Podemos compartir su información con:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>
                  **Miembros de su Campaña:** Los datos de los votantes,
                  gerentes y anillos son visibles para sus superiores directos
                  en la pirámide (Candidato, Gerente, etc.).
                </li>
                <li>
                  [cite_start]**Proveedores de Servicios:** Para operar el
                  backend de la Plataforma, utilizamos servicios de terceros
                  como Firebase[cite: 7, 8, 9].
                </li>
                <li>
                  **Requisitos Legales:** Si lo exige la ley, podemos divulgar
                  su información para cumplir con procesos legales.
                </li>
              </ul>
            </div>

            {/* Sección 4: Seguridad de los Datos */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-DEFAULT mb-3">
                4. Seguridad de los Datos
              </h2>
              <p className="leading-relaxed">
                Hemos implementado medidas de seguridad robustas para proteger
                su información. [cite_start]La autenticación se realiza mediante
                JWT (JSON Web Tokens), y las contraseñas se almacenan con
                hashing (`bcryptjs`)[cite: 12, 13, 19]. Sin embargo, ninguna
                transmisión por internet es 100% segura. Usted es responsable de
                mantener la confidencialidad de su contraseña.
              </p>
            </div>

            {/* Sección 5: Sus Derechos */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-DEFAULT mb-3">
                5. Sus Derechos
              </h2>
              <p className="leading-relaxed">
                Usted tiene el derecho de acceder, corregir o eliminar su
                información personal. Puede actualizar su perfil utilizando la
                ruta `updateUserProfile` o contactar a su administrador de
                campaña para solicitar cambios.
              </p>
            </div>

            {/* Sección 6: Cambios a esta Política de Privacidad */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-DEFAULT mb-3">
                6. Cambios a esta Política de Privacidad
              </h2>
              <p className="leading-relaxed">
                Podemos actualizar esta política ocasionalmente. Si realizamos
                cambios significativos, le notificaremos a través de la
                Plataforma o por otros medios. El uso continuado de la
                Plataforma después de cualquier cambio indica su aceptación de
                la política revisada.
              </p>
            </div>
          </div>
          <div className="border-t border-neutral-700 mt-8 pt-8 text-center text-black-400 text-sm">
            &copy; {new Date().getFullYear()} Autoridad Política. Todos los
            derechos reservados.
          </div>
        </main>
      </div>
    </>
  )
}

export default PoliticaDePrivacidadPage
