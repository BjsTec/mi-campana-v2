// src/components/landing/HeroSection.js
import Link from 'next/link';

export default function HeroSection() {
  return (
    <div className="bg-primary"> {/* Fondo azul oscuro */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        {/* Fondo degradado sutil (opcional, ajustar colores) */}
        <div
          className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-neutral-lightest sm:text-6xl"> {/* Texto blanco */}
              Organiza tu Campaña Política al Siguiente Nivel
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-light"> {/* Texto gris claro */}
              Gestiona tu equipo, moviliza votantes y analiza resultados con nuestra plataforma integral.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/registro-publico" // O la ruta correcta para registrarse
                className="rounded-md bg-secondary px-3.5 py-2.5 text-sm font-semibold text-primary shadow-sm hover:bg-secondary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-secondary" // Botón dorado, texto azul oscuro
              >
                Empezar Ahora
              </Link>
              <Link href="#features" className="text-sm font-semibold leading-6 text-neutral-lightest hover:text-secondary-light"> {/* Texto blanco, hover dorado */}
                Saber Más <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
         {/* Continuación del degradado (opcional) */}
        <div
          className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]"
          aria-hidden="true"
        >
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>
    </div>
  );
}