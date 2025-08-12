// pages/terminos-y-condiciones.js
import React from 'react'
import Head from 'next/head'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeftIcon } from '@heroicons/react/24/outline'

const TerminosYCondicionesPage = () => {
  return (
    <>
      <Head>
        <title>Términos y Condiciones - Autoridad Política</title>
        <meta
          name="description"
          content="Términos y Condiciones de uso de la plataforma Mi Campaña v2."
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
              Términos y Condiciones de Uso
            </h1>
            <p className="text-center text-gray-500 mb-12">
              Última actualización: 11 de Agosto de 2025
            </p>

            {/* Sección 1: Aceptación de los Términos */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-DEFAULT mb-3">
                1. Aceptación de los Términos
              </h2>
              <p className="leading-relaxed">
                Al acceder y utilizar la plataforma "Mi Campaña v2" (en
                adelante, "la Plataforma"), usted acepta estar obligado por
                estos Términos y Condiciones de Uso (en adelante, "los
                Términos"). La Plataforma es un servicio digital de gestión
                electoral con una estructura de pirámide jerárquica: Candidato,
                Gerente, Anillo y Votante.
              </p>
            </div>

            {/* Sección 2: Roles y Responsabilidades */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-DEFAULT mb-3">
                2. Roles y Responsabilidades
              </h2>
              <p className="leading-relaxed mb-4">
                El acceso y las funcionalidades de la Plataforma varían según el
                rol asignado a cada usuario. Los roles principales son:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>
                  <strong>Candidato:</strong> Tiene acceso a una vista
                  consolidada de su campaña y puede hacer "drill-down" en los
                  niveles inferiores. Puede crear campañas y registrar a sus
                  subordinados.
                </li>
                <li>
                  <strong>Gerente, Anillo, Votante:</strong> Tienen acceso a las
                  funcionalidades de su nivel y campañas a las que pertenecen.
                  Pueden registrar votos directos y actualizar su propia
                  información de perfil.
                </li>
                <li>
                  <strong>public_lead:</strong> Usuario registrado como "Votante
                  de Opinión" sin acceso inmediato a la aplicación. Su acceso
                  está pendiente de confirmación por un miembro de la pirámide.
                </li>
              </ul>
            </div>

            {/* Sección 3: Uso y Propiedad de los Datos */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-DEFAULT mb-3">
                3. Uso y Propiedad de los Datos
              </h2>
              <p className="leading-relaxed">
                Usted es responsable de la exactitud y legalidad de la
                información que introduce en la Plataforma, especialmente en el
                registro de votantes. "Mi Campaña v2" utiliza bases de datos
                NoSQL como Firestore para almacenar información de usuarios,
                campañas y leads.
              </p>
            </div>

            {/* Sección 4: Flujos de Registro y Verificación */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-DEFAULT mb-3">
                4. Flujos de Registro y Verificación
              </h2>
              <p className="leading-relaxed mb-4">
                Existen diferentes métodos para registrarse en la Plataforma,
                cada uno con su propio flujo de usuario:
              </p>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>
                  **`registerPublicUser`:** Un formulario minimalista para
                  captar "leads" (Votantes de Opinión) sin acceso inmediato a la
                  aplicación.
                </li>
                <li>
                  **`registerUserViaQr`:** Un flujo de auto-registro con
                  validación inmediata, donde el usuario escanea un QR para
                  precargar la información de la campaña y del padre en la
                  pirámide, prometiendo acceso instantáneo.
                </li>
                <li>
                  **`createActiveUserAndMembership`:** Una interfaz
                  administrativa para que los usuarios de nivel superior
                  registren a sus subordinados, permitiendo la selección de rol
                  y la asignación intuitiva del padre (`parentUid`).
                </li>
              </ul>
            </div>

            {/* Sección 5: Limitaciones y Exclusividad */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-DEFAULT mb-3">
                5. Limitaciones y Exclusividad
              </h2>
              <ul className="list-disc list-inside space-y-2 leading-relaxed">
                <li>
                  **"Exclusividad Promesa de Voto"**: Un miembro de la pirámide
                  no puede registrar subordinados si tiene un valor de
                  `votoPromesa` mayor que 0 o si `canRegisterSubordinates` es
                  falso. La interfaz de usuario debe reflejar esta limitación,
                  deshabilitando las opciones de registro.
                </li>
                <li>
                  **Campañas Demo**: Las campañas de tipo "equipo_de_trabajo"
                  tienen límites de profundidad (5 niveles) y cantidad de roles
                  (ej. un Candidato puede tener 1 Gerente, 1 Anillo, 2
                  Votantes).
                </li>
              </ul>
            </div>

            {/* Sección 6: Manejo de Errores */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-DEFAULT mb-3">
                6. Manejo de Errores
              </h2>
              <p className="leading-relaxed">
                La Plataforma está diseñada para mostrar mensajes de error
                amigables en caso de fallos, traduciendo los códigos de error
                del backend (ej. `409 Conflict`, `403 Forbidden`) en
                notificaciones comprensibles para el usuario. Por ejemplo, si se
                intenta registrar una cédula que ya existe, se mostrará un
                mensaje indicando que el conflicto de datos ha ocurrido.
              </p>
            </div>

            {/* Sección 7: Funcionalidad de Escrutinio */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-DEFAULT mb-3">
                7. Funcionalidad de Escrutinio
              </h2>
              <p className="leading-relaxed">
                El formulario de `submitEscrutinioResult` en la aplicación móvil
                para el registro de votos requiere el uso de geolocalización y
                la cámara del dispositivo para obtener evidencia fotográfica.
                Este módulo solo se activará si la fecha del dispositivo
                coincide con la `electionDate` de la campaña (+/- 1 día).
              </p>
            </div>

            {/* Sección 8: Modificaciones de los Términos */}
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-primary-DEFAULT mb-3">
                8. Modificaciones de los Términos
              </h2>
              <p className="leading-relaxed">
                "Mi Campaña v2" se reserva el derecho de modificar estos
                Términos en cualquier momento. Se le notificará de cualquier
                cambio significativo y su uso continuado de la Plataforma
                constituirá su aceptación de los nuevos Términos.
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

export default TerminosYCondicionesPage
