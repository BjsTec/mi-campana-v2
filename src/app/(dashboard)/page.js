// src/app/(dashboard)/page.js
// Esta es la página principal de tu sección /dashboard.

// Al igual que otros componentes de página en el App Router de Next.js,
// este es un Server Component por defecto.
// Si necesitas interactividad (por ejemplo, usar useState o useEffect),
// puedes añadir la directiva 'use client' al inicio de este archivo
// o importar componentes hijos que usen 'use client'.

export default function DashboardPage() {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <h1>¡Bienvenido a tu Panel de Control!</h1>
      <p>Esta es la página de inicio de tu dashboard.</p>
      <p>Aquí puedes empezar a mostrar un resumen de tus datos, estadísticas, etc.</p>
    </div>
  );
}
