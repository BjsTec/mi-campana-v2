// src/components/landing/FeaturesSection.js
import { ArrowPathIcon, CloudArrowUpIcon, FingerPrintIcon, LockClosedIcon, UsersIcon, ChartBarIcon } from '@heroicons/react/24/outline'; // Ajusta iconos si es necesario

const features = [
  {
    name: 'Estructura Piramidal',
    description: 'Organiza tu equipo de campaña eficientemente con nuestra estructura jerárquica intuitiva.',
    icon: UsersIcon,
  },
  {
    name: 'Gestión de Potenciales',
    description: 'Registra, asigna y haz seguimiento a tus votantes potenciales desde un solo lugar.',
    icon: ArrowPathIcon, // O un icono más representativo de leads
  },
  {
    name: 'Escrutinio Digital',
    description: 'Coordina a tus escrutadores y recibe resultados en tiempo real el día de la elección con fotos de soporte.',
    icon: CloudArrowUpIcon, // O un icono de votación/urna
  },
   {
    name: 'Análisis y Métricas',
    description: 'Visualiza el crecimiento de tu red, compara promesas vs realidad y mide la efectividad de tu campaña.',
    icon: ChartBarIcon,
  },
   {
    name: 'Seguridad Robusta',
    description: 'Protegemos tus datos con los más altos estándares de seguridad y control de acceso basado en roles.',
    icon: LockClosedIcon,
  },
   {
    name: 'Acceso Controlado',
    description: 'Autenticación segura y permisos detallados para garantizar que cada miembro vea solo lo necesario.',
    icon: FingerPrintIcon, // O un icono de permisos
  },
];

export default function FeaturesSection() {
  return (
    <div id="features" className="bg-white py-24 sm:py-32"> {/* Fondo blanco */}
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-secondary-dark"> {/* Texto dorado oscuro */}
            Todo lo que necesitas
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight text-primary-dark sm:text-4xl"> {/* Texto azul muy oscuro */}
            Potencia tu Estrategia Política
          </p>
          <p className="mt-6 text-lg leading-8 text-neutral-dark"> {/* Texto gris oscuro azulado */}
            Nuestra plataforma te brinda las herramientas para organizar, movilizar y analizar tu campaña de manera efectiva.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            {features.map((feature) => (
              <div key={feature.name} className="relative pl-16">
                <dt className="text-base font-semibold leading-7 text-primary-dark"> {/* Texto azul muy oscuro */}
                  <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-secondary"> {/* Fondo icono dorado */}
                    <feature.icon className="h-6 w-6 text-primary" aria-hidden="true" /> {/* Icono azul oscuro */}
                  </div>
                  {feature.name}
                </dt>
                <dd className="mt-2 text-base leading-7 text-neutral-dark"> {/* Texto gris oscuro azulado */}
                  {feature.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}