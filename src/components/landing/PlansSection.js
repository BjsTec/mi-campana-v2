// src/components/landing/PlansSection.js
import { CheckIcon } from '@heroicons/react/20/solid'; // Icono sólido
import Link from 'next/link';

// Definir los planes aquí o importarlos desde una fuente de datos
const tiers = [
  {
    name: 'Demo Limitado',
    id: 'demo_limitado',
    href: '/registro-publico?plan=demo', // Ajustar ruta
    priceMonthly: '$0',
    description: 'Prueba las funciones básicas por tiempo limitado.',
    features: [
      '1 Campaña (Demo)',
      '1 Gerente, 1 Anillo',
      'Profundidad Pirámide: 3 Niveles',
      'Reclutamiento Directo: 3 por Usuario',
      'Duración: 30 Días',
      'Soporte Básico',
    ],
    mostPopular: false,
  },
  {
    name: 'Equipo de Trabajo',
    id: 'equipo_trabajo',
    href: '/registro-publico?plan=gratis', // Ajustar ruta
    priceMonthly: '$0',
    description: 'Ideal para iniciar y organizar tu núcleo cercano.',
    features: [
      '1 Campaña (Equipo Trabajo)',
      'Miembros Limitados (ej. 10)', // O basado en DB
      'Profundidad Pirámide: 5 Niveles',
      'Reclutamiento Directo: 4 por Usuario',
      'Sin Límite de Tiempo',
      'Soporte Comunitario',
    ],
    mostPopular: true, // Marcar el plan gratuito como popular
  },
  {
    name: 'Plan Local (Edil/Concejo)',
    id: 'local',
    href: '/registro-publico?plan=local', // Ajustar ruta
    priceMonthly: '$XX', // Reemplazar con precio real
    description: 'Completo para campañas municipales o locales.',
    features: [
      'Campañas Locales (Edil, Concejo)',
      'Mayor Límite de Miembros',
      'Mayor Profundidad Pirámide',
      'Funciones IA Básicas',
      'Formulario Público Básico',
      'Soporte Prioritario',
    ],
    mostPopular: false,
  },
  // Añadir más planes (Alcaldía, Gobernación, Nacional, etc.)
];

export default function PlansSection() {
  return (
    <div id="plans" className="bg-neutral-lightest py-24 sm:py-32"> {/* Fondo gris casi blanco */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-base font-semibold leading-7 text-secondary-dark"> {/* Dorado oscuro */}
            Precios
          </h2>
          <p className="mt-2 text-4xl font-bold tracking-tight text-primary-dark sm:text-5xl"> {/* Azul muy oscuro */}
            Elige el plan perfecto para tu campaña
          </p>
        </div>
        <p className="mx-auto mt-6 max-w-2xl text-center text-lg leading-8 text-neutral-dark"> {/* Gris oscuro azulado */}
          Desde equipos pequeños hasta campañas nacionales, tenemos una opción para ti. Empieza gratis hoy mismo.
        </p>
        <div className="isolate mx-auto mt-16 grid max-w-md grid-cols-1 gap-y-8 sm:mt-20 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {tiers.map((tier, tierIdx) => (
            <div
              key={tier.id}
              className={`flex flex-col justify-between rounded-3xl p-8 ring-1 xl:p-10 ${
                tier.mostPopular ? 'bg-white ring-2 ring-secondary' : 'bg-white ring-neutral-medium' // Resaltar popular con borde dorado
              } ${tierIdx === 1 ? 'lg:z-10 lg:scale-105' : ''}`} // Hacer popular un poco más grande
            >
              <div>
                <h3 className={`text-lg font-semibold leading-8 ${tier.mostPopular ? 'text-secondary' : 'text-primary-dark'}`}> {/* Título dorado si es popular */}
                  {tier.name}
                </h3>
                <p className="mt-4 text-sm leading-6 text-neutral-dark"> {/* Gris oscuro azulado */}
                  {tier.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold tracking-tight text-primary-dark"> {/* Azul muy oscuro */}
                    {tier.priceMonthly}
                  </span>
                   { tier.priceMonthly !== '$0' && (
                     <span className="text-sm font-semibold leading-6 text-neutral-dark">/mes</span>
                   )}
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-neutral-dark xl:mt-10"> {/* Gris oscuro azulado */}
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckIcon className="h-6 w-5 flex-none text-secondary" aria-hidden="true" /> {/* Icono check dorado */}
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={tier.href}
                aria-describedby={tier.id}
                className={`mt-8 block rounded-md px-3.5 py-2.5 text-center text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  tier.mostPopular
                    ? 'bg-secondary text-primary hover:bg-secondary-light focus-visible:outline-secondary' // Botón popular dorado
                    : 'bg-primary text-neutral-lightest hover:bg-primary-light focus-visible:outline-primary' // Botón normal azul oscuro
                }`}
              >
                {tier.priceMonthly === '$0' ? 'Empezar Gratis' : 'Seleccionar Plan'}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}